import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { incidents, timeAgo, type Severity, type IncidentStatus } from "@/lib/mock-data";
import { Btn, Eyebrow, PlateChip, SectionTitle, SeverityBadge, StatusPill } from "@/components/ui-bits";
import { Filter, CheckCircle2, Send, Eye } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/violations")({
  head: () => ({ meta: [{ title: "Violations · GuardianEye" }] }),
  component: ViolationsPage,
});

function ViolationsPage() {
  const [sev, setSev] = useState<Severity | "all">("all");
  const [status, setStatus] = useState<IncidentStatus | "all">("all");
  const [q, setQ] = useState("");
  const [localStatus, setLocalStatus] = useState<Record<string, IncidentStatus>>({});

  const list = useMemo(() => incidents.filter(i => {
    const s = localStatus[i.id] ?? i.status;
    if (sev !== "all" && i.severity !== sev) return false;
    if (status !== "all" && s !== status) return false;
    if (q && !(`${i.plate} ${i.type} ${i.location} ${i.id}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  }), [sev, status, q, localStatus]);

  const update = (id: string, s: IncidentStatus, label: string) => {
    setLocalStatus(p => ({ ...p, [id]: s }));
    toast.success(label, { description: id });
  };

  return (
    <div className="p-5 lg:p-8 space-y-6">
      <SectionTitle
        eyebrow={`${incidents.length} incidents · today`}
        title="Violation management"
        sub="Every detection from every edge node, filterable and resolvable from one table."
      />

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center p-3 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 pr-3 mr-1 border-r border-border">
          <Filter className="size-3.5 text-muted-foreground" />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">Filter</span>
        </div>
        <Select label="Severity" value={sev} onChange={e => setSev(e.target.value as Severity | "all")} options={["all","low","medium","high","critical"]} />
        <Select label="Status" value={status} onChange={e => setStatus(e.target.value as IncidentStatus | "all")} options={["all","new","alert_sent","in_review","resolved"]} />
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search plate, type, location…"
          className="flex-1 min-w-[200px] h-9 px-3 rounded-md border border-border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
        <span className="font-mono text-[11px] text-muted-foreground ml-auto">{list.length} matches</span>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map(inc => {
          const s = localStatus[inc.id] ?? inc.status;
          return (
            <article key={inc.id} className="rounded-lg border border-border bg-card overflow-hidden flex flex-col">
              <div className="relative aspect-video overflow-hidden border-b border-border">
                <img src={inc.thumbnail} alt="" className="size-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                <div className="absolute top-2 left-2 flex items-center gap-2">
                  <SeverityBadge severity={inc.severity} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper bg-ink/70 px-1.5 py-0.5 rounded">
                    {Math.round(inc.confidence * 100)}%
                  </span>
                </div>
                <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between text-paper">
                  <span className="font-display text-[17px] leading-tight">{inc.type}</span>
                  <PlateChip plate={inc.plate} />
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-[12.5px] text-graphite">
                  <span className="truncate">{inc.location}</span>
                  <span className="font-mono text-[11px] text-muted-foreground shrink-0 ml-2">{timeAgo(inc.timestamp)}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-mono text-[11px] text-muted-foreground">{inc.id} · {inc.cameraId}</span>
                  <StatusPill status={s} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-1.5">
                  <Link to="/incidents/$id" params={{ id: inc.id }}>
                    <Btn size="sm" variant="outline" className="w-full"><Eye className="size-3" /> View</Btn>
                  </Link>
                  <Btn size="sm" variant="outline" onClick={() => update(inc.id, "alert_sent", "Alert sent to police")}>
                    <Send className="size-3" /> Alert
                  </Btn>
                  <Btn size="sm" variant="ghost" onClick={() => update(inc.id, "resolved", "Marked resolved")}>
                    <CheckCircle2 className="size-3" /> Resolve
                  </Btn>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[] }) {
  return (
    <label className="flex items-center gap-1.5">
      <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <select value={value} onChange={onChange} className="h-8 px-2 rounded border border-border bg-background text-[12.5px] focus:outline-none focus:ring-2 focus:ring-ring/30 capitalize">
        {options.map(o => <option key={o} value={o}>{o.replace("_", " ")}</option>)}
      </select>
    </label>
  );
}

export { Eyebrow };
