import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rtsslsqkyzwfjxtimuuj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_jLD-FMVXm8pIfUfFYfjtgQ_9K_8QUNn";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
