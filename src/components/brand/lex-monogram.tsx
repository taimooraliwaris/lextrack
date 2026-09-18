import { cn } from "@/lib/utils";

/**
 * LX monogram — minimalist mark on the brand radial gradient (teal → charcoal).
 * White geometric letterforms in Space Grotesk for a techy, modern feel.
 */
export function LexMonogram({
  size = 48,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full text-white shadow-sm overflow-hidden",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: "var(--gradient-brand)",
      }}
      aria-label="LexTrack — Soomro Law Services"
    >
      <span
        className="font-display font-semibold leading-none tracking-tight"
        style={{ fontSize: size * 0.44 }}
      >
        LX
      </span>
      <span
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}
      />
    </div>
  );
}
