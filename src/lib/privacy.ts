import { supabase } from "@/integrations/supabase/client";

export interface PrivacySettings {
  user_id: string;
  profile_visibility: 'public' | 'private' | 'friends';
  discoverability: 'everyone' | 'contacts_only' | 'nobody';
  message_allowance: 'everyone' | 'friends' | 'nobody';
  show_location: boolean;
  use_location_for_features: boolean;
}

const defaultSettings: PrivacySettings = {
  user_id: "",
  profile_visibility: 'public',
  discoverability: 'everyone',
  message_allowance: 'everyone',
  show_location: false,
  use_location_for_features: true
};

export async function getPrivacySettings(): Promise<PrivacySettings | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  try {
    const { data, error } = await supabase
      .from('privacy_settings')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // Record not found, insert default
      const { data: inserted } = await supabase.from('privacy_settings').insert({ ...defaultSettings, user_id: session.user.id }).select().single();
      return inserted as PrivacySettings;
    }
    
    if (error && error.code === 'PGRST205') {
      // Table doesn't exist yet
      return { ...defaultSettings, user_id: session.user.id };
    }
    
    return data as PrivacySettings || { ...defaultSettings, user_id: session.user.id };
  } catch (e) {
    return { ...defaultSettings, user_id: session.user.id };
  }
}

export async function updatePrivacySettings(updates: Partial<Omit<PrivacySettings, 'user_id'>>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Não autenticado");

  const { error } = await supabase
    .from('privacy_settings')
    .update(updates)
    .eq('user_id', session.user.id);

  if (error && error.code !== 'PGRST205') throw new Error(error.message);
}

export async function requestDataExport() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Não autenticado");

  const { error } = await supabase.from('privacy_requests').insert({
    user_id: session.user.id,
    type: 'portability',
    internal_notes: 'Usuário solicitou exportação na Central de Privacidade.'
  });

  if (error && error.code !== 'PGRST205') throw new Error(error.message);
}

export async function requestAccountDeletion() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Não autenticado");

  const { error } = await supabase.from('privacy_requests').insert({
    user_id: session.user.id,
    type: 'deletion',
    internal_notes: 'Usuário solicitou exclusão de conta via UI.'
  });

  if (error && error.code !== 'PGRST205') throw new Error(error.message);
  
  await supabase.auth.signOut();
}

export async function getPrivacyRequests() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('privacy_requests')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });
    
  if (error && error.code !== 'PGRST205') throw new Error(error.message);
  return data || [];
}

export async function submitPrivacyRequest(type: string, notes?: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Não autenticado");

  const { error } = await supabase.from('privacy_requests').insert({
    user_id: session.user.id,
    type,
    internal_notes: notes || null
  });

  if (error && error.code !== 'PGRST205') throw new Error(error.message);
}

