CREATE TABLE IF NOT EXISTS public.testemunhas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cpf TEXT NOT NULL,
    rg TEXT,
    assinatura_url TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "authenticated_all" ON public.testemunhas;
CREATE POLICY "authenticated_all" ON public.testemunhas FOR ALL TO authenticated USING (true);
