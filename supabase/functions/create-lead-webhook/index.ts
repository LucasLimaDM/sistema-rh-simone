import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

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
    const { empresa, contato, telefone, email, origem, user_id, numero_proposta, valor_proposta } =
      payload

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'Campo obrigatório ausente: user_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Identificar duplicidade via numero_proposta (para propostas) ou e-mail/telefone (para leads manuais)
    let existingLead = null

    if (numero_proposta) {
      const { data } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user_id)
        .ilike('numero_proposta', `%${numero_proposta}%`)
        .order('created_at', { ascending: false })
        .limit(1)
      if (data && data.length > 0) existingLead = data[0]
    }

    if (!existingLead && email) {
      const { data } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user_id)
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
      if (data && data.length > 0) existingLead = data[0]
    }

    if (!existingLead && telefone) {
      const { data } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user_id)
        .eq('telefone', telefone)
        .order('created_at', { ascending: false })
        .limit(1)
      if (data && data.length > 0) existingLead = data[0]
    }

    // Tentar buscar apenas pelo nome da empresa se nada mais bater
    if (!existingLead && empresa && empresa !== 'Novo Cliente') {
      const { data } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user_id)
        .ilike('empresa', empresa)
        .order('created_at', { ascending: false })
        .limit(1)
      if (data && data.length > 0) existingLead = data[0]
    }

    const { data: stages } = await supabase
      .from('pipeline_stages')
      .select('id, nome')
      .eq('user_id', user_id)
      .order('ordem', { ascending: true })

    if (existingLead) {
      // Unificar nova proposta ao lead existente (Opção B - Consolidação)
      let targetEtapaId = existingLead.etapa
      if (numero_proposta && stages) {
        const currentStage = stages.find((s: any) => s.id === existingLead.etapa)
        const propostaStage = stages.find(
          (s: any) =>
            s.nome.toLowerCase().includes('proposta') || s.nome.toLowerCase().includes('enviada'),
        )

        // Mover para "Proposta Enviada" apenas se estiver em uma etapa anterior (ex: Novo Lead, Contato Feito)
        if (propostaStage && currentStage && currentStage.ordem < propostaStage.ordem) {
          targetEtapaId = propostaStage.id
        }
      }

      let newNumero = existingLead.numero_proposta || ''
      let isNewProposalForLead = false

      if (numero_proposta && !newNumero.includes(numero_proposta)) {
        newNumero = newNumero ? `${newNumero}, ${numero_proposta}` : numero_proposta
        isNewProposalForLead = true
      }

      let newObs = existingLead.observacoes || ''
      if (numero_proposta && isNewProposalForLead) {
        const obsAdd = `[${new Date().toLocaleDateString('pt-BR')}] Nova proposta vinculada: ${numero_proposta}${valor_proposta ? ` (R$ ${valor_proposta})` : ''}`
        newObs = newObs ? `${obsAdd}\n\n${newObs}` : obsAdd
      }

      const { error } = await supabase
        .from('leads')
        .update({
          etapa: targetEtapaId,
          numero_proposta: newNumero || existingLead.numero_proposta,
          valor_proposta: valor_proposta || existingLead.valor_proposta,
          empresa: empresa || existingLead.empresa,
          contato: contato || existingLead.contato,
          email: email || existingLead.email,
          telefone: telefone || existingLead.telefone,
          observacoes: newObs,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingLead.id)

      if (error) throw error

      if (targetEtapaId !== existingLead.etapa) {
        await supabase
          .from('historico_etapas')
          .update({ data_saida: new Date().toISOString() })
          .eq('lead_id', existingLead.id)
          .is('data_saida', null)
        await supabase.from('historico_etapas').insert({
          lead_id: existingLead.id,
          etapa: targetEtapaId,
          data_entrada: new Date().toISOString(),
        })
      }

      return new Response(
        JSON.stringify({ success: true, lead_id: existingLead.id, merged: true }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    if (!empresa || !contato) {
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios ausentes para novo lead: empresa, contato' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    let etapaId = 'novo'
    if (stages && stages.length > 0) {
      const novoLeadStage = stages.find((s: any) => s.nome.toLowerCase() === 'novo lead')
      etapaId = novoLeadStage ? novoLeadStage.id : stages[0].id

      if (numero_proposta) {
        const propostaStage = stages.find(
          (s: any) =>
            s.nome.toLowerCase().includes('proposta') || s.nome.toLowerCase().includes('enviada'),
        )
        if (propostaStage) {
          etapaId = propostaStage.id
        }
      }
    }

    let logo_url = null
    try {
      const { data: logoData, error: logoErr } = await supabase.functions.invoke(
        'fetch-lead-logo',
        { body: { empresa, email, user_id } },
      )
      if (!logoErr && logoData?.url) logo_url = logoData.url
    } catch (e) {
      console.error('Error fetching lead logo in webhook:', e)
    }

    const dataEntrada = new Date().toISOString()

    let newObs = ''
    if (numero_proposta) {
      newObs = `[${new Date().toLocaleDateString('pt-BR')}] Proposta inicial: ${numero_proposta}${valor_proposta ? ` (R$ ${valor_proposta})` : ''}`
    }

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        empresa,
        contato,
        telefone: telefone || null,
        email: email || null,
        origem: origem || 'App Propostas',
        user_id,
        etapa: etapaId,
        temperatura: 'cold',
        data_entrada: dataEntrada,
        logo_url,
        numero_proposta: numero_proposta || null,
        valor_proposta: valor_proposta || null,
        observacoes: newObs || null,
      })
      .select('id')
      .single()

    if (leadError) throw leadError

    await supabase.from('historico_etapas').insert({
      lead_id: lead.id,
      etapa: etapaId,
      data_entrada: dataEntrada,
    })

    return new Response(JSON.stringify({ success: true, lead_id: lead.id, merged: false }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
