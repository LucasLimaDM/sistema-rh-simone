CREATE TABLE IF NOT EXISTS public.empresa_contratante (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  inscricao_estadual TEXT,
  endereco JSONB NOT NULL DEFAULT '{}'::jsonb,
  logo_url TEXT,
  header_template JSONB NOT NULL DEFAULT '{}'::jsonb,
  nome_responsavel TEXT NOT NULL,
  cpf_responsavel TEXT NOT NULL,
  assinatura_responsavel_url TEXT,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cargo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresa_contratante(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao_rich_text JSONB NOT NULL DEFAULT '{}'::jsonb,
  valor_hora DECIMAL NOT NULL DEFAULT 0,
  valor_diaria DECIMAL NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.colaborador (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresa_contratante(id) ON DELETE CASCADE,
  tipo_colaborador TEXT NOT NULL CHECK (tipo_colaborador IN ('PF', 'MEI')),
  nome_completo TEXT NOT NULL,
  cpf TEXT NOT NULL,
  rg TEXT,
  cnpj TEXT,
  data_nascimento DATE,
  cargo_id UUID NOT NULL REFERENCES public.cargo(id) ON DELETE RESTRICT,
  cargo_nome_snapshot TEXT NOT NULL,
  cargo_descricao_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  valor_hora_snapshot DECIMAL NOT NULL DEFAULT 0,
  valor_diaria_snapshot DECIMAL NOT NULL DEFAULT 0,
  email TEXT NOT NULL,
  telefone TEXT,
  endereco JSONB NOT NULL DEFAULT '{}'::jsonb,
  assinatura_url TEXT,
  dados_dinamicos JSONB,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.usuario_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  nome_completo TEXT NOT NULL,
  cpf TEXT NOT NULL,
  tipo_usuario TEXT NOT NULL CHECK (tipo_usuario IN ('Admin', 'Coordenadora', 'NovoUsuario', 'Colaborador', 'Encarregado')),
  senha_hash TEXT NOT NULL,
  assinatura_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.configuracao_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuario_sistema(id) ON DELETE CASCADE,
  notificacoes_email BOOLEAN NOT NULL DEFAULT true,
  notificacoes_push BOOLEAN NOT NULL DEFAULT true,
  assinatura_padrao_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.modelo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresa_contratante(id) ON DELETE SET NULL,
  tipo_documento TEXT NOT NULL CHECK (tipo_documento IN ('Contrato', 'OrdemServico', 'NR')),
  nome TEXT NOT NULL,
  descricao TEXT,
  versao_atual INTEGER NOT NULL DEFAULT 1,
  arquivo_original_url TEXT NOT NULL,
  campos_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  placeholders JSONB NOT NULL DEFAULT '{}'::jsonb,
  regras_autopreenchimento JSONB NOT NULL DEFAULT '{}'::jsonb,
  regras_assinatura JSONB NOT NULL DEFAULT '{}'::jsonb,
  campos_editaveis_pdf JSONB NOT NULL DEFAULT '{}'::jsonb,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.modelo_versao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modelo_id UUID NOT NULL REFERENCES public.modelo(id) ON DELETE CASCADE,
  versao INTEGER NOT NULL,
  arquivo_url TEXT NOT NULL,
  campos_config_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  alterado_por_usuario_id UUID NOT NULL REFERENCES public.usuario_sistema(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.campo_modelo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modelo_id UUID NOT NULL REFERENCES public.modelo(id) ON DELETE CASCADE,
  nome_campo TEXT NOT NULL,
  chave_placeholder TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('text', 'date', 'number', 'select', 'rich_text', 'boolean', 'signature')),
  obrigatorio BOOLEAN NOT NULL DEFAULT false,
  fonte_dado TEXT NOT NULL CHECK (fonte_dado IN ('manual', 'colaborador', 'cargo', 'empresa', 'calculado')),
  ordem INTEGER NOT NULL DEFAULT 0,
  config_extra JSONB
);

CREATE TABLE IF NOT EXISTS public.documento_gerado (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modelo_id UUID NOT NULL REFERENCES public.modelo(id) ON DELETE RESTRICT,
  modelo_versao_id UUID NOT NULL REFERENCES public.modelo_versao(id) ON DELETE RESTRICT,
  empresa_id UUID NOT NULL REFERENCES public.empresa_contratante(id) ON DELETE RESTRICT,
  cargo_id UUID REFERENCES public.cargo(id) ON DELETE SET NULL,
  colaborador_id UUID REFERENCES public.colaborador(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  tipo_documento TEXT NOT NULL CHECK (tipo_documento IN ('Contrato', 'OrdemServico', 'NR')),
  status TEXT NOT NULL CHECK (status IN ('rascunho', 'finalizado', 'arquivado')),
  versao_atual INTEGER NOT NULL DEFAULT 1,
  arquivo_pdf_url TEXT,
  arquivo_renderizado_url TEXT,
  dados_preenchidos JSONB NOT NULL DEFAULT '{}'::jsonb,
  responsavel_empresa_nome TEXT,
  responsavel_empresa_assinatura_url TEXT,
  testemunha_1_nome TEXT,
  testemunha_1_cpf TEXT,
  testemunha_1_assinatura_url TEXT,
  testemunha_2_nome TEXT,
  testemunha_2_cpf TEXT,
  testemunha_2_assinatura_url TEXT,
  assinatura_colaborador_url TEXT,
  campos_editaveis_pdf JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL REFERENCES public.usuario_sistema(id) ON DELETE RESTRICT,
  updated_by UUID REFERENCES public.usuario_sistema(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.documento_versao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id UUID NOT NULL REFERENCES public.documento_gerado(id) ON DELETE CASCADE,
  versao INTEGER NOT NULL,
  arquivo_pdf_url TEXT NOT NULL,
  dados_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  alterado_por_usuario_id UUID NOT NULL REFERENCES public.usuario_sistema(id) ON DELETE RESTRICT,
  motivo_alteracao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.documento_anexo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id UUID NOT NULL REFERENCES public.documento_gerado(id) ON DELETE CASCADE,
  arquivo_url TEXT NOT NULL,
  tipo_anexo TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.auditoria_documento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entidade TEXT NOT NULL,
  entidade_id UUID NOT NULL,
  acao TEXT NOT NULL CHECK (acao IN ('create', 'update', 'delete', 'clone', 'export', 'approve', 'login', 'upload_assinatura')),
  antes JSONB,
  depois JSONB,
  usuario_id UUID NOT NULL REFERENCES public.usuario_sistema(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Configuration
ALTER TABLE public.empresa_contratante ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cargo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaborador ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracao_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modelo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modelo_versao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campo_modelo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documento_gerado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documento_versao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documento_anexo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria_documento ENABLE ROW LEVEL SECURITY;

-- Policies for Authenticated Users (Full access for now)
DROP POLICY IF EXISTS "authenticated_all" ON public.empresa_contratante;
CREATE POLICY "authenticated_all" ON public.empresa_contratante FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all" ON public.cargo;
CREATE POLICY "authenticated_all" ON public.cargo FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all" ON public.colaborador;
CREATE POLICY "authenticated_all" ON public.colaborador FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all" ON public.usuario_sistema;
CREATE POLICY "authenticated_all" ON public.usuario_sistema FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all" ON public.configuracao_usuario;
CREATE POLICY "authenticated_all" ON public.configuracao_usuario FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all" ON public.modelo;
CREATE POLICY "authenticated_all" ON public.modelo FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all" ON public.modelo_versao;
CREATE POLICY "authenticated_all" ON public.modelo_versao FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all" ON public.campo_modelo;
CREATE POLICY "authenticated_all" ON public.campo_modelo FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all" ON public.documento_gerado;
CREATE POLICY "authenticated_all" ON public.documento_gerado FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all" ON public.documento_versao;
CREATE POLICY "authenticated_all" ON public.documento_versao FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all" ON public.documento_anexo;
CREATE POLICY "authenticated_all" ON public.documento_anexo FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all" ON public.auditoria_documento;
CREATE POLICY "authenticated_all" ON public.auditoria_documento FOR ALL TO authenticated USING (true) WITH CHECK (true);
