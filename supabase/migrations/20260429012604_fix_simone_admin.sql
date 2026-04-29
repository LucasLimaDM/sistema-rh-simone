DO $$
BEGIN
  -- Ensure Simone exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'simone@primerpisos.com.br') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'simone@primerpisos.com.br',
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Simone"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;

  -- Ensure she is an Admin in hr_profiles
  IF EXISTS (SELECT 1 FROM public.hr_profiles WHERE email = 'simone@primerpisos.com.br') THEN
    UPDATE public.hr_profiles
    SET role = 'Admin', name = 'Simone', avatar_url = 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1'
    WHERE email = 'simone@primerpisos.com.br';
  ELSE
    INSERT INTO public.hr_profiles (id, email, name, role, avatar_url)
    SELECT id, email, 'Simone', 'Admin', 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1'
    FROM auth.users
    WHERE email = 'simone@primerpisos.com.br'
    LIMIT 1;
  END IF;

  -- Ensure she is an Admin in usuario_sistema
  IF EXISTS (SELECT 1 FROM public.usuario_sistema WHERE email = 'simone@primerpisos.com.br') THEN
    UPDATE public.usuario_sistema
    SET tipo_usuario = 'Admin', nome_completo = 'Simone'
    WHERE email = 'simone@primerpisos.com.br';
  ELSE
    INSERT INTO public.usuario_sistema (id, email, nome_completo, tipo_usuario, senha_hash, ativo)
    SELECT id, email, 'Simone', 'Admin', 'senha', true
    FROM auth.users
    WHERE email = 'simone@primerpisos.com.br'
    LIMIT 1;
  END IF;
END $$;
