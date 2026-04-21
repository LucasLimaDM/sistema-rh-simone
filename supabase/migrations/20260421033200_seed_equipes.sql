DO $$
DECLARE
  new_user_id uuid;
  v_email text;
  v_name text;
  v_role text;
  users_to_seed jsonb := '[
    {"email": "simone@primerpisos.com.br", "name": "Simone Chalub", "role": "Admin"},
    {"email": "ricardo@pisoplano.com.br", "name": "Ricardo Barbosa", "role": "Admin"},
    {"email": "compras@primerpisos.com.br", "name": "Nadja Souza", "role": "Usuário"},
    {"email": "comercial@primerpisos.com.br", "name": "Andreia Costa", "role": "Usuário"},
    {"email": "luanachalub@gmail.com", "name": "Luana Chalub", "role": "Usuário"}
  ]';
  user_record jsonb;
BEGIN
  FOR user_record IN SELECT * FROM jsonb_array_elements(users_to_seed)
  LOOP
    v_email := user_record->>'email';
    v_name := user_record->>'name';
    v_role := user_record->>'role';

    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
      new_user_id := gen_random_uuid();
      
      INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
        is_super_admin, role, aud,
        confirmation_token, recovery_token, email_change_token_new,
        email_change, email_change_token_current,
        phone, phone_change, phone_change_token, reauthentication_token
      ) VALUES (
        new_user_id,
        '00000000-0000-0000-0000-000000000000',
        v_email,
        crypt('Primer@2026', gen_salt('bf')),
        NOW(), NOW(), NOW(),
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object('name', v_name),
        false, 'authenticated', 'authenticated',
        '', '', '', '', '', NULL, '', '', ''
      );

      -- Give trigger time to run or upsert (if hr_profiles was populated via handle_new_hr_user)
      IF EXISTS (SELECT 1 FROM public.hr_profiles WHERE id = new_user_id) THEN
        UPDATE public.hr_profiles SET role = v_role, name = v_name WHERE id = new_user_id;
      ELSE
        INSERT INTO public.hr_profiles (id, email, name, role, company)
        VALUES (new_user_id, v_email, v_name, v_role, 'Primer Pisos');
      END IF;
    ELSE
      -- User exists, just update their role and name in hr_profiles
      UPDATE public.hr_profiles 
      SET role = v_role, name = v_name 
      WHERE email = v_email;
    END IF;
  END LOOP;
END $$;
