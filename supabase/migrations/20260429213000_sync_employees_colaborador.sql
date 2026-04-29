-- Sincronizar dados da tabela employees para a tabela colaborador
DO $$
DECLARE
  emp_record RECORD;
  v_empresa_id uuid;
  v_cargo_id uuid;
  v_cargo_nome text;
  v_cargo_desc jsonb;
  v_valor_hora numeric;
  v_valor_diaria numeric;
BEGIN
  FOR emp_record IN SELECT * FROM public.employees
  LOOP
    -- Verificar se já existe na tabela colaborador
    IF NOT EXISTS (SELECT 1 FROM public.colaborador WHERE id = emp_record.id) THEN
      -- Encontrar empresa_id pela nome_fantasia
      SELECT id INTO v_empresa_id FROM public.empresa_contratante WHERE nome_fantasia = emp_record.company LIMIT 1;
      
      IF v_empresa_id IS NOT NULL THEN
        v_cargo_id := NULL;
        
        -- Tentar encontrar um cargo existente com o mesmo nome na empresa
        SELECT id, nome, descricao_rich_text, valor_hora, valor_diaria 
        INTO v_cargo_id, v_cargo_nome, v_cargo_desc, v_valor_hora, v_valor_diaria 
        FROM public.cargo 
        WHERE empresa_id = v_empresa_id AND nome = emp_record.role LIMIT 1;

        -- Se não encontrou cargo, criar um
        IF v_cargo_id IS NULL THEN
          v_cargo_id := gen_random_uuid();
          v_cargo_nome := COALESCE(emp_record.role, 'Sem Cargo');
          v_cargo_desc := '{}'::jsonb;
          v_valor_hora := 0;
          v_valor_diaria := 0;

          INSERT INTO public.cargo (id, empresa_id, nome, descricao_rich_text, valor_hora, valor_diaria)
          VALUES (v_cargo_id, v_empresa_id, v_cargo_nome, v_cargo_desc, v_valor_hora, v_valor_diaria);
        END IF;

        -- Inserir na tabela colaborador
        INSERT INTO public.colaborador (
          id, empresa_id, tipo_colaborador, nome_completo, cpf, 
          cargo_id, cargo_nome_snapshot, cargo_descricao_snapshot,
          valor_hora_snapshot, valor_diaria_snapshot, email, telefone, endereco,
          dados_dinamicos, ativo
        ) VALUES (
          emp_record.id,
          v_empresa_id,
          CASE 
            WHEN lower(COALESCE(emp_record.contract_type, '')) IN ('pj', 'ltda', 'mei', 'pessoa jurídica') THEN 'pj'
            ELSE 'pf'
          END,
          emp_record.name,
          COALESCE(emp_record.cpf, ''),
          v_cargo_id,
          v_cargo_nome,
          v_cargo_desc,
          v_valor_hora,
          v_valor_diaria,
          COALESCE(emp_record.email, ''),
          COALESCE(emp_record.phone, ''),
          jsonb_build_object(
            'cep', COALESCE(emp_record.cep, ''),
            'logradouro', COALESCE(emp_record.logradouro, ''),
            'numero', COALESCE(emp_record.numero, ''),
            'complemento', COALESCE(emp_record.complemento, ''),
            'bairro', COALESCE(emp_record.bairro, ''),
            'cidade', COALESCE(emp_record.cidade, ''),
            'uf', COALESCE(emp_record.uf, '')
          ),
          jsonb_build_object(
            'admission_date', emp_record.admission_date,
            'observations', emp_record.observations,
            'razao_social', emp_record.company_name
          ),
          emp_record.status = 'ativo'
        );
      END IF;
    END IF;
  END LOOP;
END $$;
