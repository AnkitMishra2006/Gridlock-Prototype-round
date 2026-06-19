import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { cameras, type Camera } from "@/lib/mock-data";
import { CityMap, HotspotsList } from "@/components/CityMap";
import { Eyebrow, Panel, SectionTitle } from "@/components/ui-bits";

export const Route = createFileRoute("/heatmap")({
  head: () => ({ meta: [{ title: "Risk Map · GuardianEye" }] }),
  component: HeatmapPage,
});

function HeatmapPage() {
  const [selected, setSelected] = useState<Camera | null>(null);
  const [type, setType] = useState("all");
  const [range, setRange] = useState("24h");

  return (
    <div className="p-5 lg:p-8 space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow>Spatial intelligence · Bengaluru pilot zone</Eyebrow>
          <h1 className="font-display text-[40px] leading-tight mt-1.5">Risk map</h1>
          <p className="text-[13.5px] text-muted-foreground mt-1 max-w-lg">
            Heat zones derive from a 7-day rolling weighted average of severity-scored detections per square km.
          </p>
        </div>
        <div className="flex gap-2">
          <Select label="Type" value={type} onChange={setType} options={["all","No Helmet","Red Light","Overspeeding","Accident"]} />
          <Select label="Range" value={range} onChange={setRange} options={["1h","24h","7d","30d"]} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <Panel inset={false} className="col-span-12 lg:col-span-9 overflow-hidden">
          <CityMap height={600} selected={selected?.id} onSelect={setSelected} />
        </Panel>

        <div className="col-span-12 lg:col-span-3 space-y-4">
          <Panel>
            <SectionTitle eyebrow="Top 5 zones" title="Highest risk" />
            <HotspotsList />
          </Panel>

          {selected && (
            <Panel>
              <Eyebrow>Selected camera</Eyebrow>
              <h3 className="font-display text-[20px] mt-1">{selected.name}</h3>
              <dl className="mt-3 space-y-2 text-[13px]">
                <Row label="ID">{selected.id}</Row>
                <Row label="Zone">{selected.zone}</Row>
                <Row label="Status" className={selected.status === "active" ? "text-moss" : selected.status === "offline" ? "text-rust" : "text-amber-flag"}>{selected.status}</Row>
                <Row label="24h det.">{selected.detections24h}</Row>
              </dl>
            </Panel>
          )}

          <Panel>
            <Eyebrow>Coverage</Eyebrow>
            <div className="mt-2 font-display text-[28px] leading-tight">42<span className="text-muted-foreground text-[18px]"> km²</span></div>
            <div className="text-[12px] text-muted-foreground">{cameras.length} cameras · 4 zones · 7d uptime 98.4%</div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="flex items-center gap-1.5">
      <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="h-9 px-2.5 rounded-md border border-border bg-card text-[12.5px]">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Row({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
      <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">{label}</dt>
      <dd className={`capitalize ${className}`}>{children}</dd>
    </div>
  );
}
