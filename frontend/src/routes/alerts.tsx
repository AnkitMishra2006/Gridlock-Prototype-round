import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { alerts as initialAlerts, timeAgo, type AlertItem } from "@/lib/mock-data";
import { Btn, Eyebrow, Panel, PlateChip, SectionTitle, SeverityBadge } from "@/components/ui-bits";
import { Bell, CheckCircle2, Send, ArrowUpCircle, X, MapPin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/alerts")({
  head: () => ({ meta: [{ title: "Alert Center · GuardianEye" }] }),
  component: AlertsPage,
});

const KIND_LABEL: Record<AlertItem["kind"], string> = {
  violation: "Traffic violation",
  high_violation: "High-severity violation",
  accident: "Accident",
  repeat_offender: "Repeat offender",
  camera_offline: "Camera offline",
};

function AlertsPage() {
  const [list, setList] = useState(initialAlerts);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<AlertItem["kind"] | "all">("all");

  const filtered = filter === "all" ? list : list.filter(a => a.kind === filter);
  const open = list.find(a => a.id === openId);

  const update = (id: string, status: AlertItem["status"], msg: string) => {
    setList(p => p.map(a => a.id === id ? { ...a, status } : a));
    toast.success(msg, { description: id });
  };

  return (
    <div className="p-5 lg:p-8 space-y-6">
      <SectionTitle eyebrow={`${list.length} alerts · ${list.filter(a => a.status === "open").length} open`} title="Alert center" sub="Acknowledge, dispatch, escalate, or resolve. Every action is logged with operator ID." />

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
        {(["all", "violation", "high_violation", "accident", "repeat_offender", "camera_offline"] as const).map(k => (
          <button key={k} onClick={() => setFilter(k)}
            className={`px-3 h-8 rounded-md text-[12.5px] capitalize transition-colors ${filter === k ? "bg-ink text-paper" : "text-graphite hover:bg-muted"}`}>
            {k === "all" ? "All alerts" : KIND_LABEL[k]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(a => (
          <article key={a.id} className="rounded-lg border border-border bg-card p-4 flex gap-4">
            <div className="size-10 rounded-full bg-rust/10 grid place-items-center shrink-0">
              <Bell className="size-4 text-rust" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <SeverityBadge severity={a.severity} />
                <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">{KIND_LABEL[a.kind]}</span>
                <span className="font-mono text-[10.5px] text-muted-foreground ml-auto">{a.id} · {timeAgo(a.timestamp)}</span>
              </div>
              <h3 className="font-display text-[18px] leading-tight mt-1.5">{a.title}</h3>
              <p className="text-[12.5px] text-muted-foreground mt-1 line-clamp-2">{a.message}</p>
              <div className="mt-2.5 flex items-center gap-3 text-[11.5px] text-graphite">
                <span className="flex items-center gap-1"><MapPin className="size-3" />{a.location}</span>
                <span>·</span>
                <span>{a.assignee}</span>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground ml-auto">{a.status}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Btn size="sm" variant="outline" onClick={() => setOpenId(a.id)}>Preview message</Btn>
                <Btn size="sm" variant="ghost" onClick={() => update(a.id, "acknowledged", "Acknowledged")}><CheckCircle2 className="size-3" /> Ack</Btn>
                <Btn size="sm" variant="primary" onClick={() => update(a.id, "dispatched", "Team dispatched")}><Send className="size-3" /> Dispatch</Btn>
                <Btn size="sm" variant="ghost" onClick={() => update(a.id, "escalated", "Escalated to senior")}><ArrowUpCircle className="size-3" /> Escalate</Btn>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm grid place-items-center p-4" onClick={() => setOpenId(null)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-xl bg-paper rounded-lg border border-border shadow-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-bone">
              <div>
                <Eyebrow>Outbound message preview</Eyebrow>
                <div className="font-display text-[17px]">To {open.assignee}</div>
              </div>
              <button onClick={() => setOpenId(null)} className="p-1 rounded hover:bg-muted"><X className="size-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="rounded border border-dashed border-border p-4 font-mono text-[12.5px] leading-relaxed bg-bone/40">
                <div className="text-rust">[GUARDIANEYE · CRITICAL]</div>
                <div className="mt-2">Incident: {open.title}</div>
                <div>Location: {open.location}</div>
                <div>Severity: {open.severity.toUpperCase()}</div>
                <div>Time: {new Date(open.timestamp).toLocaleString("en-IN")}</div>
                <div>Vehicle: <PlateChip plate="KA 05 MJ 7821" /></div>
                <div className="mt-2 text-graphite">Recommended action: Dispatch nearest patrol. Issue e-challan under section 184 MV Act. Confirm receipt within 60s.</div>
                <div className="mt-2 text-muted-foreground">Evidence frame attached · case {open.incidentId ?? "—"}</div>
              </div>
              <div className="flex gap-2 justify-end">
                <Btn variant="outline" onClick={() => setOpenId(null)}>Cancel</Btn>
                <Btn variant="primary" onClick={() => { update(open.id, "dispatched", "Message sent"); setOpenId(null); }}>
                  <Send className="size-3.5" /> Send to {open.assignee.split("·")[0].trim()}
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
