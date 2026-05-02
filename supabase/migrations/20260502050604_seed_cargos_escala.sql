DO $$
DECLARE
  v_empresa record;
  v_id1 uuid;
  v_id2 uuid;
BEGIN
  FOR v_empresa IN SELECT id, nome_fantasia FROM public.empresa_contratante LOOP
    
    -- Encarregado de Almoxarifado
    IF NOT EXISTS (SELECT 1 FROM public.cargo WHERE empresa_id = v_empresa.id AND nome ILIKE 'Encarregado de Almoxarifado') THEN
      v_id1 := gen_random_uuid();
      
      INSERT INTO public.cargo (id, empresa_id, nome, valor_hora, valor_diaria, ativo, descricao_rich_text)
      VALUES (v_id1, v_empresa.id, 'Encarregado de Almoxarifado', 0, 0, true, '{}'::jsonb);

      INSERT INTO public.hr_roles (id, company, name, hourly_rate, daily_rate)
      VALUES (v_id1, v_empresa.nome_fantasia, 'Encarregado de Almoxarifado', 0, 0)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Encarregado de Veículos
    IF NOT EXISTS (SELECT 1 FROM public.cargo WHERE empresa_id = v_empresa.id AND (nome ILIKE 'Encarregado de Veículo%')) THEN
      v_id2 := gen_random_uuid();

      INSERT INTO public.cargo (id, empresa_id, nome, valor_hora, valor_diaria, ativo, descricao_rich_text)
      VALUES (v_id2, v_empresa.id, 'Encarregado de Veículos', 0, 0, true, '{}'::jsonb);

      INSERT INTO public.hr_roles (id, company, name, hourly_rate, daily_rate)
      VALUES (v_id2, v_empresa.nome_fantasia, 'Encarregado de Veículos', 0, 0)
      ON CONFLICT DO NOTHING;
    END IF;

  END LOOP;
END $$;
