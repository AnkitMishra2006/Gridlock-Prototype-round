import { type ReactNode } from "react";
import { severityClass, severityDot, type Severity, type IncidentStatus, statusLabel } from "@/lib/mock-data";

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({
  eyebrow, title, sub, action,
}: { eyebrow?: string; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div>
        {eyebrow && <Eyebrow className="mb-1.5">{eyebrow}</Eyebrow>}
        <h2 className="font-display text-[26px] leading-tight">{title}</h2>
        {sub && <p className="text-[13px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  children, className = "", inset = true,
}: { children: ReactNode; className?: string; inset?: boolean }) {
  return (
    <div className={`rounded-lg border border-border bg-card ${inset ? "p-5" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function SeverityBadge({ severity, label }: { severity: Severity; label?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-mono uppercase tracking-wider ${severityClass[severity]}`}>
      <span className={`size-1.5 rounded-full ${severityDot[severity]}`} />
      {label ?? severity}
    </span>
  );
}

export function StatusPill({ status }: { status: IncidentStatus }) {
  const map: Record<IncidentStatus, string> = {
    new: "bg-ocean/10 text-ocean border-ocean/30",
    alert_sent: "bg-amber-flag/15 text-[oklch(0.4_0.12_75)] border-amber-flag/40",
    in_review: "bg-muted text-graphite border-border",
    resolved: "bg-moss/15 text-moss border-moss/30",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-mono uppercase tracking-wider ${map[status]}`}>
      {statusLabel(status)}
    </span>
  );
}

export function Metric({
  label, value, delta, deltaTone = "neutral", footnote,
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
  footnote?: string;
}) {
  const tone =
    deltaTone === "up" ? "text-rust" :
    deltaTone === "down" ? "text-moss" :
    "text-muted-foreground";
  return (
    <div className="p-4 rounded-lg border border-border bg-card flex flex-col gap-2 min-h-[112px]">
      <Eyebrow>{label}</Eyebrow>
      <div className="font-display text-[34px] leading-none">{value}</div>
      <div className="mt-auto flex items-center justify-between text-[11.5px]">
        {delta && <span className={`font-mono ${tone}`}>{delta}</span>}
        {footnote && <span className="font-mono text-muted-foreground">{footnote}</span>}
      </div>
    </div>
  );
}

export function PlateChip({ plate }: { plate: string }) {
  return (
    <span className="inline-flex items-center font-mono text-[11.5px] tracking-wider px-1.5 py-0.5 rounded-sm border border-ink/70 bg-amber-flag/70 text-ink">
      {plate}
    </span>
  );
}

export function Divider({ label }: { label?: string }) {
  if (!label) return <div className="h-px bg-border my-4" />;
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="h-px bg-border flex-1" />
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <div className="h-px bg-border flex-1" />
    </div>
  );
}

export function Btn({
  children, variant = "ghost", size = "md", className = "", ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md";
}) {
  const base = "inline-flex items-center justify-center gap-1.5 font-medium transition-colors disabled:opacity-50";
  const sizes = { sm: "h-8 px-2.5 text-[12px] rounded-md", md: "h-9 px-3.5 text-[13px] rounded-md" };
  const variants = {
    primary: "bg-ink text-paper hover:bg-graphite",
    ghost: "text-ink hover:bg-muted",
    outline: "border border-border text-ink hover:bg-muted",
    danger: "bg-rust text-paper hover:bg-[oklch(0.46_0.18_32)]",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
