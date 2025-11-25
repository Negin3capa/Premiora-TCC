import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn(
        "Missing Supabase URL or Service Role Key. Admin operations may fail.",
    );
}

export const supabaseAdmin = createClient(
    supabaseUrl || "",
    supabaseServiceRoleKey || "",
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    },
);
