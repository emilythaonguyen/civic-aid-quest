-- Allow authenticated users to update user_stories (for marking stories done)
CREATE POLICY "Authenticated update: user_stories"
  ON public.user_stories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Ensure epics has a SELECT policy if missing (safe to run — will no-op if exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'epics' AND policyname = 'Authenticated read: epics'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated read: epics" ON public.epics FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL)';
  END IF;
END $$;
