import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { ArrowUpRight, Activity, Video, AlertTriangle, Map as MapIcon } from "lucide-react";
import {
  incidents, alerts, trendData, topViolations, cameras, timeAgo,
} from "@/lib/mock-data";
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
  const activeCams = cameras.filter(c => c.status === "active").length;
  const recent = incidents.slice(0, 7);
  const liveAlerts = alerts.slice(0, 3);

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
        <Metric label="Violations Today" value="1,284" delta="+12.4% vs yesterday" deltaTone="up" footnote="last sync 00:00:42" />
        <Metric label="Active Accidents" value="3" delta="2 critical" deltaTone="up" footnote="dispatch in progress" />
        <Metric label="High Severity Alerts" value="47" delta="9 in last hour" deltaTone="up" />
        <Metric label="Pending Police Response" value="18" delta="-3" deltaTone="down" footnote="SLA 6m 12s" />
        <Metric label="Pending Hospital Response" value="2" delta="0 critical pending" deltaTone="neutral" />
        <Metric label="Active Cameras" value={`${activeCams} / ${cameras.length}`} delta="1 offline · 1 warning" deltaTone="up" />
        <Metric label="Avg Response Time" value="4m 38s" delta="-22s" deltaTone="down" footnote="target ≤ 5m" />
        <Metric label="City Safety Score" value="78" delta="+1.2 this week" deltaTone="down" footnote="moderate risk" />
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
                {recent.map(inc => (
                  <tr key={inc.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="py-3 px-5 font-mono text-[11.5px] text-muted-foreground">{inc.id}</td>
                    <td className="py-3">
                      <Link to="/incidents/$id" params={{ id: inc.id }} className="hover:text-rust">{inc.type}</Link>
                    </td>
                    <td className="py-3"><PlateChip plate={inc.plate} /></td>
                    <td className="py-3 text-graphite">{inc.location}</td>
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
              {liveAlerts.map(a => (
                <Link key={a.id} to="/alerts" className="block px-5 py-3 border-t border-border hover:bg-muted/40">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={a.severity} />
                    <span className="font-mono text-[10.5px] text-muted-foreground ml-auto">{timeAgo(a.timestamp)}</span>
                  </div>
                  <div className="mt-1.5 text-[13.5px] font-medium leading-snug">{a.title}</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">{a.location} · {a.assignee}</div>
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </div>
  );
}
