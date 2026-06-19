import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { repeatOffenders, timeAgo } from "@/lib/mock-data";
import { Eyebrow, Panel, PlateChip, SectionTitle, SeverityBadge } from "@/components/ui-bits";
import { Search, Car } from "lucide-react";

export const Route = createFileRoute("/vehicles")({
  head: () => ({ meta: [{ title: "Vehicle Lookup · GuardianEye" }] }),
  component: VehiclesPage,
});

function VehiclesPage() {
  const [q, setQ] = useState("KA 03 HX 4412");
  const v = repeatOffenders.find(o => o.plate.toLowerCase().includes(q.toLowerCase())) ?? repeatOffenders[0];

  return (
    <div className="p-5 lg:p-8 space-y-6">
      <SectionTitle eyebrow="Repeat offender intelligence" title="Vehicle lookup" sub="Type a plate or pick from the watchlist." />

      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input value={q} onChange={e => setQ(e.target.value)}
          placeholder="KA 05 MJ 7821"
          className="w-full h-12 pl-11 pr-4 rounded-md border border-border bg-card text-[15px] font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-ring/30" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Profile */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <Panel>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <Eyebrow>Subject vehicle</Eyebrow>
                <div className="mt-3"><PlateChip plate={v.plate} /></div>
                <h2 className="font-display text-[36px] leading-tight mt-3 flex items-center gap-2">
                  <Car className="size-7 text-graphite" /> {v.plate}
                </h2>
                <p className="text-[13px] text-muted-foreground mt-1">Type: 4-wheeler · Sedan (inferred) · Color: black</p>
              </div>
              <div className="text-right">
                <Eyebrow>Risk score</Eyebrow>
                <div className="font-display text-[68px] leading-none text-rust mt-1">{v.risk}</div>
                <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-rust">high risk · watchlist</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 border-t border-border">
              <Stat label="Total violations" value={String(v.violations)} />
              <Stat label="Most common" value={v.top} />
              <Stat label="Last seen" value={v.lastSeen} />
              <Stat label="First flagged" value="14 May 2026" />
            </div>
          </Panel>

          <Panel inset={false}>
            <div className="p-5 pb-3 border-b border-border"><SectionTitle eyebrow="History · timeline" title="Previous incidents" /></div>
            <ol className="p-5 space-y-4">
              {(v.history.length ? v.history : Array.from({ length: 4 }).map((_, i) => ({
                date: new Date(Date.now() - (i + 1) * 86400000 * 3).toISOString(),
                type: ["Red Light Jump","Overspeeding","No Helmet","Wrong-Side Driving"][i],
                location: ["MG Road","ORR Outer","Hebbal Flyover","KR Puram"][i],
                severity: (["high","medium","high","medium"] as const)[i],
              }))).map((h, i) => (
                <li key={i} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="text-right shrink-0 w-24">
                    <div className="font-mono text-[11px] text-muted-foreground">{timeAgo(h.date)}</div>
                    <div className="font-mono text-[10.5px] text-muted-foreground">{new Date(h.date).toLocaleDateString("en-IN")}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2"><SeverityBadge severity={h.severity} /><span className="font-display text-[16px]">{h.type}</span></div>
                    <div className="text-[12.5px] text-muted-foreground mt-0.5">{h.location}</div>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        {/* Watchlist */}
        <div className="col-span-12 lg:col-span-4">
          <Panel inset={false}>
            <div className="p-4 pb-2"><Eyebrow>Watchlist · top offenders</Eyebrow></div>
            {repeatOffenders.map(o => (
              <button key={o.plate} onClick={() => setQ(o.plate)}
                className={`w-full text-left px-4 py-3 border-t border-border hover:bg-muted/40 ${o.plate === v.plate ? "bg-muted/60" : ""}`}>
                <div className="flex items-center justify-between">
                  <PlateChip plate={o.plate} />
                  <span className="font-display text-[18px] text-rust">{o.risk}</span>
                </div>
                <div className="mt-1 text-[12px] text-muted-foreground">{o.violations} violations · {o.top}</div>
                <div className="font-mono text-[10.5px] text-muted-foreground mt-0.5">Last: {o.lastSeen}</div>
              </button>
            ))}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Eyebrow>{label}</Eyebrow>
      <div className="font-display text-[18px] mt-1 leading-tight">{value}</div>
    </div>
  );
}
