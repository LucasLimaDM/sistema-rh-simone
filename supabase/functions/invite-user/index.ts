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

    // Verificação de Admin para segurança extra no backend
    const { data: profile } = await supabase
      .from('hr_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    if (profile?.role !== 'Admin') {
      throw new Error('Apenas administradores podem adicionar membros.')
    }

    const { email, name, role } = await req.json()
    if (!email || !name) throw new Error('Email and name are required')

    // Criação direta sem enviar e-mail de convite
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.createUser({
      email,
      password: 'PrimerPassword123!', // Senha padrão para acesso futuro
      email_confirm: true,
      user_metadata: { name },
    })

    if (inviteError) {
      if (
        inviteError.message.includes('already registered') ||
        inviteError.message.includes('User already exists')
      ) {
        // Se o usuário já existe, vinculamos ao hr_profiles
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const found = existingUsers.users.find((u) => u.email === email)
        if (found) {
          await supabase.from('hr_profiles').upsert({
            id: found.id,
            email: email,
            name: name,
            role: role || 'Usuário',
            company: 'Primer Pisos',
          })
          return new Response(JSON.stringify({ success: true, user: found }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
      }
      throw inviteError
    }

    if (inviteData.user) {
      await supabase.from('hr_profiles').upsert({
        id: inviteData.user.id,
        email: email,
        name: name,
        role: role || 'Usuário',
        company: 'Primer Pisos',
      })
    }

    return new Response(JSON.stringify({ success: true, user: inviteData.user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
