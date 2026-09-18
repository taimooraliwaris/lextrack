import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./_guards";

export const itrSummaryReport = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) => z.object({ fyId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { data: rows, error } = await context.supabase
      .from("itr_records")
      .select("status, is_foc, amount, amount_status, filed_at, clients!inner(client_code, full_name, assigned_to, profiles:assigned_to(full_name))")
      .eq("fiscal_year_id", data.fyId);
    if (error) throw new Error(error.message);
    const all = rows ?? [];
    const counts: Record<string, number> = {
      no_data_received: 0,
      partial_data: 0,
      pending: 0,
      drafted: 0,
      filed: 0,
    };
    let billed = 0,
      collected = 0;
    for (const r of all) {
      counts[r.status] = (counts[r.status] ?? 0) + 1;
      if (!r.is_foc) billed += Number(r.amount ?? 0);
      if (r.amount_status === "paid") collected += Number(r.amount ?? 0);
    }
    return { total: all.length, counts, billed, collected, rows: all };
  });

export const revenueReport = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) =>
    z
      .object({
        from: z.string().optional(),
        to: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    let q = context.supabase
      .from("invoices")
      .select("id, invoice_number, issue_date, total, paid_amount, outstanding_balance, status, clients!inner(full_name)")
      .is("voided_at", null)
      .order("issue_date", { ascending: false });
    if (data.from) q = q.gte("issue_date", data.from);
    if (data.to) q = q.lte("issue_date", data.to);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const all = rows ?? [];
    const totalBilled = all.reduce((s, r) => s + Number(r.total ?? 0), 0);
    const totalCollected = all.reduce((s, r) => s + Number(r.paid_amount ?? 0), 0);
    return { totalBilled, totalCollected, outstanding: totalBilled - totalCollected, rows: all };
  });
