import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) throw new Error('Unauthorized')

    const { code, redirectUri } = await req.json()

    if (!code || !redirectUri) {
      throw new Error('code and redirectUri are required')
    }

    const clientId = Deno.env.get('GMAIL_CLIENT_ID')
    const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET')

    // If credentials are not configured or are dummy values, allow mock connection for testing
    if (!clientId || !clientSecret || clientId.includes('dummy')) {
      const { error: upsertError } = await supabase.from('gmail_tokens').upsert({
        user_id: user.id,
        access_token: 'mock_access_token_123',
        refresh_token: 'mock_refresh_token_123',
        expires_at: Date.now() + 3600 * 1000,
        email: user.email || 'mock_user@gmail.com',
        updated_at: new Date().toISOString(),
      })

      if (upsertError) throw upsertError

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text()
      console.error('Token exchange failed:', errorText)
      throw new Error(`Failed to exchange code for tokens: ${errorText}`)
    }

    const tokens = await tokenRes.json()
    const accessToken = tokens.access_token
    const refreshToken = tokens.refresh_token
    const expiresAt = Date.now() + tokens.expires_in * 1000

    // Get user email
    let email = null
    const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (profileRes.ok) {
      const profile = await profileRes.json()
      email = profile.emailAddress
    }

    const { error: upsertError } = await supabase.from('gmail_tokens').upsert({
      user_id: user.id,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      email: email,
      updated_at: new Date().toISOString(),
    })

    if (upsertError) throw upsertError

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
