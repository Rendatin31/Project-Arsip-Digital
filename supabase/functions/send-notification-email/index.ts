// Supabase Edge Function: Send Notification Email
// File: supabase/functions/send-notification-email/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@onboarding.resend.dev'

interface NotificationPayload {
  user_id: string
  type: string
  title: string
  message: string
  notification_id: string
}

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // Parse request body
    const payload: NotificationPayload = await req.json()
    console.log('Received notification payload:', payload)

    // Validate payload
    if (!payload.user_id || !payload.type || !payload.title || !payload.message) {
      return new Response('Invalid payload', { status: 400 })
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user profile and email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', payload.user_id)
      .single()

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError)
      return new Response('User not found', { status: 404 })
    }

    console.log('Sending email to:', profile.email)

    // Check if user has email notifications enabled
    const { data: prefs, error: prefsError } = await supabase
      .from('notification_preferences')
      .select('email_notifications')
      .eq('user_id', payload.user_id)
      .single()

    if (prefsError || !prefs || prefs.email_notifications === false) {
      console.log('Email notifications disabled for user:', payload.user_id)
      return new Response(JSON.stringify({ 
        success: true, 
        skipped: true,
        reason: 'Email notifications disabled'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      })
    }

    // Generate email HTML
    const emailHtml = generateEmailHtml(payload, profile.full_name)

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: `Arsip Digital Rendatin <${FROM_EMAIL}>`,
        to: [profile.email],
        subject: `[Arsip Digital] ${payload.title}`,
        html: emailHtml,
        reply_to: FROM_EMAIL
      })
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendData)
      return new Response(JSON.stringify({ 
        error: 'Failed to send email',
        details: resendData
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      })
    }

    console.log('Email sent successfully:', resendData)

    return new Response(JSON.stringify({ 
      success: true,
      email_id: resendData.id
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Error in send-notification-email function:', error)
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

// Generate HTML email template
function generateEmailHtml(payload: NotificationPayload, userName: string): string {
  const notificationTypeMap: Record<string, { icon: string; color: string }> = {
    'upload': { icon: '📤', color: '#2563eb' },
    'edit': { icon: '✏️', color: '#7c3aed' },
    'delete': { icon: '🗑️', color: '#dc2626' },
    'security': { icon: '🔒', color: '#ea580c' },
    'system': { icon: '⚙️', color: '#059669' },
    'approval': { icon: '✅', color: '#16a34a' },
    'access': { icon: '👥', color: '#0891b2' },
    'share': { icon: '🔗', color: '#8b5cf6' }
  }

  const notifType = notificationTypeMap[payload.type] || { icon: '📬', color: '#6b7280' }

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${payload.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${notifType.color} 0%, ${notifType.color}dd 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                ${notifType.icon} Arsip Digital Rendatin
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px;">
                Halo <strong>${userName}</strong>,
              </p>
              
              <div style="background-color: #f9fafb; border-left: 4px solid ${notifType.color}; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 18px; font-weight: 600;">
                  ${payload.title}
                </h2>
                <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                  ${payload.message}
                </p>
              </div>

              <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Notifikasi ini dikirim karena Anda mengaktifkan notifikasi email di pengaturan sistem. Anda dapat menonaktifkannya kapan saja melalui menu Pengaturan.
              </p>
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td style="padding: 0 30px 40px 30px; text-align: center;">
              <a href="${Deno.env.get('APP_URL') || 'https://your-app-url.com'}" style="display: inline-block; background-color: ${notifType.color}; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 15px;">
                Buka Arsip Digital
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; text-align: center;">
                © ${new Date().getFullYear()} Arsip Digital Rendatin. All rights reserved.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                Email ini dikirim secara otomatis, mohon tidak membalas email ini.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}
