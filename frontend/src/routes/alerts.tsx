import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { timeAgo } from "@/lib/mock-data";
import { useAlerts, useUpdateAlertStatus } from "@/lib/api-hooks";
import { Btn, Eyebrow, Panel, PlateChip, SectionTitle, SeverityBadge } from "@/components/ui-bits";
import { Bell, CheckCircle2, Send, ArrowUpCircle, X, MapPin, Loader2 } from "lucide-react";

export const Route = createFileRoute("/alerts")({
  head: () => ({ meta: [{ title: "Alert Center · GuardianEye" }] }),
  component: AlertsPage,
});

const KIND_LABEL: Record<string, string> = {
  police: "Police dispatch",
  hospital: "Hospital emergency",
  violation: "Traffic violation",
  high_violation: "High-severity violation",
  accident: "Accident",
  repeat_offender: "Repeat offender",
  camera_offline: "Camera offline",
};

function AlertsPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const { data: alertsData, isLoading } = useAlerts();
  const updateStatusMutation = useUpdateAlertStatus();

  const list = alertsData?.alerts || [];
  const filtered = filter === "all" ? list : list.filter((a: any) => a.alert_type === filter);
  const open = list.find((a: any) => a.alert_id === openId);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="size-8 animate-spin text-rust mx-auto" />
          <p className="text-muted-foreground">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 lg:p-8 space-y-6">
      <SectionTitle eyebrow={`${list.length} alerts · ${list.filter((a: any) => a.status === "pending").length} pending`} title="Alert center" sub="Acknowledge, dispatch, escalate, or resolve. Every action is logged with operator ID." />

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
        {(["all", "police", "hospital", "accident"] as const).map(k => (
          <button key={k} onClick={() => setFilter(k)}
            className={`px-3 h-8 rounded-md text-[12.5px] capitalize transition-colors ${filter === k ? "bg-ink text-paper" : "text-graphite hover:bg-muted"}`}>
            {k === "all" ? "All alerts" : KIND_LABEL[k]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((a: any) => (
          <article key={a.alert_id} className="rounded-lg border border-border bg-card p-4 flex gap-4">
            <div className="size-10 rounded-full bg-rust/10 grid place-items-center shrink-0">
              <Bell className="size-4 text-rust" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <SeverityBadge severity={a.severity} />
                <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">{KIND_LABEL[a.alert_type] || a.alert_type}</span>
                <span className="font-mono text-[10.5px] text-muted-foreground ml-auto">{a.alert_id} · {timeAgo(a.timestamp)}</span>
              </div>
              <h3 className="font-display text-[18px] leading-tight mt-1.5">{a.message}</h3>
              <p className="text-[12.5px] text-muted-foreground mt-1 line-clamp-2">{a.details || 'No additional details'}</p>
              <div className="mt-2.5 flex items-center gap-3 text-[11.5px] text-graphite">
                <span className="flex items-center gap-1"><MapPin className="size-3" />{a.location?.name || a.location || 'Unknown'}</span>
                <span>·</span>
                <span>{a.assigned_to || 'Unassigned'}</span>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground ml-auto">{a.status}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Btn size="sm" variant="outline" onClick={() => setOpenId(a.alert_id)}>Preview message</Btn>
                <Btn size="sm" variant="ghost" onClick={() => updateStatusMutation.mutate({ id: a.alert_id, status: "acknowledged" })}><CheckCircle2 className="size-3" /> Ack</Btn>
                <Btn size="sm" variant="primary" onClick={() => updateStatusMutation.mutate({ id: a.alert_id, status: "dispatched" })}><Send className="size-3" /> Dispatch</Btn>
                <Btn size="sm" variant="ghost" onClick={() => updateStatusMutation.mutate({ id: a.alert_id, status: "resolved" })}><ArrowUpCircle className="size-3" /> Resolve</Btn>
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
                <div className="font-display text-[17px]">To {open.assigned_to || 'Emergency Services'}</div>
              </div>
              <button onClick={() => setOpenId(null)} className="p-1 rounded hover:bg-muted"><X className="size-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="rounded border border-dashed border-border p-4 font-mono text-[12.5px] leading-relaxed bg-bone/40">
                <div className="text-rust">[GUARDIANEYE · {open.severity?.toUpperCase()}]</div>
                <div className="mt-2">Incident: {open.message}</div>
                <div>Location: {open.location?.name || open.location}</div>
                <div>Severity: {open.severity?.toUpperCase()}</div>
                <div>Time: {new Date(open.timestamp).toLocaleString("en-IN")}</div>
                <div>Alert ID: {open.alert_id}</div>
                <div className="mt-2 text-graphite">{open.details || 'Immediate response required. Confirm receipt within 60s.'}</div>
                <div className="mt-2 text-muted-foreground">Evidence available · case {open.incident_id ?? "—"}</div>
              </div>
              <div className="flex gap-2 justify-end">
                <Btn variant="outline" onClick={() => setOpenId(null)}>Cancel</Btn>
                <Btn variant="primary" onClick={() => { updateStatusMutation.mutate({ id: open.alert_id, status: "dispatched" }); setOpenId(null); }}>
                  <Send className="size-3.5" /> Send Alert
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
