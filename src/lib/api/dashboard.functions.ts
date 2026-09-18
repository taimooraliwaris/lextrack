import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getDashboardSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const today = new Date();
    const in7 = new Date(today.getTime() + 7 * 24 * 3600_000)
      .toISOString()
      .slice(0, 10);
    const todayStr = today.toISOString().slice(0, 10);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .slice(0, 10);

    const [
      clientsRes,
      casesRes,
      invoicesRes,
      itrRes,
      hearingsRes,
      overdueRes,
      bankRes,
      activityRes,
      rolesRes,
    ] = await Promise.all([
      supabase
        .from("clients")
        .select("id, status", { count: "exact", head: false })
        .eq("status", "active")
        .is("deleted_at", null),
      supabase
        .from("cases")
        .select("id, status")
        .in("status", ["open", "in_progress", "hearing_scheduled"]),
      supabase
        .from("invoices")
        .select("outstanding_balance, total, status, paid_amount, issue_date")
        .is("voided_at", null),
      supabase
        .from("itr_records")
        .select("status, fiscal_years!inner(id, status)")
        .eq("fiscal_years.status", "active"),
      supabase
        .from("case_hearings")
        .select("id, case_id, hearing_date, hearing_time, venue, cases!inner(id, case_code, title, assigned_to)")
        .gte("hearing_date", todayStr)
        .lte("hearing_date", in7)
        .order("hearing_date")
        .limit(10),
      supabase
        .from("invoices")
        .select("id, invoice_number, issue_date, due_date, outstanding_balance, total, client_id, clients!inner(id, client_code, full_name)")
        .eq("status", "overdue")
        .order("due_date")
        .limit(10),
      supabase
        .from("bank_accounts")
        .select("id, statement_received")
        .eq("statement_received", false)
        .is("archived_at", null),
      supabase
        .from("activity_log")
        .select("id, action, entity_type, entity_id, created_at, profiles!inner(full_name)")
        .order("created_at", { ascending: false })
        .limit(15),
      supabase.from("profiles").select("id, is_admin").eq("id", userId).maybeSingle(),
    ]);

    return {
      activeClients: clientsRes.count ?? 0,
      openCases: casesRes.data?.length ?? 0,
      outstandingInvoices: invoicesRes.data?.filter((i) => (i.outstanding_balance ?? 0) > 0).length ?? 0,
      itrPending: itrRes.data?.filter((r) => r.status !== "filed").length ?? 0,
      upcomingHearings: hearingsRes.data ?? [],
      overdueInvoices: overdueRes.data ?? [],
      pendingBankStatements: bankRes.data?.length ?? 0,
      recentActivity: activityRes.data ?? [],
      isAdmin: rolesRes.data?.is_admin ?? false,
    };
  });
