CREATE TABLE IF NOT EXISTS public.hr_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'NovoUsuario',
    company TEXT NOT NULL DEFAULT 'Primer Pisos',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company TEXT NOT NULL,
    name TEXT NOT NULL,
    cpf TEXT,
    birth_date DATE,
    contract_type TEXT NOT NULL DEFAULT 'CLT',
    role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ativo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.employee_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    expiry_date DATE,
    status TEXT NOT NULL DEFAULT 'up-to-date',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.time_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    track_date DATE NOT NULL,
    in1 TIME,
    out1 TIME,
    in2 TIME,
    out2 TIME,
    total_hours NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.work_scales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    period TEXT NOT NULL,
    schedule JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(employee_id, period)
);

ALTER TABLE public.hr_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_scales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hr_profiles_policy" ON public.hr_profiles;
CREATE POLICY "hr_profiles_policy" ON public.hr_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "employees_policy" ON public.employees;
CREATE POLICY "employees_policy" ON public.employees FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "employee_documents_policy" ON public.employee_documents;
CREATE POLICY "employee_documents_policy" ON public.employee_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "time_tracks_policy" ON public.time_tracks;
CREATE POLICY "time_tracks_policy" ON public.time_tracks FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "work_scales_policy" ON public.work_scales;
CREATE POLICY "work_scales_policy" ON public.work_scales FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.handle_new_hr_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.hr_profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_hr ON auth.users;
CREATE TRIGGER on_auth_user_created_hr
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_hr_user();

DO $$
DECLARE
  v_user_id uuid;
  emp1_id uuid := gen_random_uuid();
  emp2_id uuid := gen_random_uuid();
  emp3_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'simone@primerpisos.com.br') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'simone@primerpisos.com.br',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Simone"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.hr_profiles (id, email, name, role, company)
    VALUES (v_user_id, 'simone@primerpisos.com.br', 'Simone', 'Admin', 'Primer Pisos')
    ON CONFLICT (id) DO UPDATE SET role = 'Admin', company = 'Primer Pisos';
  END IF;

  INSERT INTO public.employees (id, company, name, cpf, birth_date, contract_type, role) VALUES
  (emp1_id, 'Primer Pisos', 'João da Silva', '111.111.111-11', '1990-05-15', 'CLT', 'Aplicador'),
  (emp2_id, 'Primer Pisos', 'Maria Souza', '222.222.222-22', '1988-10-20', 'CLT', 'Encarregada'),
  (emp3_id, 'Piso Plano', 'Carlos Santos', '333.333.333-33', '1995-02-10', 'MEI', 'Ajudante')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.employee_documents (employee_id, document_type, expiry_date) VALUES
  (emp1_id, 'ASO', CURRENT_DATE + INTERVAL '6 months'),
  (emp1_id, 'NR-35', CURRENT_DATE - INTERVAL '5 days'),
  (emp2_id, 'ASO', CURRENT_DATE + INTERVAL '10 days'),
  (emp3_id, 'ASO', CURRENT_DATE + INTERVAL '1 year')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.time_tracks (employee_id, track_date, in1, out1, in2, out2, total_hours) VALUES
  (emp1_id, CURRENT_DATE, '08:00', '12:00', '13:00', '17:00', 8),
  (emp2_id, CURRENT_DATE, '08:15', '12:00', '13:00', '17:30', 8.25)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.work_scales (employee_id, period, schedule) VALUES
  (emp1_id, to_char(CURRENT_DATE, 'YYYY-MM'), '{"Seg": "08:00 - 17:00", "Ter": "08:00 - 17:00", "Qua": "08:00 - 17:00", "Qui": "08:00 - 17:00", "Sex": "08:00 - 17:00", "Sab": "08:00 - 12:00", "Dom": "Folga"}'::jsonb),
  (emp2_id, to_char(CURRENT_DATE, 'YYYY-MM'), '{"Seg": "08:00 - 17:00", "Ter": "08:00 - 17:00", "Qua": "08:00 - 17:00", "Qui": "08:00 - 17:00", "Sex": "08:00 - 17:00", "Sab": "08:00 - 12:00", "Dom": "Folga"}'::jsonb)
  ON CONFLICT (id) DO NOTHING;
END $$;
