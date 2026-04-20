import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) throw new Error('ID da proposta é obrigatório')

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('proposals')
        .select('id, numero, cliente, data, local, status, state')
        .eq('id', id)
        .single()

      if (error || !data) throw new Error('Proposta não encontrada')

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'POST') {
      const { signatureBase64, userAgent } = await req.json()
      const ip = req.headers.get('x-forwarded-for') || 'unknown'

      const { data: proposal, error: fetchError } = await supabase
        .from('proposals')
        .select('state, status')
        .eq('id', id)
        .single()

      if (fetchError || !proposal) throw new Error('Proposta não encontrada')

      const state = (proposal.state as any) || {}
      if (!state.signaturesData) state.signaturesData = {}
      if (!state.signaturesData.contratante) state.signaturesData.contratante = {}

      state.signaturesData.contratante.assinatura = signatureBase64
      state.signaturesData.contratante.data = new Date().toISOString()
      state.signaturesData.contratante.ip = ip
      state.signaturesData.contratante.userAgent = userAgent

      const { error: updateError } = await supabase
        .from('proposals')
        .update({
          state,
          status: 'Aprovada',
        })
        .eq('id', id)

      if (updateError) throw updateError

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
