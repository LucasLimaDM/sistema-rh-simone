DO $$
BEGIN
  -- Update name and avatar in hr_profiles
  UPDATE public.hr_profiles
  SET 
    name = 'Simone Chalub',
    avatar_url = 'https://www.dropbox.com/scl/fi/demr6ujwsy5pvnmzngcem/SELFIE-CURRICULO-FUNDO-BRANCO.png?rlkey=e3bdrmgyhb43xeud7x9wfqgvd&raw=1'
  WHERE email = 'simone@primerpisos.com.br';

  -- Update name in usuario_sistema
  UPDATE public.usuario_sistema
  SET 
    nome_completo = 'Simone Chalub'
  WHERE email = 'simone@primerpisos.com.br';

  -- Update name in auth.users metadata
  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"name": "Simone Chalub"}'::jsonb
  WHERE email = 'simone@primerpisos.com.br';
END $$;
