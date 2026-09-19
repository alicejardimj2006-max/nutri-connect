ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own privacy settings" ON public.privacy_settings;
CREATE POLICY "Users can select own privacy settings" ON public.privacy_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own privacy settings" ON public.privacy_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own privacy settings" ON public.privacy_settings FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE public.privacy_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create own privacy requests" ON public.privacy_requests;
DROP POLICY IF EXISTS "Users can select own privacy requests" ON public.privacy_requests;
CREATE POLICY "Users can select own privacy requests" ON public.privacy_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own privacy requests" ON public.privacy_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
