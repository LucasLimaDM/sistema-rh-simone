CREATE TABLE IF NOT EXISTS public.hr_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  name TEXT NOT NULL,
  hourly_rate NUMERIC NOT NULL DEFAULT 0,
  daily_rate NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.hr_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all_hr_roles" ON public.hr_roles;
CREATE POLICY "authenticated_all_hr_roles" ON public.hr_roles FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.hr_roles(id) ON DELETE SET NULL;
