import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { incidents, timeAgo } from "@/lib/mock-data";
import { Btn, Eyebrow, Panel, PlateChip, SectionTitle, SeverityBadge } from "@/components/ui-bits";
import { Siren, MapPin, Building2, Phone, ChevronRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/accidents")({
  head: () => ({ meta: [{ title: "Emergency Response · GuardianEye" }] }),
  component: AccidentsPage,
});

const STAGES = [
  "Accident Detected",
  "Police Alert Sent",
  "Hospital Alert Sent",
  "Ambulance Assigned",
  "Help Dispatched",
  "Resolved",
] as const;

function AccidentsPage() {
  const accidents = incidents.filter(i => i.type === "Accident Detected" || i.severity === "critical").slice(0, 3);
  const primary = accidents[0];
  const [stage, setStage] = useState(2); // up to "Hospital Alert Sent"

  return (
    <div className="p-5 lg:p-8 space-y-8">
      {/* Banner */}
      <div className="rounded-lg border border-rust/40 bg-rust/8 p-5 flex items-start gap-4">
        <div className="size-10 rounded-full bg-rust text-paper grid place-items-center live-dot shrink-0">
          <Siren className="size-5" />
        </div>
        <div className="flex-1">
          <Eyebrow className="text-rust">Critical accident in progress</Eyebrow>
          <h1 className="font-display text-[30px] leading-tight mt-1">
            Two-vehicle collision · {primary.location}
          </h1>
          <p className="text-[13.5px] text-graphite mt-1">
            Detected {timeAgo(primary.timestamp)} on camera {primary.cameraId}. {primary.people} people and {primary.vehicles} vehicles in frame.
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">Time since</div>
          <div className="font-display text-[40px] leading-none text-rust">03:42</div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Primary case */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <Panel inset={false} className="overflow-hidden">
            <div className="relative aspect-video">
              <img src={primary.thumbnail} alt="" className="size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
              <div className="absolute inset-0 scanline opacity-30" />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-rust live-dot" />
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper">LIVE · evidence frame</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-paper">
                <div>
                  <SeverityBadge severity="critical" label="Critical" />
                  <div className="font-display text-[26px] mt-2 leading-tight">{primary.type}</div>
                  <div className="font-mono text-[11.5px] text-paper/80 mt-0.5">{primary.id} · {primary.cameraId}</div>
                </div>
                <PlateChip plate={primary.plate} />
              </div>
            </div>

            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-border">
              <Stat label="Location" value={primary.location} />
              <Stat label="People in frame" value={String(primary.people)} />
              <Stat label="Vehicles" value={String(primary.vehicles)} />
              <Stat label="Severity" value={<span className="text-rust">Critical</span>} />
            </div>
          </Panel>

          {/* Workflow */}
          <Panel>
            <SectionTitle eyebrow="Response workflow" title="Dispatch pipeline" />
            <ol className="relative">
              {STAGES.map((label, i) => {
                const done = i <= stage;
                const current = i === stage;
                return (
                  <li key={label} className="flex items-start gap-4 pb-5 last:pb-0 relative">
                    {i < STAGES.length - 1 && (
                      <span className={`absolute left-[11px] top-6 bottom-0 w-px ${done ? "bg-rust" : "bg-border"}`} />
                    )}
                    <span className={`relative z-10 size-6 rounded-full border-2 grid place-items-center shrink-0 ${
                      done ? "bg-rust border-rust text-paper" :
                      current ? "border-rust bg-paper" : "border-border bg-paper"
                    }`}>
                      {done ? <CheckCircle2 className="size-3.5" /> : <span className="size-1.5 rounded-full bg-muted-foreground" />}
                    </span>
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-[14px] font-medium ${done ? "text-ink" : "text-muted-foreground"}`}>{label}</span>
                        {done && <span className="font-mono text-[10.5px] text-muted-foreground">{14 - i}:{String((i * 17) % 60).padStart(2, "0")} ago</span>}
                      </div>
                      {current && (
                        <p className="text-[12.5px] text-muted-foreground mt-1">
                          Awaiting confirmation from dispatcher. ETA 4m.
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="mt-2 flex gap-2">
              <Btn variant="primary" onClick={() => { setStage(s => Math.min(STAGES.length - 1, s + 1)); toast.success("Workflow advanced"); }}>
                Advance stage <ChevronRight className="size-3.5" />
              </Btn>
              <Btn variant="outline" onClick={() => { setStage(STAGES.length - 1); toast.success("Case resolved"); }}>
                Mark Resolved
              </Btn>
            </div>
          </Panel>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <Panel>
            <Eyebrow>Nearest police station</Eyebrow>
            <div className="mt-2 flex items-start gap-3">
              <Building2 className="size-5 text-ink mt-0.5" />
              <div className="flex-1">
                <div className="font-display text-[18px] leading-tight">Madiwala PS</div>
                <div className="text-[12.5px] text-muted-foreground">1.2 km · 4 patrol units active</div>
              </div>
              <Btn size="sm" variant="outline"><Phone className="size-3" /></Btn>
            </div>
          </Panel>

          <Panel>
            <Eyebrow>Nearest hospital</Eyebrow>
            <div className="mt-2 flex items-start gap-3">
              <Building2 className="size-5 text-ink mt-0.5" />
              <div className="flex-1">
                <div className="font-display text-[18px] leading-tight">Apollo Hospital</div>
                <div className="text-[12.5px] text-muted-foreground">2.8 km · Trauma bay open</div>
              </div>
              <Btn size="sm" variant="outline"><Phone className="size-3" /></Btn>
            </div>
            <div className="mt-3 p-2.5 rounded bg-moss/10 border border-moss/20 text-[12px] text-moss">
              Ambulance KA-04-AMB-118 dispatched · ETA 4m 12s
            </div>
          </Panel>

          <Panel inset={false}>
            <div className="p-4 pb-2"><Eyebrow>Other active cases</Eyebrow></div>
            {accidents.slice(1).map(a => (
              <div key={a.id} className="px-4 py-3 border-t border-border">
                <div className="flex items-center gap-2"><SeverityBadge severity={a.severity} /><span className="font-mono text-[10.5px] text-muted-foreground ml-auto">{timeAgo(a.timestamp)}</span></div>
                <div className="text-[13px] font-medium mt-1.5 flex items-center gap-1.5"><MapPin className="size-3 text-muted-foreground" />{a.location}</div>
                <div className="font-mono text-[10.5px] text-muted-foreground mt-0.5">{a.id} · {a.people} ppl · {a.vehicles} veh</div>
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <Eyebrow>{label}</Eyebrow>
      <div className="font-display text-[20px] mt-1 leading-tight">{value}</div>
    </div>
  );
}
