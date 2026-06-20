import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { ArrowUpRight, Activity, Video, AlertTriangle, Map as MapIcon, Loader2 } from "lucide-react";
import { timeAgo } from "@/lib/mock-data";
import { useDashboardStats, useRecentIncidents, useAlerts, useViolationTrend, useTopViolations, useCameras } from "@/lib/api-hooks";
import { Btn, Eyebrow, Metric, Panel, PlateChip, SectionTitle, SeverityBadge, StatusPill } from "@/components/ui-bits";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview · GuardianEye" },
      { name: "description", content: "Real-time civic vision command — violations, accidents, response." },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentData, isLoading: recentLoading } = useRecentIncidents(24, 7);
  const { data: alertsData, isLoading: alertsLoading } = useAlerts({ limit: 3 });
  const { data: trendDataRaw, isLoading: trendLoading } = useViolationTrend(24);
  const { data: topViolationsData, isLoading: topLoading } = useTopViolations(5);
  const { data: camerasData, isLoading: camerasLoading } = useCameras();

  // Show loading state
  if (statsLoading || recentLoading || alertsLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="size-8 animate-spin text-rust mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Extract data with fallbacks
  const recent = recentData?.incidents || [];
  const liveAlerts = alertsData?.alerts || [];
  const trendData = trendDataRaw?.trend || [];
  const topViolations = topViolationsData?.violations || [];
  const cameras = camerasData?.cameras || [];
  const activeCams = cameras.filter((c: any) => c.status === "active").length;

  return (
    <div className="p-5 lg:p-8 space-y-8">
      {/* Hero strip */}
      <section className="grid grid-cols-12 gap-6 items-end pb-2 border-b border-border">
        <div className="col-span-12 lg:col-span-7">
          <Eyebrow>Watch · Wednesday, 17 June 2026</Eyebrow>
          <h1 className="font-display text-[44px] lg:text-[58px] leading-[0.95] mt-2 text-balance">
            The city is being <em className="text-rust not-italic">watched</em>, so the city stays <em className="not-italic">safe</em>.
          </h1>
          <p className="text-[14.5px] text-muted-foreground mt-3 max-w-xl">
            8 edge cameras streaming · 38ms median inference · 7,412 vehicles seen in the last hour.
            Every detection is timestamped, signed, and queued for review.
          </p>
        </div>
        <div className="col-span-12 lg:col-span-5 flex flex-wrap gap-2 lg:justify-end">
          <Link to="/live"><Btn variant="primary"><Video className="size-3.5" /> View Live Feed</Btn></Link>
          <Link to="/alerts"><Btn variant="outline"><AlertTriangle className="size-3.5" /> Alert Center</Btn></Link>
          <Link to="/heatmap"><Btn variant="outline"><MapIcon className="size-3.5" /> Risk Map</Btn></Link>
        </div>
      </section>

      {/* Metric grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label="Violations Today" value={stats?.total_incidents_today?.toString() || "0"} delta={stats?.incidents_change_pct ? `${stats.incidents_change_pct > 0 ? '+' : ''}${stats.incidents_change_pct.toFixed(1)}% vs yesterday` : ""} deltaTone={stats?.incidents_change_pct > 0 ? "up" : "down"} footnote="last sync 00:00:42" />
        <Metric label="Active Accidents" value={stats?.active_accidents?.toString() || "0"} delta={stats?.critical_accidents ? `${stats.critical_accidents} critical` : ""} deltaTone="up" footnote="dispatch in progress" />
        <Metric label="High Severity Alerts" value={stats?.high_severity_alerts?.toString() || "0"} delta={stats?.alerts_last_hour ? `${stats.alerts_last_hour} in last hour` : ""} deltaTone="up" />
        <Metric label="Pending Police Response" value={stats?.pending_police_alerts?.toString() || "0"} delta={stats?.police_alerts_change ? `${stats.police_alerts_change}` : ""} deltaTone={stats?.police_alerts_change < 0 ? "down" : "up"} footnote="SLA 6m 12s" />
        <Metric label="Pending Hospital Response" value={stats?.pending_hospital_alerts?.toString() || "0"} delta={stats?.critical_pending === 0 ? "0 critical pending" : `${stats?.critical_pending} critical`} deltaTone="neutral" />
        <Metric label="Active Cameras" value={`${activeCams} / ${cameras.length}`} delta={stats?.offline_cameras ? `${stats.offline_cameras} offline` : "all online"} deltaTone="up" />
        <Metric label="Avg Response Time" value={stats?.avg_response_time || "N/A"} delta={stats?.response_time_change || ""} deltaTone={stats?.response_time_change?.includes('-') ? "down" : "up"} footnote="target ≤ 5m" />
        <Metric label="City Safety Score" value={stats?.safety_score?.toString() || "78"} delta={stats?.safety_score_change ? `${stats.safety_score_change > 0 ? '+' : ''}${stats.safety_score_change} this week` : ""} deltaTone="down" footnote="moderate risk" />
      </section>

      {/* Chart + top violations */}
      <section className="grid grid-cols-12 gap-6">
        <Panel className="col-span-12 lg:col-span-8">
          <div className="flex items-end justify-between mb-4">
            <div>
              <Eyebrow>Hourly trend · last 24h</Eyebrow>
              <h3 className="font-display text-[22px] mt-1">Violations & accidents</h3>
            </div>
            <div className="flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-ink" />violations</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-rust" />accidents</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ left: -16, right: 8, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.18 0.015 60)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="oklch(0.18 0.015 60)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.52 0.18 32)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.52 0.18 32)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.88 0.014 75)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "oklch(0.45 0.012 60)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "oklch(0.45 0.012 60)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 6, fontSize: 12 }} />
                <Area type="monotone" dataKey="violations" stroke="oklch(0.18 0.015 60)" strokeWidth={1.5} fill="url(#g1)" />
                <Area type="monotone" dataKey="accidents" stroke="oklch(0.52 0.18 32)" strokeWidth={1.5} fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="col-span-12 lg:col-span-4">
          <div className="flex items-end justify-between mb-4">
            <div>
              <Eyebrow>Top violation types · 24h</Eyebrow>
              <h3 className="font-display text-[22px] mt-1">What we caught</h3>
            </div>
            <ArrowUpRight className="size-4 text-muted-foreground" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topViolations} layout="vertical" margin={{ left: 4, right: 24, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="type" tick={{ fontSize: 11, fill: "oklch(0.18 0.015 60)" }} axisLine={false} tickLine={false} width={92} />
                <Tooltip cursor={{ fill: "oklch(0.94 0.014 78)" }} contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 6, fontSize: 12 }} />
                <Bar dataKey="count" fill="oklch(0.52 0.18 32)" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </section>

      {/* Recent incidents + live alerts */}
      <section className="grid grid-cols-12 gap-6">
        <Panel className="col-span-12 lg:col-span-8" inset={false}>
          <div className="p-5 pb-3 flex items-end justify-between">
            <SectionTitle eyebrow="Live feed" title="Recent incidents" />
            <Link to="/violations" className="font-mono text-[11px] uppercase tracking-[0.18em] text-rust hover:underline">All violations →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="border-y border-border bg-bone/60">
                <tr className="text-left font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                  <th className="py-2.5 px-5">ID</th>
                  <th className="py-2.5">Incident</th>
                  <th className="py-2.5">Vehicle</th>
                  <th className="py-2.5">Location</th>
                  <th className="py-2.5">Sev.</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 px-5 text-right">Seen</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((inc: any) => (
                  <tr key={inc.incident_id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="py-3 px-5 font-mono text-[11.5px] text-muted-foreground">{inc.incident_id}</td>
                    <td className="py-3">
                      <Link to="/incidents/$id" params={{ id: inc.incident_id }} className="hover:text-rust">{inc.violation_type}</Link>
                    </td>
                    <td className="py-3"><PlateChip plate={inc.license_plates?.[0] || 'UNKNOWN'} /></td>
                    <td className="py-3 text-graphite">{inc.location?.name || inc.location}</td>
                    <td className="py-3"><SeverityBadge severity={inc.severity} /></td>
                    <td className="py-3"><StatusPill status={inc.status} /></td>
                    <td className="py-3 px-5 text-right font-mono text-[11.5px] text-muted-foreground">{timeAgo(inc.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Panel>
            <div className="flex items-center justify-between">
              <Eyebrow>City safety score</Eyebrow>
              <span className="font-mono text-[10.5px] text-muted-foreground">7d</span>
            </div>
            <div className="mt-3 flex items-end gap-3">
              <div className="font-display text-[64px] leading-none">78</div>
              <div className="pb-2">
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-rust">moderate risk</div>
                <div className="text-[12px] text-muted-foreground">Worst zone: Silk Board</div>
              </div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-to-r from-moss via-amber-flag to-rust" style={{ width: "78%" }} />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span>0 critical</span><span>100 safe</span>
            </div>
          </Panel>

          <Panel inset={false}>
            <div className="p-5 pb-2 flex items-center justify-between">
              <Eyebrow>Active alerts</Eyebrow>
              <Activity className="size-3.5 text-rust" />
            </div>
            <div>
              {liveAlerts.map((a: any) => (
                <Link key={a.alert_id} to="/alerts" className="block px-5 py-3 border-t border-border hover:bg-muted/40">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={a.severity} />
                    <span className="font-mono text-[10.5px] text-muted-foreground ml-auto">{timeAgo(a.timestamp)}</span>
                  </div>
                  <div className="mt-1.5 text-[13.5px] font-medium leading-snug">{a.message || a.title}</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">{a.location?.name || a.location} · {a.assigned_to || 'Unassigned'}</div>
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </div>
  );
}
