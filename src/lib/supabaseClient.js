import { createClient } from "@supabase/supabase-js";

const viteEnv = import.meta.env || {};

function readEnv(name) {
  const nodeEnv = typeof process !== "undefined" ? process.env : {};
  return viteEnv[name] || nodeEnv?.[name] || "";
}

const supabaseUrl = readEnv("VITE_SUPABASE_URL");
const supabaseAnonKey = readEnv("VITE_SUPABASE_ANON_KEY");
export const dreamImagesBucket =
  readEnv("VITE_SUPABASE_DREAM_IMAGES_BUCKET") || "dream-images";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("your-project-ref") &&
    !supabaseAnonKey.includes("your-public-anon-key")
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
