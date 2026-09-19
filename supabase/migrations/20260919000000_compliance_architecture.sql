-- 20260919000000_compliance_architecture.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================================
-- FASE 2: MODELO DE DADOS E SEPARAÇÃO PÚBLICO/PRIVADO
-- =================================================================================

-- 1. perfis públicos (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'professional', 'moderator', 'admin', 'privacy_admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. perfis privados (private_profiles)
CREATE TABLE IF NOT EXISTS public.private_profiles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    cpf TEXT UNIQUE,
    birth_date DATE,
    phone TEXT,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================================
-- FASE 4: AFERIÇÃO DE IDADE E PROTEÇÃO DE MENORES
-- =================================================================================

CREATE TABLE IF NOT EXISTS public.age_assurance (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    status TEXT DEFAULT 'unknown' CHECK (status IN ('unknown', 'adult', 'minor', 'verification_pending', 'verification_verified')),
    method TEXT,
    verified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    provider TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.guardian_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    minor_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    guardian_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked', 'rejected')),
    permissions JSONB DEFAULT '{}'::jsonb,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    UNIQUE (minor_user_id, guardian_user_id)
);

-- =================================================================================
-- FASE 3: PRIVACIDADE E DIREITOS DO TITULAR
-- =================================================================================

CREATE TABLE IF NOT EXISTS public.privacy_settings (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'friends')),
    discoverability TEXT DEFAULT 'everyone' CHECK (discoverability IN ('everyone', 'contacts_only', 'nobody')),
    message_allowance TEXT DEFAULT 'everyone' CHECK (message_allowance IN ('everyone', 'friends', 'nobody')),
    show_location BOOLEAN DEFAULT false,
    use_location_for_features BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.policy_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    policy_type TEXT NOT NULL CHECK (policy_type IN ('terms', 'privacy', 'community', 'data_processing')),
    version TEXT NOT NULL,
    accepted_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked'))
);

CREATE TABLE IF NOT EXISTS public.privacy_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('access', 'correction', 'portability', 'deletion', 'consent_revoke', 'information', 'other')),
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'received', 'in_review', 'completed', 'rejected', 'cancelled')),
    internal_notes TEXT,
    response TEXT,
    protocol TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    processed_by UUID REFERENCES auth.users(id)
);

-- =================================================================================
-- FASE 5: BLOQUEIOS, DENÚNCIAS E MODERAÇÃO
-- =================================================================================

CREATE TABLE IF NOT EXISTS public.blocks (
    blocker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment', 'profile', 'community', 'message')),
    target_id UUID NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'in_review', 'actioned', 'dismissed', 'appealed', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.moderation_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'closed')),
    priority TEXT DEFAULT 'standard' CHECK (priority IN ('standard', 'high', 'critical', 'intimate_content', 'child_safety')),
    severity TEXT,
    sla_deadline_at TIMESTAMPTZ,
    decision TEXT,
    decision_reason TEXT,
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    handled_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ
);

-- =================================================================================
-- FASE 6: RECURSOS E AUDITORIA
-- =================================================================================

CREATE TABLE IF NOT EXISTS public.appeals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.moderation_cases(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'accepted', 'rejected', 'closed')),
    decision TEXT,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================================
-- FASE 8: VERIFICAÇÃO PROFISSIONAL
-- =================================================================================

CREATE TABLE IF NOT EXISTS public.verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    specialty TEXT NOT NULL,
    council_number TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewer_id UUID REFERENCES auth.users(id),
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================================
-- RLS POLICIES (Segurança em Nível de Linha)
-- =================================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.age_assurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can read, users can update their own
CREATE POLICY "Profiles are readable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Private Profiles: Users can read/update own, privacy admins can read
CREATE POLICY "Users can access own private data" ON public.private_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own private data" ON public.private_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Privacy Admins can access private data" ON public.private_profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'privacy_admin'))
);

-- Age Assurance: Own user and admins
CREATE POLICY "Users can read own age status" ON public.age_assurance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can read age status" ON public.age_assurance FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator', 'privacy_admin'))
);

-- Privacy Settings: Own user
CREATE POLICY "Users manage own privacy settings" ON public.privacy_settings FOR ALL USING (auth.uid() = user_id);

-- Guardian Links: Participants
CREATE POLICY "Participants see guardian links" ON public.guardian_links FOR SELECT USING (auth.uid() = minor_user_id OR auth.uid() = guardian_user_id);

-- Blocks: Own user
CREATE POLICY "Users manage own blocks" ON public.blocks FOR ALL USING (auth.uid() = blocker_id);

-- Reports: Reporters can see their own, Moderators see all
CREATE POLICY "Users see own reports" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Users can insert reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Moderators see all reports" ON public.reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- Moderation Cases: Moderators only
CREATE POLICY "Moderators manage cases" ON public.moderation_cases FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator', 'privacy_admin'))
);

-- Appeals: Own user, Moderators
CREATE POLICY "Users see own appeals" ON public.appeals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert appeals" ON public.appeals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Moderators manage appeals" ON public.appeals FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator', 'privacy_admin'))
);

-- Audit Logs: Admins only
CREATE POLICY "Admins read audit logs" ON public.audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
-- Allow system to insert audit logs via service_role bypassing RLS, or grant insert to authenticated if handled carefully.
CREATE POLICY "Anyone can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Functions and Triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_private_profiles BEFORE UPDATE ON public.private_profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_age_assurance BEFORE UPDATE ON public.age_assurance FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_privacy_settings BEFORE UPDATE ON public.privacy_settings FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_privacy_requests BEFORE UPDATE ON public.privacy_requests FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_reports BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_verification_requests BEFORE UPDATE ON public.verification_requests FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

