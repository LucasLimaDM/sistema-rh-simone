DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public) VALUES ('rh_files', 'rh_files', true) ON CONFLICT (id) DO NOTHING;
END $$;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
  FOR ALL
  USING (bucket_id = 'rh_files');
