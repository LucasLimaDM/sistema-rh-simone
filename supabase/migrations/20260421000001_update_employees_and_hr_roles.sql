DO $DO$
BEGIN
  -- Add new employee fields
  ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS phone TEXT;
  ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS cep TEXT;
  ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS logradouro TEXT;
  ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS numero TEXT;
  ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS complemento TEXT;
  ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS bairro TEXT;
  ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS cidade TEXT;
  ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS uf TEXT;

  -- Add file_url to documents
  ALTER TABLE public.employee_documents ADD COLUMN IF NOT EXISTS file_url TEXT;

  -- Update existing roles in hr_profiles to map to the simplified Admin/Usuário
  UPDATE public.hr_profiles SET role = 'Admin' WHERE role IN ('Coordenadora');
  UPDATE public.hr_profiles SET role = 'Usuário' WHERE role IN ('Colaborador', 'Encarregado', 'NovoUsuario');
END $DO$;
