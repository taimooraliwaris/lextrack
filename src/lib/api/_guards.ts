import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Middleware that requires an authenticated Supabase user.
 * Attaches the user and supabase client to the context.
 */
export const requireAuth = createMiddleware({
  onRequest: async ({ request, next }) => {
    const { user, supabase } = await requireSupabaseAuth(request);
    return next({ context: { user, supabase } });
  },
});

/**
 * Middleware that requires an admin user.
 */
export const requireAdmin = createMiddleware({
  onRequest: async ({ request, next }) => {
    const { user, supabase } = await requireSupabaseAuth(request);
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    if (!profile?.is_admin) {
      throw new Response("Forbidden", { status: 403 });
    }
    return next({ context: { user, supabase } });
  },
});
