DO $$
DECLARE
  v_empresa RECORD;
  v_cargos TEXT[] := ARRAY['Representante Comercial', 'Coordenador', 'Assistente Administrativo', 'Diretor'];
  v_cargo TEXT;
BEGIN
  -- Atualiza os colaboradores existentes para terem empresas_vinculadas populadas no dados_dinamicos
  UPDATE public.colaborador
  SET dados_dinamicos = COALESCE(dados_dinamicos, '{}'::jsonb) || jsonb_build_object('empresas_vinculadas', jsonb_build_array(empresa_id))
  WHERE dados_dinamicos->'empresas_vinculadas' IS NULL;

  -- Adiciona os cargos padroes para todas as empresas ativas
  FOR v_empresa IN SELECT id FROM public.empresa_contratante WHERE ativa = true LOOP
    FOREACH v_cargo IN ARRAY v_cargos LOOP
      IF NOT EXISTS (SELECT 1 FROM public.cargo WHERE empresa_id = v_empresa.id AND nome = v_cargo) THEN
        INSERT INTO public.cargo (empresa_id, nome, descricao_rich_text, valor_hora, valor_diaria, ativo)
        VALUES (v_empresa.id, v_cargo, '{}'::jsonb, 0, 0, true);
      END IF;
    END LOOP;
  END LOOP;
END $$;
