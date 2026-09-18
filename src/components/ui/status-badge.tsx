import { cn } from "@/lib/utils";

// SRS §2.4.3 — recolored on the teal/charcoal palette
const VARIANTS: Record<string, string> = {
  // Generic / ITR
  no_data: "bg-[#F1F3F4] text-[#5F6368]",
  no_data_received: "bg-[#F1F3F4] text-[#5F6368]",
  partial_data: "bg-[#E0F2F1] text-[#055052]",
  data_received: "bg-[#E0F2F1] text-[#055052]",
  in_progress: "bg-[#FFF4E5] text-[#A85A00]",
  pending: "bg-[#FFF4E5] text-[#A85A00]",
  processed: "bg-[#E0F2F1] text-[#055052]",
  drafted: "bg-[#DBEAFE] text-[#1E40AF]",
  filed: "bg-[#D1FAE5] text-[#065F46]",
  // Cases
  open: "bg-[#DBEAFE] text-[#1E40AF]",
  hearing_scheduled: "bg-[#FFF4E5] text-[#A85A00]",
  closed: "bg-[#D1FAE5] text-[#065F46]",
  archived: "bg-[#F1F3F4] text-[#5F6368]",
  // Invoices
  draft: "bg-[#F1F3F4] text-[#5F6368]",
  sent: "bg-[#DBEAFE] text-[#1E40AF]",
  partially_paid: "bg-[#FFF4E5] text-[#A85A00]",
  paid: "bg-[#D1FAE5] text-[#065F46]",
  overdue: "bg-[#FEE2E2] text-[#991B1B]",
  voided: "bg-[#F1F3F4] text-[#5F6368]",
  // Bank
  statement_received: "bg-[#D1FAE5] text-[#065F46]",
  statement_pending: "bg-[#FFF4E5] text-[#A85A00]",
};

export function StatusBadge({
  status,
  className,
  children,
}: {
  status: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const variant = VARIANTS[status] ?? "bg-[#F1F3F4] text-[#5F6368]";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant,
        className,
      )}
    >
      {children ?? status.replace(/_/g, " ")}
    </span>
  );
}
