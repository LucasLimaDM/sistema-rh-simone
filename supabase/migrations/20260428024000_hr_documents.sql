CREATE TABLE IF NOT EXISTS hr_document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  company TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES hr_document_templates(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Gerado',
  pdf_url TEXT,
  company TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.hr_profiles ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE public.hr_profiles ADD COLUMN IF NOT EXISTS signature_url TEXT;

ALTER TABLE public.hr_document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_generated_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hr_document_templates_policy" ON public.hr_document_templates;
CREATE POLICY "hr_document_templates_policy" ON public.hr_document_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "hr_generated_documents_policy" ON public.hr_generated_documents;
CREATE POLICY "hr_generated_documents_policy" ON public.hr_generated_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
