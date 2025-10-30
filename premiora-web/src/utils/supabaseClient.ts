import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase
const supabaseUrl = 'https://mibwqfvuilpwpuenobru.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pYndxZnZ1aWxwd3B1ZW5vYnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NDMyNzEsImV4cCI6MjA3NzIxOTI3MX0.EeTOOnS0ADJA4eILS_0NP2JkHgBOr-ny2esBSs-4o9s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
