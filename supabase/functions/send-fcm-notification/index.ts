// Supabase Edge Function to send FCM notifications
// This function sends push notifications via Firebase Cloud Messaging v1 API
// Works even when app is closed!

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

// Get OAuth2 access token for FCM v1 API
async function getAccessToken(serviceAccount: any): Promise<string> {
  const jwtHeader = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const now = Math.floor(Date.now() / 1000)
  const jwtClaimSet = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }
  const jwtClaimSetEncoded = btoa(JSON.stringify(jwtClaimSet)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  
  const signatureInput = `${jwtHeader}.${jwtClaimSetEncoded}`
  
  // Import private key
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    Uint8Array.from(atob(serviceAccount.private_key.replace(/-----BEGIN PRIVATE KEY-----/g, '').replace(/-----END PRIVATE KEY-----/g, '').replace(/\s/g, '')), c => c.charCodeAt(0)),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  // Sign
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, new TextEncoder().encode(signatureInput))
  const signatureEncoded = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  
  const jwt = `${signatureInput}.${signatureEncoded}`
  
  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })
  
  const tokenData = await tokenResponse.json()
  return tokenData.access_token
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔥 FCM Edge Function called')

    // Get Firebase Service Account from environment
    const FIREBASE_SERVICE_ACCOUNT = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')
    if (!FIREBASE_SERVICE_ACCOUNT) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT not configured')
    }

    const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT)
    const projectId = serviceAccount.project_id

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const payload: NotificationPayload = await req.json()
    console.log('📦 Payload:', { ...payload, data: '...' })

    const { userId, title, message, type, data } = payload

    if (!userId || !title || !message) {
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

    // Get OAuth2 access token
    console.log('🔐 Getting OAuth2 access token...')
    const accessToken = await getAccessToken(serviceAccount)
    console.log('✅ Access token obtained')

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
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fcmMessage),
      }
    )

    const fcmResult = await fcmResponse.json()
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
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
