import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
// Supabase now calls this the "publishable" key; older projects call it the "anon" key. Either works.
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as
  | string
  | undefined;

/** True when no Supabase keys are configured: the app runs on built-in demo data stored in this browser. */
export const isDemo = !url || !key || url.includes('your-project');

export const supabase: SupabaseClient | null = isDemo ? null : createClient(url!, key!);

export const BUCKET = 'plot-images';
