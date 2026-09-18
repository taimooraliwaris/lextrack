import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(supabase: typeof supabaseAdmin, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Admin only");
}

export const inviteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        email: z.string().email().max(255),
        fullName: z.string().min(2).max(120),
        redirectTo: z.string().url(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase as unknown as typeof supabaseAdmin, context.userId);
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      data: { full_name: data.fullName },
      redirectTo: data.redirectTo,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase as unknown as typeof supabaseAdmin, context.userId);
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, full_name, email, is_admin, created_at, last_sign_in_at")
      .order("full_name");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const setUserAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ userId: z.string().uuid(), isAdmin: z.boolean() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase as unknown as typeof supabaseAdmin, context.userId);
    const { error } = await context.supabase
      .from("profiles")
      .update({ is_admin: data.isAdmin })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
