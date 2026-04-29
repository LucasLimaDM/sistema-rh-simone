ALTER TABLE public.empresa_contratante ADD COLUMN IF NOT EXISTS inscricao_municipal TEXT;

DO $$
DECLARE
  v_first_user_id uuid;
  v_first_user_email text;
BEGIN
  -- Identifica o primeiro usuário cadastrado para promovê-lo a Admin
  SELECT id, email INTO v_first_user_id, v_first_user_email 
  FROM public.usuario_sistema 
  ORDER BY created_at ASC 
  LIMIT 1;

  IF v_first_user_id IS NOT NULL THEN
    UPDATE public.usuario_sistema SET tipo_usuario = 'Admin' WHERE id = v_first_user_id;
    UPDATE public.vendedores SET role = 'admin' WHERE user_id = v_first_user_id OR email = v_first_user_email;
  END IF;
END $$;
