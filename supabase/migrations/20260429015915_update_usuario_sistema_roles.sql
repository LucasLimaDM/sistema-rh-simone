-- Adicionar 'Usuario' ao check constraint de usuario_sistema
DO $$
BEGIN
  -- Remover o check constraint antigo
  ALTER TABLE public.usuario_sistema DROP CONSTRAINT IF EXISTS usuario_sistema_tipo_usuario_check;
  
  -- Adicionar o novo check constraint permitindo 'Usuario'
  ALTER TABLE public.usuario_sistema ADD CONSTRAINT usuario_sistema_tipo_usuario_check 
    CHECK (tipo_usuario = ANY (ARRAY['Admin'::text, 'Coordenadora'::text, 'NovoUsuario'::text, 'Colaborador'::text, 'Encarregado'::text, 'Usuario'::text]));
    
  -- Atualizar os registros antigos para a nova nomenclatura
  UPDATE public.usuario_sistema SET tipo_usuario = 'Usuario' WHERE tipo_usuario = 'Colaborador' OR tipo_usuario = 'Coordenadora' OR tipo_usuario = 'NovoUsuario';
  UPDATE public.hr_profiles SET role = 'Usuario' WHERE role = 'Colaborador' OR role = 'Coordenadora' OR role = 'NovoUsuario';
END $$;
