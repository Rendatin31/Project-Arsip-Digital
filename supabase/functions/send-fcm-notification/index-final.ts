// Supabase Edge Function to send FCM notifications
// Final version using google-auth-library (official Google library)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { GoogleAuth } from 'https://esm.sh/google-auth-library@9.6.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  userId: string
  title: string
  message: string
  type: string
  data?: Record<string, any>
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔥 FCM Edge Function called (Final - google-auth-library)')

    // Get Firebase Service Account from environment
    const FIREBASE_SERVICE_ACCOUNT = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')
    if (!FIREBASE_SERVICE_ACCOUNT) {
      console.error('❌ FIREBASE_SERVICE_ACCOUNT not configured')
      throw new Error('FIREBASE_SERVICE_ACCOUNT not configured')
    }
    
    console.log('📦 Parsing Service Account JSON...')
    const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT)
    console.log('✅ Service Account parsed, project_id:', serviceAccount.project_id)
    
    const projectId = serviceAccount.project_id

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    console.log('📥 Parsing request body...')
    const payload: NotificationPayload = await req.json()
    console.log('📦 Payload received:', { userId: payload.userId, title: payload.title, type: payload.type })

    const { userId, title, message, type, data } = payload

    if (!userId || !title || !message) {
      console.error('❌ Missing required fields')
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, title, message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's FCM token from database
    console.log('🔍 Getting FCM token for user:', userId)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('fcm_token, full_name')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('❌ Error getting profile:', profileError)
      throw profileError
    }

    if (!profile?.fcm_token) {
      console.log('⚠️ No FCM token found for user:', userId)
      return new Response(
        JSON.stringify({ 
          error: 'No FCM token found for user',
          userId,
          info: 'User may not have logged in on mobile device yet'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ FCM token found:', profile.fcm_token.substring(0, 20) + '...')

    // Get OAuth2 access token using Google Auth Library
    console.log('🔐 Getting OAuth2 access token with google-auth-library...')
    
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    })
    
    const client = await auth.getClient()
    const accessToken = await client.getAccessToken()
    
    if (!accessToken.token) {
      console.error('❌ Failed to get access token')
      throw new Error('Failed to get OAuth2 access token')
    }
    
    console.log('✅ Access token obtained via google-auth-library')

    // Prepare FCM v1 message
    const fcmMessage = {
      message: {
        token: profile.fcm_token,
        notification: {
          title: title,
          body: message,
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            priority: 'high',
            channelId: 'arsip_digital',
          },
        },
        data: {
          type: type || 'notification',
          userId: userId,
          ...data,
        },
      },
    }

    console.log('📤 Sending FCM v1 message to Firebase...')

    // Send FCM notification via Firebase v1 API
    const fcmResponse = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fcmMessage),
      }
    )

    const fcmResult = await fcmResponse.json()
    console.log('📥 FCM Response status:', fcmResponse.status)
    console.log('📥 FCM Response:', fcmResult)

    if (!fcmResponse.ok) {
      console.error('❌ FCM API error:', fcmResult)
      
      // If token is invalid, remove it from database
      if (fcmResult.error?.status === 'NOT_FOUND' || fcmResult.error?.status === 'INVALID_ARGUMENT') {
        console.log('🗑️ Removing invalid FCM token from database')
        await supabase
          .from('profiles')
          .update({ fcm_token: null, fcm_token_updated_at: new Date().toISOString() })
          .eq('id', userId)
      }

      throw new Error(`FCM API error: ${JSON.stringify(fcmResult)}`)
    }

    console.log('✅ FCM notification sent successfully!')

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageName: fcmResult.name,
        userId,
        userName: profile.full_name,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error in FCM Edge Function:', error)
    console.error('❌ Error name:', error.name)
    console.error('❌ Error message:', error.message)
    if (error.stack) console.error('❌ Error stack:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        errorName: error.name,
        details: error.toString(),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
