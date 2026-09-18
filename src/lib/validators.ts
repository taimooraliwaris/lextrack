import { z } from "zod";

// SRS FR-02.03: CNIC format XXXXX-XXXXXXX-X
export const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]$/;
export const ntnRegex = /^[0-9]{7,8}(-[0-9])?$/;
// Accept +92 XXX XXXXXXX with optional spaces/dashes
export const phoneRegex = /^\+?92[\s-]?[0-9]{3}[\s-]?[0-9]{7}$/;

export const clientTypeEnum = z.enum(["individual", "company", "aop"]);
export const clientStatusEnum = z.enum(["active", "inactive", "archived"]);
export const companyTypeEnum = z.enum([
  "pvt_ltd",
  "public_ltd",
  "aop",
  "partnership",
  "sole_prop",
  "ngo",
  "trust",
]);
export const fiscalYearStatusEnum = z.enum(["upcoming", "active", "closed"]);

export const clientFormSchema = z
  .object({
    client_type: clientTypeEnum,
    full_name: z.string().min(2).max(255),
    display_name: z.string().max(255).optional().or(z.literal("")),
    cnic: z.string().regex(cnicRegex, "Format: XXXXX-XXXXXXX-X"),
    ntn: z.string().regex(ntnRegex, "Invalid NTN").optional().or(z.literal("")),
    email: z.string().email().optional().or(z.literal("")),
    whatsapp_no: z.string().regex(phoneRegex, "Format: +92 XXX XXXXXXX"),
    alternate_phone: z.string().optional().or(z.literal("")),
    status: clientStatusEnum,
    assigned_to: z.string().uuid("Select an assigned staff member"),
    internal_notes: z.string().max(2000).optional().or(z.literal("")),
    // Conditional company section
    company_name: z.string().optional().or(z.literal("")),
    company_type: companyTypeEnum.optional(),
    company_ntn: z.string().optional().or(z.literal("")),
    strn: z.string().optional().or(z.literal("")),
    registered_address: z.string().optional().or(z.literal("")),
    principal_activity: z.string().optional().or(z.literal("")),
    incorporation_date: z.string().optional().or(z.literal("")),
    contact_person_name: z.string().optional().or(z.literal("")),
    contact_person_title: z.string().optional().or(z.literal("")),
  })
  .refine(
    (d) =>
      d.client_type === "individual" ||
      (d.company_name && d.company_name.length > 1 && d.company_type),
    {
      message: "Company name and type are required for company/AOP clients",
      path: ["company_name"],
    },
  );

export type ClientFormData = z.infer<typeof clientFormSchema>;

export const fiscalYearFormSchema = z.object({
  year_code: z.string().regex(/^FY-\d{4}-\d{2}$/, "Format: FY-YYYY-YY"),
  display_label: z.string().min(2).max(50),
  period_start: z.string().optional().or(z.literal("")),
  period_end: z.string().optional().or(z.literal("")),
  filing_start_date: z.string().optional().or(z.literal("")),
  filing_due_date: z.string().optional().or(z.literal("")),
  status: fiscalYearStatusEnum,
});
export type FiscalYearFormData = z.infer<typeof fiscalYearFormSchema>;

export function maskCnic(cnic: string | null | undefined): string {
  if (!cnic) return "—";
  const parts = cnic.split("-");
  if (parts.length !== 3) return cnic;
  return `${parts[0]}-●●●●●●●-${parts[2]}`;
}
