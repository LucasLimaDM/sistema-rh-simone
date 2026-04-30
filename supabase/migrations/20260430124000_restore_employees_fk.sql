-- Restaura a chave estrangeira legada para a tabela employees.
-- Isso é necessário porque componentes globais (como o Layout) ainda podem estar consultando 
-- a relação employees!inner (ex: documentos próximos do vencimento), e a migração anterior 
-- removeu essa FK ao transferir a referência para a tabela colaborador, causando erro HTTP 400 no PostgREST.

DO $$
BEGIN
  -- Restaura FK para employee_documents
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'employee_documents_legacy_fk'
  ) THEN
    ALTER TABLE public.employee_documents
    ADD CONSTRAINT employee_documents_legacy_fk
    FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;
  END IF;

  -- Restaura FK para time_tracks
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'time_tracks_legacy_fk'
  ) THEN
    ALTER TABLE public.time_tracks
    ADD CONSTRAINT time_tracks_legacy_fk
    FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;
  END IF;

  -- Restaura FK para work_scales
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'work_scales_legacy_fk'
  ) THEN
    ALTER TABLE public.work_scales
    ADD CONSTRAINT work_scales_legacy_fk
    FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;
  END IF;

  -- Restaura FK para hr_generated_documents
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'hr_generated_documents_legacy_fk'
  ) THEN
    ALTER TABLE public.hr_generated_documents
    ADD CONSTRAINT hr_generated_documents_legacy_fk
    FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;
  END IF;
END $$;
