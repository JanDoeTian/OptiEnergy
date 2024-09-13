import type { SupabaseClient } from '@supabase/supabase-js';

import { createClient } from 'backend/supabase/browserClient';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const isSupabase = CONFIG.auth.method === 'supabase';

export const supabase = isSupabase ? createClient() : ({} as SupabaseClient<any, 'public', any>);
