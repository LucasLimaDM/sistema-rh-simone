import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'
import { jsPDF } from 'npm:jspdf@2.5.1'
import autoTableLib from 'npm:jspdf-autotable@3.8.2'
import 'npm:jspdf-autotable@3.8.2'
import { encodeBase64 } from 'jsr:@std/encoding/base64'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

const applyAutoTable = (doc: any, options: any) => {
  if (typeof autoTableLib === 'function') {
    autoTableLib(doc, options)
  } else if (autoTableLib && typeof (autoTableLib as any).default === 'function') {
    ;(autoTableLib as any).default(doc, options)
  } else if (typeof doc.autoTable === 'function') {
    doc.autoTable(options)
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Calculate start and end of current day in BRT
    const now = new Date()
    const brtDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
    const year = brtDate.getFullYear()
    const month = String(brtDate.getMonth() + 1).padStart(2, '0')
    const day = String(brtDate.getDate()).padStart(2, '0')
    const todayStr = `${year}-${month}-${day}`

    const startOfDay = new Date(`${todayStr}T00:00:00-03:00`).toISOString()
    const endOfDay = new Date(`${todayStr}T23:59:59.999-03:00`).toISOString()

    // 1. Fetch Sellers
    const { data: vendedores } = await supabase.from('vendedores').select('id, user_id, nome')
    const sellerMap = new Map(vendedores?.map((v) => [v.user_id, v.nome]) || [])
    const sellerIdMap = new Map(vendedores?.map((v) => [v.id, v.nome]) || [])

    // 2. Fetch Pipeline Stages
    const { data: pipelineStages } = await supabase.from('pipeline_stages').select('id, nome')
    const stageMap = new Map(pipelineStages?.map((s) => [s.id, s.nome]) || [])

    // 3. Fetch Activities completed today
    const { data: comunicacoes } = await supabase
      .from('historico_comunicacao')
      .select('*, leads(empresa, vendedor_id)')
      .gte('data_comunicacao', startOfDay)
      .lte('data_comunicacao', endOfDay)

    const { data: etapas } = await supabase
      .from('historico_etapas')
      .select('*, leads(empresa, vendedor_id)')
      .gte('data_entrada', startOfDay)
      .lte('data_entrada', endOfDay)

    const { data: proposals } = await supabase
      .from('proposals')
      .select('*, user_id')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)

    // 4. Fetch Pending Activities
    const { data: roteiroPendentes } = await supabase
      .from('followup_roteiro')
      .select('*, leads(empresa)')
      .lte('data_prevista', todayStr)
      .eq('concluido', false)

    const { data: followupsPendentes } = await supabase
      .from('followups')
      .select('*, leads(empresa)')
      .lte('data_prevista', endOfDay)
      .eq('concluido', false)

    // Build the Report HTML & PDF Data
    const realizadas: string[] = []
    const realizadasData: any[] = []

    comunicacoes?.forEach((c) => {
      const leads = c.leads as any
      const seller =
        sellerMap.get(c.user_id) || (leads && sellerIdMap.get(leads.vendedor_id)) || 'Sistema'
      const cliente = leads?.empresa || 'Cliente Desconhecido'
      const tipoStr = c.tipo === 'recebido' ? 'Recebeu' : 'Enviou'

      let desc = ''
      const assunto = (c.assunto || '').toLowerCase()
      if (assunto.includes('whatsapp')) {
        desc = `${tipoStr} WhatsApp para ${cliente}`
      } else if (assunto.includes('liga')) {
        desc = `Registrou ligação com ${cliente}`
      } else {
        desc = `${tipoStr} E-mail para ${cliente} (Assunto: ${c.assunto})`
      }

      realizadas.push(`<li><strong>${seller}</strong>: ${desc}</li>`)
      realizadasData.push([seller, cliente, desc])
    })

    etapas?.forEach((e) => {
      const leads = e.leads as any
      const seller =
        sellerMap.get(e.user_id) || (leads && sellerIdMap.get(leads.vendedor_id)) || 'Sistema'
      const cliente = leads?.empresa || 'Cliente Desconhecido'
      const stageName = stageMap.get(e.etapa) || 'Etapa Desconhecida'

      const desc = `Moveu ${cliente} para a etapa "${stageName}"`
      realizadas.push(`<li><strong>${seller}</strong>: ${desc}</li>`)
      realizadasData.push([seller, cliente, desc])
    })

    proposals?.forEach((p) => {
      const seller = sellerMap.get(p.user_id) || 'Sistema'
      const desc = `Criou proposta #${p.numero} para ${p.cliente}`
      realizadas.push(`<li><strong>${seller}</strong>: ${desc}</li>`)
      realizadasData.push([seller, p.cliente, desc])
    })

    if (realizadas.length === 0) {
      realizadas.push(`<li>Nenhuma atividade registrada hoje.</li>`)
    }

    const pendentes: string[] = []
    const pendentesData: any[] = []

    const formatDate = (ds: string | null, isDateOnly: boolean = false) => {
      if (!ds) return ''
      const d = new Date(isDateOnly ? `${ds}T12:00:00Z` : ds)
      return d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    }

    roteiroPendentes?.forEach((r) => {
      const leads = r.leads as any
      const cliente = leads?.empresa || 'Cliente Desconhecido'
      pendentes.push(
        `<li><strong>${cliente}</strong>: ${r.tipo.toUpperCase()} - ${r.descricao} (Agendado para: ${formatDate(r.data_prevista, true)})</li>`,
      )
      pendentesData.push([
        cliente,
        r.tipo.toUpperCase(),
        r.descricao,
        formatDate(r.data_prevista, true),
      ])
    })

    followupsPendentes?.forEach((f) => {
      const leads = f.leads as any
      const cliente = leads?.empresa || 'Cliente Desconhecido'
      const obs = f.observacoes ? ` - ${f.observacoes}` : ''
      pendentes.push(
        `<li><strong>${cliente}</strong>: ${f.tipo.toUpperCase()}${obs} (Agendado para: ${formatDate(f.data_prevista, false)})</li>`,
      )
      pendentesData.push([
        cliente,
        f.tipo.toUpperCase(),
        f.observacoes || '-',
        formatDate(f.data_prevista, false),
      ])
    })

    if (pendentes.length === 0) {
      pendentes.push(`<li>Nenhuma atividade pendente atrasada. Parabéns à equipe!</li>`)
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 20px; text-align: center;">
          <h2 style="color: #fff; margin: 0;">Relatório Diário de Atividades</h2>
          <p style="color: #94a3b8; margin: 5px 0 0 0;">${todayStr.split('-').reverse().join('/')}</p>
        </div>
        
        <div style="padding: 20px;">
          <p>Olá, o relatório diário está em anexo em formato PDF.</p>
          
          <h3 style="color: #0ea5e9; border-bottom: 2px solid #e0f2fe; padding-bottom: 8px; margin-top: 20px;">✅ Atividades Realizadas Hoje</h3>
          <ul style="padding-left: 20px; margin-bottom: 30px;">
            ${realizadas.join('')}
          </ul>

          <h3 style="color: #f59e0b; border-bottom: 2px solid #fef3c7; padding-bottom: 8px;">⚠️ Atividades Pendentes e Atrasadas</h3>
          <p style="font-size: 13px; color: #64748b; margin-top: -5px;">Tarefas programadas para hoje ou datas anteriores que não foram concluídas.</p>
          <ul style="padding-left: 20px;">
            ${pendentes.join('')}
          </ul>
        </div>
        
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0;">Gerado automaticamente pelo CRM Primer Pisos.</p>
        </div>
      </div>
    `

    // Generate PDF
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Relatório Diário de Atividades', 14, 20)
    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text(`Data: ${todayStr.split('-').reverse().join('/')}`, 14, 28)

    applyAutoTable(doc, {
      startY: 35,
      head: [['Vendedor', 'Cliente', 'Atividade']],
      body:
        realizadasData.length > 0
          ? realizadasData
          : [['-', '-', 'Nenhuma atividade registrada hoje.']],
      theme: 'grid',
      headStyles: { fillColor: [14, 165, 233] },
      styles: { fontSize: 9 },
    })

    let nextY = (doc as any).lastAutoTable.finalY + 15

    if (nextY > 270) {
      doc.addPage()
      nextY = 20
    }

    doc.setFontSize(14)
    doc.setTextColor(0)
    doc.text('Atividades Pendentes e Atrasadas', 14, nextY)

    applyAutoTable(doc, {
      startY: nextY + 5,
      head: [['Cliente', 'Tipo', 'Descrição/Obs', 'Data Prevista']],
      body:
        pendentesData.length > 0 ? pendentesData : [['-', '-', 'Nenhuma atividade pendente.', '-']],
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11] },
      styles: { fontSize: 9 },
    })

    const pdfBuffer = doc.output('arraybuffer')
    const pdfBase64 = encodeBase64(new Uint8Array(pdfBuffer))

    // Send email using Resend
    if (resendApiKey) {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'CRM Primer Pisos <sistema@primerpisos.com.br>',
          to: 'simone@primerpisos.com.br',
          cc: 'ricardo@pisoplano.com.br',
          subject: `Relatório Diário de Atividades - ${todayStr.split('-').reverse().join('/')}`,
          html: htmlContent,
          attachments: [
            {
              filename: `Relatorio_Diario_${todayStr}.pdf`,
              content: pdfBase64,
            },
          ],
        }),
      })

      if (!resendRes.ok) {
        const errorText = await resendRes.text()
        console.error('Error sending email with Resend:', errorText)
        // Fallback to onboarding@resend.dev if domain is not verified
        if (errorText.includes('domain') || errorText.includes('validation')) {
          console.log('Retrying with onboarding@resend.dev')
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: 'CRM Primer Pisos <onboarding@resend.dev>',
              to: 'simone@primerpisos.com.br',
              subject: `Relatório Diário de Atividades - ${todayStr.split('-').reverse().join('/')}`,
              html: htmlContent,
              attachments: [
                {
                  filename: `Relatorio_Diario_${todayStr}.pdf`,
                  content: pdfBase64,
                },
              ],
            }),
          })
        }
      }
    } else {
      console.warn('RESEND_API_KEY is missing. Skipping email send. Report content:')
      console.log(htmlContent)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Relatório diário gerado e enviado com sucesso.' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: any) {
    console.error('Error generating daily report:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
