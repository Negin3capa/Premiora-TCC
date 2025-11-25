import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback to anon key if service role key is missing (client-side)
// This prevents the app from crashing, though admin operations will fail with 401/403
const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
    console.warn(
        "Missing Supabase URL or Key. Operations may fail.",
    );
}

export const supabaseAdmin = createClient(
    supabaseUrl || "",
    supabaseKey || "",
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    },
);
