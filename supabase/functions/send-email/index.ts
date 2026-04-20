import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'
import { encodeBase64 } from 'jsr:@std/encoding/base64'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

async function refreshGmailToken(
  supabase: any,
  userId: string,
  currentToken: any,
  force: boolean = false,
) {
  if (!currentToken) throw new Error('No token provided')
  if (currentToken.access_token === 'mock_access_token_123') return currentToken.access_token

  const isExpired = Date.now() >= Number(currentToken.expires_at) - 300000
  if (!isExpired && !force) return currentToken.access_token
  if (!currentToken.refresh_token)
    throw new Error('auth_required: No valid refresh token available')

  const clientId = Deno.env.get('GMAIL_CLIENT_ID')
  const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET')

  if (!clientId || !clientSecret || clientId.includes('dummy')) {
    console.warn('Gmail credentials not configured in environment, but trying to refresh')
    if (currentToken.refresh_token === 'mock_refresh_token_123') return currentToken.access_token
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

    const rawPayload = await req.json()
    const payload = rawPayload.body ? rawPayload.body : rawPayload
    const { to, cc, bcc, subject, proposalId, leadId, attachments } = payload
    const message = payload.message || payload.bodyHtml || payload.html || ''

    if (!to || !subject) {
      throw new Error('Destination and subject are required')
    }

    let proposalName = ''
    let clientName = ''
    if (proposalId) {
      const { data: proposal } = await supabase
        .from('proposals')
        .select('numero, cliente')
        .eq('id', proposalId)
        .single()
      if (proposal) {
        proposalName = (proposal.numero || '').replace(/\//g, '-')
        clientName = (proposal.cliente || '').replace(/[/\\?%*:|"<>]/g, '').trim()
      }

      await supabase.from('proposals').update({ status: 'Enviada' }).eq('id', proposalId)
    }

    const { data: gmailToken } = await supabase
      .from('gmail_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!gmailToken) {
      throw new Error('Gmail account not connected')
    }

    let accessToken = await refreshGmailToken(supabase, user.id, gmailToken)

    if (accessToken === 'mock_access_token_123') {
      const trackingToken = crypto.randomUUID()
      await supabase.from('email_tracking').insert({
        id: crypto.randomUUID(),
        proposal_id: proposalId || null,
        lead_id: leadId || null,
        token: trackingToken,
        assunto: subject,
        status: 'enviado',
        enviado_em: new Date().toISOString(),
      })
      if (leadId && proposalName) {
        await supabase
          .from('leads')
          .update({
            numero_proposta: proposalName,
            updated_at: new Date().toISOString(),
          })
          .eq('id', leadId)
      }
      return new Response(
        JSON.stringify({ success: true, messageId: 'mock-id-' + trackingToken }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    const boundary = `----=_Part_${crypto.randomUUID()}`

    const encodeSubject = (str: string) => {
      const utf8Bytes = new TextEncoder().encode(str)
      const base64 = encodeBase64(utf8Bytes)
      return `=?utf-8?B?${base64}?=`
    }

    let msg = `To: ${to}\r\n`
    if (cc) msg += `Cc: ${cc}\r\n`
    if (bcc) msg += `Bcc: ${bcc}\r\n`
    msg += `Subject: ${encodeSubject(subject)}\r\n`
    msg += `MIME-Version: 1.0\r\n`
    msg += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`

    const trackingToken = crypto.randomUUID()
    const trackingUrl = `${supabaseUrl}/functions/v1/email-tracker?token=${trackingToken}`
    const trackingPixel = `<img src="${trackingUrl}" width="1" height="1" alt="" style="display:none;"/>`

    let emailHtml = message
    const finalHtml = `${emailHtml}${trackingPixel}`

    msg += `--${boundary}\r\n`
    msg += `Content-Type: text/html; charset="UTF-8"\r\n`
    msg += `Content-Transfer-Encoding: base64\r\n\r\n`

    const chunkBase64 = (str: string) => {
      let result = ''
      for (let i = 0; i < str.length; i += 76) {
        result += str.substring(i, i + 76) + '\r\n'
      }
      return result
    }

    const htmlBytes = new TextEncoder().encode(finalHtml)
    const htmlBase64 = encodeBase64(htmlBytes)
    msg += `${chunkBase64(htmlBase64)}\r\n`

    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        let finalName = att.name
        // O nome do arquivo da proposta é gerado dinamicamente no frontend agora.
        // Apenas manuais utilizam ajuste automático aqui.
        if (proposalName && att.type === 'application/pdf') {
          if (att.name && att.name.toLowerCase().startsWith('manual')) {
            finalName = clientName
              ? `Manual ${proposalName} ${clientName}.pdf`
              : `Manual_${proposalName}.pdf`
          }
        }

        // Remove non-ascii from filename to be safe
        finalName = (finalName || 'Anexo.pdf')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s.-]/gi, '')

        let base64Data = att.data || ''
        if (att.url && !base64Data) {
          try {
            const fileRes = await fetch(att.url)
            if (fileRes.ok) {
              const arrayBuffer = await fileRes.arrayBuffer()
              base64Data = encodeBase64(new Uint8Array(arrayBuffer))
            } else {
              console.error('Failed to download attachment from URL:', att.url)
            }
          } catch (e) {
            console.error('Error downloading attachment:', e)
          }
        }

        if (base64Data) {
          const contentType = att.type || 'application/octet-stream'
          msg += `--${boundary}\r\n`
          msg += `Content-Type: ${contentType}; name="${finalName}"\r\n`
          msg += `Content-Disposition: attachment; filename="${finalName}"\r\n`
          msg += `Content-Transfer-Encoding: base64\r\n\r\n`
          msg += `${chunkBase64(base64Data)}\r\n`
        }
      }
    }

    msg += `--${boundary}--\r\n`

    const msgBytes = new TextEncoder().encode(msg)
    const encodedMessage = encodeBase64(msgBytes)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    const { error: trackingError } = await supabase.from('email_tracking').insert({
      id: crypto.randomUUID(),
      proposal_id: proposalId || null,
      lead_id: leadId || null,
      token: trackingToken,
      assunto: subject,
      status: 'enviado',
      enviado_em: new Date().toISOString(),
    })

    if (trackingError) {
      console.error('Failed to insert email tracking:', trackingError)
    }

    if (leadId && proposalName) {
      await supabase
        .from('leads')
        .update({
          numero_proposta: proposalName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId)
    }

    let sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    })

    if (sendRes.status === 401) {
      accessToken = await refreshGmailToken(supabase, user.id, gmailToken, true)
      sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: encodedMessage,
        }),
      })
    }

    if (!sendRes.ok) {
      const errorText = await sendRes.text()
      console.error('Gmail API Error:', errorText)
      if (sendRes.status === 401 || sendRes.status === 403) {
        throw new Error(
          'Falha de permissão no Gmail. Por favor, desconecte e conecte sua conta novamente nas Configurações.',
        )
      }
      throw new Error(`Falha ao enviar e-mail via Gmail API: ${errorText}`)
    }

    const gmailResData = await sendRes.json()

    return new Response(JSON.stringify({ success: true, messageId: gmailResData.id }), {
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
