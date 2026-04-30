DO $$
DECLARE
  emp RECORD;
  default_empresa_id uuid;
  default_cargo_id uuid;
BEGIN
  -- Ensure default empresa exists
  SELECT id INTO default_empresa_id FROM public.empresa_contratante LIMIT 1;
  IF default_empresa_id IS NULL THEN
    INSERT INTO public.empresa_contratante (nome_fantasia, razao_social, cnpj, nome_responsavel, cpf_responsavel)
    VALUES ('Primer Pisos', 'Primer Pisos', '00000000000000', 'Admin', '00000000000')
    RETURNING id INTO default_empresa_id;
  END IF;

  -- Ensure default cargo exists
  SELECT id INTO default_cargo_id FROM public.cargo WHERE empresa_id = default_empresa_id LIMIT 1;
  IF default_cargo_id IS NULL THEN
    INSERT INTO public.cargo (empresa_id, nome, valor_hora, valor_diaria)
    VALUES (default_empresa_id, 'Geral', 0, 0)
    RETURNING id INTO default_cargo_id;
  END IF;

  -- Migrate data from employees to colaborador safely
  FOR emp IN SELECT * FROM public.employees
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.colaborador WHERE id = emp.id) THEN
      INSERT INTO public.colaborador (
        id, empresa_id, tipo_colaborador, nome_completo, cpf, 
        cargo_id, cargo_nome_snapshot, valor_hora_snapshot, valor_diaria_snapshot,
        email
      ) VALUES (
        emp.id, default_empresa_id, 'PF', emp.name, COALESCE(emp.cpf, '00000000000'),
        default_cargo_id, emp.role, 0, 0,
        COALESCE(emp.email, 'sem@email.com')
      );
    END IF;
  END LOOP;
END $$;

-- Safely alter foreign keys to point to colaborador
ALTER TABLE public.time_tracks DROP CONSTRAINT IF EXISTS time_tracks_employee_id_fkey;
ALTER TABLE public.time_tracks ADD CONSTRAINT time_tracks_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.colaborador(id) ON DELETE CASCADE;

ALTER TABLE public.work_scales DROP CONSTRAINT IF EXISTS work_scales_employee_id_fkey;
ALTER TABLE public.work_scales ADD CONSTRAINT work_scales_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.colaborador(id) ON DELETE CASCADE;

ALTER TABLE public.employee_documents DROP CONSTRAINT IF EXISTS employee_documents_employee_id_fkey;
ALTER TABLE public.employee_documents ADD CONSTRAINT employee_documents_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.colaborador(id) ON DELETE CASCADE;

ALTER TABLE public.hr_generated_documents DROP CONSTRAINT IF EXISTS hr_generated_documents_employee_id_fkey;
ALTER TABLE public.hr_generated_documents ADD CONSTRAINT hr_generated_documents_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.colaborador(id) ON DELETE CASCADE;
