DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Fix Simone Admin
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'simone@primerpisos.com.br';
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.hr_profiles (id, email, name, role, company)
    VALUES (v_user_id, 'simone@primerpisos.com.br', 'Simone', 'Admin', 'Primer Pisos')
    ON CONFLICT (id) DO UPDATE SET role = 'Admin';
  END IF;
  
  -- Create Ricardo if not exists (so he appears in the UI right away)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ricardo@primerpisos.com.br') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id, '00000000-0000-0000-0000-000000000000', 'ricardo@primerpisos.com.br',
      crypt('PrimerPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Ricardo"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    
    INSERT INTO public.hr_profiles (id, email, name, role, company)
    VALUES (v_user_id, 'ricardo@primerpisos.com.br', 'Ricardo', 'Admin', 'Primer Pisos')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Create Andreia if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'andreia@primerpisos.com.br') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id, '00000000-0000-0000-0000-000000000000', 'andreia@primerpisos.com.br',
      crypt('PrimerPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Andreia"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    
    INSERT INTO public.hr_profiles (id, email, name, role, company)
    VALUES (v_user_id, 'andreia@primerpisos.com.br', 'Andreia', 'Usuário', 'Primer Pisos')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Create Luana if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'luana@primerpisos.com.br') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id, '00000000-0000-0000-0000-000000000000', 'luana@primerpisos.com.br',
      crypt('PrimerPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Luana"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    
    INSERT INTO public.hr_profiles (id, email, name, role, company)
    VALUES (v_user_id, 'luana@primerpisos.com.br', 'Luana', 'Usuário', 'Primer Pisos')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
