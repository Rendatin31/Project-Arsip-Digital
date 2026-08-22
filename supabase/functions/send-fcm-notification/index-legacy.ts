// Supabase Edge Function to send FCM notifications
// Using FCM Legacy API with Server Key (much simpler than OAuth2!)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

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
    console.log('🔥 FCM Edge Function called (Legacy API)')

    // Get Firebase Server Key from environment
    const FIREBASE_SERVER_KEY = Deno.env.get('FIREBASE_SERVER_KEY')
    if (!FIREBASE_SERVER_KEY) {
      console.error('❌ FIREBASE_SERVER_KEY not configured')
      throw new Error('FIREBASE_SERVER_KEY not configured')
    }
    
    console.log('✅ Firebase Server Key found')

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

    // Prepare FCM Legacy API message
    const fcmMessage = {
      to: profile.fcm_token,
      priority: 'high',
      notification: {
        title: title,
        body: message,
        sound: 'default',
        android_channel_id: 'arsip_digital',
      },
      data: {
        type: type || 'notification',
        userId: userId,
        ...data,
      },
    }

    console.log('📤 Sending FCM notification via Legacy API...')

    // Send FCM notification via Legacy API
    const fcmResponse = await fetch(
      'https://fcm.googleapis.com/fcm/send',
      {
        method: 'POST',
        headers: {
          'Authorization': `key=${FIREBASE_SERVER_KEY}`,
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
      if (fcmResult.results && fcmResult.results[0]?.error === 'InvalidRegistration') {
        console.log('🗑️ Removing invalid FCM token from database')
        await supabase
          .from('profiles')
          .update({ fcm_token: null, fcm_token_updated_at: new Date().toISOString() })
          .eq('id', userId)
      }

      throw new Error(`FCM API error: ${JSON.stringify(fcmResult)}`)
    }

    // Check if message was sent successfully
    if (fcmResult.failure > 0) {
      console.error('❌ FCM message failed:', fcmResult)
      throw new Error(`FCM message failed: ${JSON.stringify(fcmResult)}`)
    }

    console.log('✅ FCM notification sent successfully!')

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: fcmResult.results[0]?.message_id,
        multicastId: fcmResult.multicast_id,
        userId,
        userName: profile.full_name,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error in FCM Edge Function:', error)
    console.error('❌ Error stack:', error.stack)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString(),
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
