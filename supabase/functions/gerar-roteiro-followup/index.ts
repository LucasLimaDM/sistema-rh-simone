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

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const payload = await req.json()
    const { type, table, record, old_record } = payload

    if (!record || !record.id) {
      return new Response(JSON.stringify({ error: 'Invalid payload: missing record.id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (table === 'leads' && type === 'INSERT') {
      return await handleLeadInsert(supabase, record)
    } else if (table === 'followup_roteiro' && type === 'UPDATE') {
      return await handleFollowupUpdate(supabase, record, old_record)
    }

    // Fallback for backward compatibility if table/type is missing
    if (!table) {
      return await handleLeadInsert(supabase, record)
    }

    return new Response(JSON.stringify({ success: true, message: 'Event ignored.' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function handleLeadInsert(supabase: any, record: any) {
  const lead_id = record.id
  const data_entrada = record.data_entrada || new Date().toISOString()
  const dataEntradaDate = new Date(data_entrada)

  const { data: existing } = await supabase
    .from('followup_roteiro')
    .select('dia_sequencia')
    .eq('lead_id', lead_id)

  if (existing && existing.length > 0) {
    return new Response(JSON.stringify({ success: true, message: 'Roteiro already exists.' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const sequence = [
    {
      dia: 1,
      tipo: 'whatsapp',
      desc: 'WhatsApp: apresentar-se e solicitar tipo de revestimento, área e prazo desejado',
    },
    {
      dia: 2,
      tipo: 'email',
      desc: 'E-mail: enviar proposta personalizada com valores e especificações técnicas',
    },
    {
      dia: 3,
      tipo: 'ligacao',
      desc: 'Ligação: confirmar recebimento da proposta e tirar dúvidas',
    },
    {
      dia: 6,
      tipo: 'whatsapp',
      desc: 'WhatsApp: enviar foto de projeto semelhante já executado',
    },
    {
      dia: 9,
      tipo: 'email',
      desc: 'E-mail: enviar reportagem ou artigo com benefícios do revestimento específico do lead',
    },
    {
      dia: 12,
      tipo: 'ligacao',
      desc: 'Ligação: follow-up de fechamento, perguntar sobre decisão de compra',
    },
  ]

  const inserts = sequence.map((seq: any) => {
    const dataPrevista = new Date(dataEntradaDate)
    dataPrevista.setDate(dataPrevista.getDate() + seq.dia)
    return {
      lead_id,
      dia_sequencia: seq.dia,
      tipo: seq.tipo,
      descricao: seq.desc,
      data_prevista: dataPrevista.toISOString().split('T')[0],
      concluido: false,
    }
  })

  const { error } = await supabase.from('followup_roteiro').insert(inserts)

  if (error) {
    throw error
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Roteiro de follow-up gerado com sucesso.',
    }),
    {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  )
}

async function handleFollowupUpdate(supabase: any, record: any, old_record: any) {
  if (!record.concluido) {
    return new Response(JSON.stringify({ success: true, message: 'Not completed, ignored.' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (old_record && old_record.concluido) {
    return new Response(JSON.stringify({ success: true, message: 'Already completed, ignored.' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const dia = record.dia_sequencia

  // Trigger on Day 12, 21, 30, 39, etc.
  if ((dia - 12) % 9 !== 0 || dia < 12) {
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Not a milestone day, ignored.',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }

  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('id, etapa, data_entrada')
    .eq('id', record.lead_id)
    .single()

  if (leadError || !lead) {
    throw new Error('Lead not found')
  }

  const { data: stage } = await supabase
    .from('pipeline_stages')
    .select('nome')
    .eq('id', lead.etapa)
    .single()

  const isFechadoOrPerdido = stage
    ? stage.nome.toLowerCase() === 'fechado' || stage.nome.toLowerCase() === 'perdido'
    : lead.etapa.toLowerCase() === 'fechado' || lead.etapa.toLowerCase() === 'perdido'

  if (isFechadoOrPerdido) {
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Lead is in Fechado or Perdido stage, no new follow-ups generated.',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }

  const data_entrada = lead.data_entrada || new Date().toISOString()
  const dataEntradaDate = new Date(data_entrada)

  const nextDays = [
    { offset: 3, tipo: 'whatsapp', desc: 'WhatsApp com novo projeto' },
    { offset: 6, tipo: 'email', desc: 'E-mail com novo conteúdo de benefício' },
    { offset: 9, tipo: 'ligacao', desc: 'Ligação de fechamento' },
  ]

  // Prevent duplicate insertion of tasks
  const targetDays = nextDays.map((s) => dia + s.offset)
  const { data: existing } = await supabase
    .from('followup_roteiro')
    .select('dia_sequencia')
    .eq('lead_id', record.lead_id)
    .in('dia_sequencia', targetDays)

  const existingDays = existing?.map((e) => e.dia_sequencia) || []

  const inserts = nextDays
    .filter((seq: any) => !existingDays.includes(dia + seq.offset))
    .map((seq: any) => {
      const targetDia = dia + seq.offset
      const dataPrevista = new Date(dataEntradaDate)
      dataPrevista.setDate(dataPrevista.getDate() + targetDia)

      return {
        lead_id: record.lead_id,
        dia_sequencia: targetDia,
        tipo: seq.tipo,
        descricao: seq.desc,
        data_prevista: dataPrevista.toISOString().split('T')[0],
        concluido: false,
      }
    })

  const { error: insertError } = await supabase.from('followup_roteiro').insert(inserts)

  if (insertError) {
    throw insertError
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Extended follow-up tasks generated successfully.',
    }),
    {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  )
}
