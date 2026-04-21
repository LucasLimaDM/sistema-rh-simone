DO $DO$
BEGIN
  INSERT INTO storage.buckets (id, name, public) VALUES ('employee_documents', 'employee_documents', true) ON CONFLICT (id) DO NOTHING;
END $DO$;

DROP POLICY IF EXISTS "public_read_employee_documents" ON storage.objects;
CREATE POLICY "public_read_employee_documents" ON storage.objects FOR SELECT TO public USING (bucket_id = 'employee_documents');

DROP POLICY IF EXISTS "authenticated_insert_employee_documents" ON storage.objects;
CREATE POLICY "authenticated_insert_employee_documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'employee_documents');

DROP POLICY IF EXISTS "authenticated_update_employee_documents" ON storage.objects;
CREATE POLICY "authenticated_update_employee_documents" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'employee_documents');

DROP POLICY IF EXISTS "authenticated_delete_employee_documents" ON storage.objects;
CREATE POLICY "authenticated_delete_employee_documents" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'employee_documents');
