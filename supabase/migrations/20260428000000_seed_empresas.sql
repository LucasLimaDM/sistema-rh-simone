DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.empresa_contratante WHERE nome_fantasia = 'Primer Pisos') THEN
    INSERT INTO public.empresa_contratante (razao_social, nome_fantasia, cnpj, nome_responsavel, cpf_responsavel, endereco, header_template)
    VALUES ('Primer Pisos LTDA', 'Primer Pisos', '00.000.000/0001-00', 'Admin Primer', '000.000.000-00', '{}'::jsonb, '{}'::jsonb);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.empresa_contratante WHERE nome_fantasia = 'Piso Plano') THEN
    INSERT INTO public.empresa_contratante (razao_social, nome_fantasia, cnpj, nome_responsavel, cpf_responsavel, endereco, header_template)
    VALUES ('Piso Plano LTDA', 'Piso Plano', '11.111.111/0001-11', 'Admin Plano', '111.111.111-11', '{}'::jsonb, '{}'::jsonb);
  END IF;
END $$;
