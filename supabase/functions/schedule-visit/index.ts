import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'
import { refreshGmailToken } from '../_shared/gmail.ts'
import { encodeBase64 } from 'jsr:@std/encoding/base64'

// Triggering redeploy for schedule-visit to resolve shared module

const corsHeaders = {
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

    const payload = await req.json()
    const { lead_id } = payload.body ? payload.body : payload

    if (!lead_id) throw new Error('lead_id is required')

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .single()

    if (leadError || !lead) throw new Error('Lead not found')

    if (!lead.visita_vendedor_id) {
      throw new Error('Nenhum vendedor atribuído para a visita.')
    }

    if (!lead.visita_data) {
      throw new Error('Data da visita não definida.')
    }

    const { data: vendedor } = await supabase
      .from('vendedores')
      .select('*')
      .eq('id', lead.visita_vendedor_id)
      .single()

    if (!vendedor) throw new Error('Vendedor não encontrado')

    const { data: userSettings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const visitDate = new Date(lead.visita_data)
    const endDate = new Date(visitDate.getTime() + 60 * 60 * 1000) // +1 hour

    const formatDateICS = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const address = [lead.logradouro, lead.numero, lead.bairro, lead.cidade, lead.uf]
      .filter(Boolean)
      .join(', ')

    const description =
      `Visita Técnica / Comercial\n\n` +
      `Cliente: ${lead.empresa}\n` +
      `Contato: ${lead.contato} (${lead.telefone || 'Sem telefone'})\n` +
      `Área: ${lead.area_m2 ? lead.area_m2 + ' m²' : 'Não informada'}\n` +
      `Revestimento: ${lead.tipo_revestimento || 'Não informado'}\n\n` +
      `Endereço: ${address || 'Não informado'}\n` +
      `\nGerado pelo CRM Primer Pisos`

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Primer Pisos//CRM//PT',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `DTSTART:${formatDateICS(visitDate)}`,
      `DTEND:${formatDateICS(endDate)}`,
      `SUMMARY:Visita: ${lead.empresa}`,
      `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
      `LOCATION:${address}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const emailSubject = `Visita Agendada: ${lead.empresa} - ${visitDate.toLocaleDateString('pt-BR')} às ${visitDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    const emailHtml = `
      <h3>Nova Visita Agendada</h3>
      <p>Olá ${vendedor.nome}, uma nova visita foi agendada para você.</p>
      <ul>
        <li><strong>Cliente:</strong> ${lead.empresa}</li>
        <li><strong>Contato:</strong> ${lead.contato} (${lead.telefone || 'N/A'})</li>
        <li><strong>Data/Hora:</strong> ${visitDate.toLocaleDateString('pt-BR')} às ${visitDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</li>
        <li><strong>Endereço:</strong> ${address || 'N/A'}</li>
        <li><strong>Área:</strong> ${lead.area_m2 ? lead.area_m2 + ' m²' : 'N/A'}</li>
      </ul>
      <p>O convite do calendário está em anexo.</p>
    `

    let emailSent = false
    let whatsappSent = false
    let errors = []

    // Send Email via Gmail API
    try {
      const { data: gmailToken } = await supabase
        .from('gmail_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (gmailToken && gmailToken.access_token !== 'mock_access_token_123') {
        const accessToken = await refreshGmailToken(supabase, user.id, gmailToken)

        const boundary = `----=_Part_${crypto.randomUUID()}`
        const encodeSubject = (str: string) => {
          const utf8Bytes = new TextEncoder().encode(str)
          const base64 = encodeBase64(utf8Bytes)
          return `=?utf-8?B?${base64}?=`
        }

        let msg = `To: ${vendedor.email}\r\n`
        msg += `Subject: ${encodeSubject(emailSubject)}\r\n`
        msg += `MIME-Version: 1.0\r\n`
        msg += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`

        msg += `--${boundary}\r\n`
        msg += `Content-Type: text/html; charset="UTF-8"\r\n`
        msg += `Content-Transfer-Encoding: base64\r\n\r\n`

        const chunkBase64 = (str: string) => str.match(/.{1,76}/g)?.join('\r\n') || str

        const htmlBytes = new TextEncoder().encode(emailHtml)
        msg += `${chunkBase64(encodeBase64(htmlBytes))}\r\n`

        // Attachment ICS
        msg += `--${boundary}\r\n`
        msg += `Content-Type: text/calendar; method=REQUEST; charset="UTF-8"; name="invite.ics"\r\n`
        msg += `Content-Disposition: attachment; filename="invite.ics"\r\n`
        msg += `Content-Transfer-Encoding: base64\r\n\r\n`
        const icsBytes = new TextEncoder().encode(icsContent)
        msg += `${chunkBase64(encodeBase64(icsBytes))}\r\n`

        msg += `--${boundary}--\r\n`

        const msgBytes = new TextEncoder().encode(msg)
        const encodedMessage = encodeBase64(msgBytes)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '')

        const sendRes = await fetch(
          'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ raw: encodedMessage }),
          },
        )

        if (sendRes.ok) {
          emailSent = true
        } else {
          const errorText = await sendRes.text()
          errors.push(`Gmail API Error: ${errorText}`)
        }
      } else {
        errors.push('Gmail não conectado ou token mockado.')
      }
    } catch (e: any) {
      errors.push(`Email error: ${e.message}`)
    }

    // Send WhatsApp via API if configured
    try {
      const waConfig = userSettings?.configuracoes_whatsapp
      if (
        waConfig &&
        waConfig.enabled &&
        waConfig.api_url &&
        waConfig.api_token &&
        vendedor.telefone
      ) {
        const phone = vendedor.telefone.replace(/\D/g, '')
        const waText =
          `*Nova Visita Agendada*\n\n` +
          `*Cliente:* ${lead.empresa}\n` +
          `*Contato:* ${lead.contato} (${lead.telefone || 'N/A'})\n` +
          `*Data/Hora:* ${visitDate.toLocaleDateString('pt-BR')} às ${visitDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n` +
          `*Endereço:* ${address || 'N/A'}\n` +
          `*Área:* ${lead.area_m2 ? lead.area_m2 + ' m²' : 'N/A'}\n\n` +
          `Verifique seu e-mail para adicionar ao calendário.`

        const payload = {
          number: phone.startsWith('55') ? phone : `55${phone}`,
          text: waText,
          message: waText,
          phone: phone,
        }

        const waRes = await fetch(waConfig.api_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${waConfig.api_token}`,
            apikey: waConfig.api_token,
          },
          body: JSON.stringify(payload),
        })

        if (waRes.ok) {
          whatsappSent = true
        } else {
          const errorText = await waRes.text()
          errors.push(`WhatsApp API Error: ${errorText}`)
        }
      }
    } catch (e: any) {
      errors.push(`WhatsApp error: ${e.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Visita sincronizada.',
        details: { emailSent, whatsappSent, errors },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
