import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { cameras, incidents } from "@/lib/mock-data";
import { CameraFeed } from "@/components/CameraFeed";
import { Btn, Eyebrow, Panel, PlateChip, SectionTitle, SeverityBadge } from "@/components/ui-bits";
import { Maximize2, ShieldAlert, Send, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/live")({
  head: () => ({ meta: [{ title: "Live Feeds · GuardianEye" }] }),
  component: LivePage,
});

function LivePage() {
  const [selectedId, setSelectedId] = useState(cameras[0].id);
  const selected = cameras.find(c => c.id === selectedId)!;
  const detection = incidents.find(i => i.cameraId === selectedId) ?? incidents[0];

  return (
    <div className="p-5 lg:p-8 space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <Eyebrow>Camera grid · {cameras.length} feeds</Eyebrow>
          <h1 className="font-display text-[40px] leading-tight mt-1.5">Live monitoring</h1>
          <p className="text-[13.5px] text-muted-foreground mt-1 max-w-lg">
            Frames pulled at 24fps. Bounding boxes drawn by the on-device detector and verified at the edge before reaching this view.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-moss" />active</span>
          <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-amber-flag" />warning</span>
          <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-rust" />offline</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Selected feed */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className="relative">
            <CameraFeed
              camera={selected}
              large
              detection={{ label: detection.type, confidence: detection.confidence, severity: detection.severity }}
            />
            <div className="absolute top-3 right-3">
              <Btn size="sm" variant="outline" className="bg-paper/90"><Maximize2 className="size-3.5" /> Full</Btn>
            </div>
          </div>

          {/* Camera strip */}
          <div className="grid grid-cols-4 gap-3">
            {cameras.slice(0, 4).map(c => (
              <button key={c.id} onClick={() => setSelectedId(c.id)} className={`text-left rounded-md overflow-hidden border ${selectedId === c.id ? "border-rust ring-2 ring-rust/30" : "border-border hover:border-graphite/60"} transition-all`}>
                <CameraFeed camera={c} />
              </button>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <Panel>
            <Eyebrow>Selected detection</Eyebrow>
            <h3 className="font-display text-[22px] mt-1 leading-tight">{detection.type}</h3>
            <div className="mt-2 flex items-center gap-2">
              <SeverityBadge severity={detection.severity} />
              <span className="font-mono text-[11px] text-muted-foreground">{Math.round(detection.confidence * 100)}% confidence</span>
            </div>
            <dl className="mt-4 space-y-2.5 text-[13px]">
              <Row label="Vehicle">{detection.vehicles} detected</Row>
              <Row label="Number plate"><PlateChip plate={detection.plate} /></Row>
              <Row label="Camera">{selected.id} · {selected.name}</Row>
              <Row label="Zone">{selected.zone}</Row>
              <Row label="Frame ID"><span className="font-mono text-[11.5px]">F-{Math.floor(Math.random()*9e6)+1e6}</span></Row>
            </dl>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Btn variant="primary" onClick={() => toast.success("Police alert dispatched", { description: `${detection.type} at ${selected.name}` })}>
                <Send className="size-3.5" /> Send Alert
              </Btn>
              <Btn variant="outline"><FileText className="size-3.5" /> Open Case</Btn>
            </div>
          </Panel>

          <Panel>
            <SectionTitle eyebrow="Recommendation" title="Suggested action" />
            <div className="flex gap-3 text-[13px]">
              <ShieldAlert className="size-4 text-rust mt-0.5 shrink-0" />
              <p className="text-graphite leading-relaxed">
                Issue e-challan to <span className="font-medium">{detection.plate}</span> under section 194D MV Act. Dispatch nearest patrol unit (PCR-12, ETA 3m).
              </p>
            </div>
          </Panel>

          <Panel inset={false}>
            <div className="p-4 pb-2"><Eyebrow>Camera roster</Eyebrow></div>
            <div>
              {cameras.map(c => (
                <button key={c.id} onClick={() => setSelectedId(c.id)} className={`w-full px-4 py-2.5 border-t border-border text-left flex items-center gap-3 hover:bg-muted/50 ${selectedId === c.id ? "bg-muted" : ""}`}>
                  <span className={`size-1.5 rounded-full ${c.status === "active" ? "bg-moss" : c.status === "warning" ? "bg-amber-flag" : "bg-rust"}`} />
                  <span className="font-mono text-[11px] text-muted-foreground w-16">{c.id}</span>
                  <span className="flex-1 text-[12.5px]">{c.name}</span>
                  <span className="font-mono text-[10.5px] text-muted-foreground">{c.zone}</span>
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-border last:border-0">
      <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
