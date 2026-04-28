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
    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')
    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)
    if (userError || !user) throw new Error('Unauthorized')

    const { employee_id, email, name, role, company } = await req.json()
    if (!email || !name) throw new Error('Email e nome são obrigatórios')

    const origin = req.headers.get('origin') || 'https://sistema-de-gestao-rh-22169.goskip.app'
    const redirectTo = `${origin}/primeiro-acesso`

    // Gerar link de convite
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'invite',
      email,
      options: {
        data: { name, role: role || 'Colaborador', company: company || 'Primer Pisos' },
        redirectTo,
      },
    })

    if (linkError) {
      if (
        linkError.message.includes('already registered') ||
        linkError.message.includes('User already exists')
      ) {
        // Usuário já existe, gera um link de recuperação (como alternativa ao convite)
        const { data: recoveryData, error: recoveryError } = await supabase.auth.admin.generateLink(
          {
            type: 'recovery',
            email,
            options: { redirectTo },
          },
        )

        if (recoveryError) throw recoveryError

        if (employee_id) {
          const { data: existingUser } = await supabase.auth.admin.listUsers()
          const foundUser = existingUser.users.find((u) => u.email === email)
          if (foundUser) {
            await supabase
              .from('employees')
              .update({ invite_status: 'Pendente', user_id: foundUser.id })
              .eq('id', employee_id)
            await supabase.from('colaborador').update({ ativo: true }).eq('id', employee_id)
            await supabase.from('usuario_sistema').upsert({
              id: foundUser.id,
              email: email,
              nome_completo: name,
              cpf: '000.000.000-00',
              tipo_usuario: role || 'Colaborador',
              senha_hash: 'convite',
              ativo: true,
            })
          }
        }

        await sendInviteEmail(resendApiKey, email, name, recoveryData.properties.action_link)
        return new Response(JSON.stringify({ success: true, message: 'Recovery link sent' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      throw linkError
    }

    const userId = linkData.user.id

    await supabase.from('usuario_sistema').upsert({
      id: userId,
      email: email,
      nome_completo: name,
      cpf: '000.000.000-00',
      tipo_usuario: role || 'Colaborador',
      senha_hash: 'convite',
      ativo: true,
    })

    if (employee_id) {
      await supabase.from('colaborador').update({ ativo: true }).eq('id', employee_id)
      await supabase
        .from('employees')
        .update({ invite_status: 'Pendente', user_id: userId })
        .eq('id', employee_id)
    }

    await sendInviteEmail(resendApiKey, email, name, linkData.properties.action_link)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function sendInviteEmail(resendApiKey: string, to: string, name: string, link: string) {
  if (!resendApiKey) {
    console.warn('No RESEND_API_KEY, invite link:', link)
    return
  }
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #006A9C;">Olá, ${name}!</h2>
      <p>Você foi convidado para acessar o Sistema de Gestão RH da Primer Pisos / Piso Plano.</p>
      <p>Para definir sua senha e realizar seu primeiro acesso, clique no botão abaixo:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${link}" style="display:inline-block;padding:12px 24px;background-color:#006A9C;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Acessar o Sistema</a>
      </p>
      <p>Se o botão não funcionar, copie e cole o link no seu navegador:</p>
      <p style="word-break: break-all; color: #666; font-size: 12px;">${link}</p>
      <br/>
      <p>Atenciosamente,<br/>Equipe Primer Pisos</p>
    </div>
  `
  let res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendApiKey}` },
    body: JSON.stringify({
      from: 'Sistema de Gestão RH <sistema@primerpisos.com.br>',
      to,
      subject: 'Convite para o Sistema de Gestão RH',
      html,
    }),
  })
  if (!res.ok) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendApiKey}` },
      body: JSON.stringify({
        from: 'Sistema de Gestão RH <onboarding@resend.dev>',
        to,
        subject: 'Convite para o Sistema de Gestão RH',
        html,
      }),
    })
  }
}
