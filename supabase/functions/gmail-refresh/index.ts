import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

export async function refreshGmailToken(
  supabase: any,
  userId: string,
  currentToken: any,
  force: boolean = false,
) {
  if (!currentToken) throw new Error('No token provided')

  if (currentToken.access_token === 'mock_access_token_123') {
    return currentToken.access_token
  }

  // 5 minutes buffer (300000 ms)
  const isExpired = Date.now() >= Number(currentToken.expires_at) - 300000

  if (!isExpired && !force) {
    return currentToken.access_token
  }

  if (!currentToken.refresh_token) {
    throw new Error('auth_required: No valid refresh token available')
  }

  const clientId = Deno.env.get('GMAIL_CLIENT_ID')
  const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET')

  if (!clientId || !clientSecret || clientId.includes('dummy')) {
    console.warn('Gmail credentials not configured in environment, but trying to refresh')
    if (currentToken.refresh_token === 'mock_refresh_token_123') {
      return currentToken.access_token
    }
  }

  // Attempt to refresh the token using Google OAuth endpoint
  const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId || '',
      client_secret: clientSecret || '',
      refresh_token: currentToken.refresh_token,
      grant_type: 'refresh_token',
    }),
  })

  if (!refreshRes.ok) {
    const errorText = await refreshRes.text()
    console.error('Failed to refresh Gmail token:', errorText)
    if (refreshRes.status >= 400 && refreshRes.status < 500) {
      throw new Error(
        'auth_required: Falha ao renovar o token do Gmail. Por favor, reconecte sua conta.',
      )
    }
    throw new Error(`Failed to refresh Gmail token: ${errorText}`)
  }

  const refreshData = await refreshRes.json()
  const newAccessToken = refreshData.access_token
  // Some OAuth responses don't include a new refresh token, keep the old one if so
  const newRefreshToken = refreshData.refresh_token || currentToken.refresh_token
  const newExpiresAt = Date.now() + refreshData.expires_in * 1000

  await supabase
    .from('gmail_tokens')
    .update({
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      expires_at: newExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  return newAccessToken
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

    const { data: gmailToken } = await supabase
      .from('gmail_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!gmailToken) {
      return new Response(JSON.stringify({ connected: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    try {
      // Attempt a refresh if needed.
      await refreshGmailToken(supabase, user.id, gmailToken)

      // Fetch updated token to ensure we return the latest state
      const { data: updatedToken } = await supabase
        .from('gmail_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single()

      return new Response(JSON.stringify({ connected: true, token: updatedToken }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } catch (e: any) {
      if (e.message && e.message.includes('auth_required')) {
        return new Response(JSON.stringify({ connected: true, needsReauth: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }
      throw e
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
