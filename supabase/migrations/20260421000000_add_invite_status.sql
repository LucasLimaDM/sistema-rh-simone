DO $$
BEGIN
  ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS invite_status TEXT DEFAULT 'Não Convidado';
END $$;
