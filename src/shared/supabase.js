import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://edwpsahpqdlbiqrelyfm.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_filexaTBjLAbgRGNwscrEg_CLvIyh8_';
export const META = 10;

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
