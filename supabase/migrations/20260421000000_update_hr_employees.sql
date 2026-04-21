DO $$
BEGIN
  ALTER TABLE public.hr_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

  ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS email TEXT;
  ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS address TEXT;
  ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS rg TEXT;
  ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS cnpj TEXT;
  ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS admission_date DATE;
  ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS observations TEXT;

  -- Ensure Simone's profile has correct name and role
  UPDATE public.hr_profiles 
  SET role = 'Admin', name = 'Simone', avatar_url = 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1'
  WHERE email = 'simone@primerpisos.com.br';
END $$;
