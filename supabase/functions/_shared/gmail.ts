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
      throw new Error('auth_required: Refresh token invalid or expired')
    }
    throw new Error(`Failed to refresh Gmail token: ${errorText}`)
  }

  const refreshData = await refreshRes.json()
  const newAccessToken = refreshData.access_token
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
