-- 1. Insert new roles into cargo
DO $do$
DECLARE
  emp RECORD;
  rName TEXT;
  roles TEXT[] := ARRAY['Representante Comercial', 'Coordenador', 'Assistente Administrativo', 'Diretor'];
BEGIN
  FOR emp IN SELECT id FROM public.empresa_contratante LOOP
    FOREACH rName IN ARRAY roles LOOP
      IF NOT EXISTS (SELECT 1 FROM public.cargo WHERE empresa_id = emp.id AND nome = rName) THEN
        INSERT INTO public.cargo (empresa_id, nome, descricao_rich_text, valor_hora, valor_diaria, ativo)
        VALUES (emp.id, rName, '{}'::jsonb, 0, 0, true);
      END IF;
    END LOOP;
  END LOOP;
END $do$;

-- 2. Update the constraint on colaborador to allow 'Ltda.'
ALTER TABLE public.colaborador DROP CONSTRAINT IF EXISTS colaborador_tipo_colaborador_check;
ALTER TABLE public.colaborador ADD CONSTRAINT colaborador_tipo_colaborador_check CHECK (tipo_colaborador = ANY (ARRAY['PF'::text, 'MEI'::text, 'Ltda.'::text]));
