import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rtsslsqkyzwfjxtimuuj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0c3Nsc3FreXp3Zmp4dGltdXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyODU4NjgsImV4cCI6MjA4OTg2MTg2OH0.dbZlWT32euQx3j9Vgvth4WFd2B2xQlA9ftLafVGRwR8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
