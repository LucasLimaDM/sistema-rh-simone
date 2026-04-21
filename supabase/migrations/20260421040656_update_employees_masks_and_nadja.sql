ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS company_name TEXT;

DO $$
DECLARE
  v_nadja_record record;
BEGIN
  -- Update masks for existing fields avoiding null problems
  UPDATE public.employees
  SET 
    phone = regexp_replace(COALESCE(phone, ''), '\D', '', 'g'),
    cnpj = regexp_replace(COALESCE(cnpj, ''), '\D', '', 'g'),
    cep = regexp_replace(COALESCE(cep, ''), '\D', '', 'g');
    
  UPDATE public.employees
  SET phone = 
    CASE 
      WHEN length(phone) = 11 THEN '(' || substr(phone, 1, 2) || ') ' || substr(phone, 3, 5) || '-' || substr(phone, 8, 4)
      WHEN length(phone) = 10 THEN '(' || substr(phone, 1, 2) || ') ' || substr(phone, 3, 4) || '-' || substr(phone, 7, 4)
      ELSE phone 
    END
  WHERE phone IS NOT NULL AND phone <> '';

  UPDATE public.employees
  SET cnpj = 
    CASE 
      WHEN length(cnpj) = 14 THEN substr(cnpj, 1, 2) || '.' || substr(cnpj, 3, 3) || '.' || substr(cnpj, 6, 3) || '/' || substr(cnpj, 9, 4) || '-' || substr(cnpj, 13, 2)
      ELSE cnpj 
    END
  WHERE cnpj IS NOT NULL AND cnpj <> '';

  UPDATE public.employees
  SET cep = 
    CASE 
      WHEN length(cep) = 8 THEN substr(cep, 1, 5) || '-' || substr(cep, 6, 3)
      ELSE cep 
    END
  WHERE cep IS NOT NULL AND cep <> '';

  -- Duplicate Nadja
  SELECT * INTO v_nadja_record FROM public.employees WHERE name ILIKE '%Nadja%' AND company = 'Primer Pisos' LIMIT 1;
  
  IF FOUND THEN
    IF NOT EXISTS (SELECT 1 FROM public.employees WHERE name = v_nadja_record.name AND company = 'Piso Plano') THEN
      INSERT INTO public.employees (
        company, name, cpf, birth_date, contract_type, role, status, email, address, rg, cnpj, 
        admission_date, observations, phone, cep, logradouro, numero, complemento, bairro, cidade, uf, company_name
      ) VALUES (
        'Piso Plano', v_nadja_record.name, v_nadja_record.cpf, v_nadja_record.birth_date, v_nadja_record.contract_type, v_nadja_record.role, v_nadja_record.status, v_nadja_record.email, v_nadja_record.address, v_nadja_record.rg, v_nadja_record.cnpj, 
        v_nadja_record.admission_date, v_nadja_record.observations, v_nadja_record.phone, v_nadja_record.cep, v_nadja_record.logradouro, v_nadja_record.numero, v_nadja_record.complemento, v_nadja_record.bairro, v_nadja_record.cidade, v_nadja_record.uf, v_nadja_record.company_name
      );
    END IF;
  END IF;
END $$;
