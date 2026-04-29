import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

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

    const { employee_id, email, name, role, company, password } = await req.json()
    if (!email || !name || !password) throw new Error('Email, nome e senha são obrigatórios')

    // Create user directly
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: role || 'Usuario', company: company || 'Primer Pisos' },
    })

    if (authError) {
      if (
        authError.message.includes('already registered') ||
        authError.message.includes('User already exists')
      ) {
        throw new Error('Usuário já existe com este e-mail.')
      }
      throw authError
    }

    const userId = authData.user.id

    await supabase.from('usuario_sistema').upsert({
      id: userId,
      email: email,
      nome_completo: name,
      cpf: '',
      tipo_usuario: role || 'Usuario',
      senha_hash: 'criado_direto',
      ativo: true,
    })

    if (employee_id) {
      await supabase.from('colaborador').update({ ativo: true }).eq('id', employee_id)
      await supabase
        .from('employees')
        .update({ invite_status: 'Cadastrado', user_id: userId })
        .eq('id', employee_id)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error in invite-user:', error.message)
    // Retornar 200 com a propriedade "error" para evitar o "non-2xx status code" na UI
    return new Response(JSON.stringify({ error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
