import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { cameras } from "@/lib/mock-data";
import { Btn, Eyebrow, Panel, SectionTitle } from "@/components/ui-bits";
import { MessageSquare, Mail, Smartphone, Building2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · GuardianEye" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [thresholds, setThresholds] = useState({ low: 0.6, medium: 0.75, high: 0.85 });
  const [channels, setChannels] = useState({ sms: true, whatsapp: true, email: false, police: true, hospital: true });

  return (
    <div className="p-5 lg:p-8 space-y-6">
      <SectionTitle eyebrow="Administration" title="System settings" sub="Cameras, thresholds, and downstream notification routes." />

      <div className="grid grid-cols-12 gap-6">
        {/* Camera management */}
        <Panel inset={false} className="col-span-12 xl:col-span-8 overflow-hidden">
          <div className="p-5 pb-3 border-b border-border flex items-end justify-between">
            <div>
              <Eyebrow>Fleet</Eyebrow>
              <h3 className="font-display text-[22px] mt-1">Camera management</h3>
            </div>
            <Btn variant="primary" onClick={() => toast.success("Add camera modal would open")}>+ Add camera</Btn>
          </div>
          <table className="w-full text-[13px]">
            <thead className="bg-bone/60 border-b border-border">
              <tr className="text-left font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                <th className="px-5 py-2.5">ID</th>
                <th className="py-2.5">Name</th>
                <th className="py-2.5">Zone</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5">24h det.</th>
                <th className="py-2.5 px-5"></th>
              </tr>
            </thead>
            <tbody>
              {cameras.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-5 py-3 font-mono text-[11.5px] text-muted-foreground">{c.id}</td>
                  <td className="py-3">{c.name}</td>
                  <td className="py-3 text-graphite">{c.zone}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
                      <span className={`size-1.5 rounded-full ${c.status === "active" ? "bg-moss" : c.status === "warning" ? "bg-amber-flag" : "bg-rust"}`} />
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-[12px]">{c.detections24h}</td>
                  <td className="py-3 px-5 text-right"><Btn size="sm" variant="outline">Configure</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        {/* Right column */}
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <Panel>
            <Eyebrow>Alert thresholds · confidence</Eyebrow>
            <div className="mt-4 space-y-4">
              {(["low","medium","high"] as const).map(k => (
                <div key={k}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] capitalize">{k} severity</span>
                    <span className="font-mono text-[12px]">{thresholds[k].toFixed(2)}</span>
                  </div>
                  <input type="range" min={0.5} max={0.99} step={0.01}
                    value={thresholds[k]} onChange={e => setThresholds(p => ({ ...p, [k]: parseFloat(e.target.value) }))}
                    className="w-full accent-[color:var(--color-rust)]" />
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <Eyebrow>Severity rules</Eyebrow>
            <ul className="mt-3 space-y-2 text-[12.5px] text-graphite">
              <li className="flex gap-2"><ShieldCheck className="size-3.5 mt-0.5 text-moss shrink-0" /> Accident detected + ≥2 vehicles → Critical</li>
              <li className="flex gap-2"><ShieldCheck className="size-3.5 mt-0.5 text-moss shrink-0" /> Red light jump + speed &gt; 50 km/h → High</li>
              <li className="flex gap-2"><ShieldCheck className="size-3.5 mt-0.5 text-moss shrink-0" /> Repeat offender (3+) auto-escalates one tier</li>
            </ul>
          </Panel>
        </div>

        {/* Channels */}
        <Panel className="col-span-12">
          <SectionTitle eyebrow="Downstream" title="Notification channels" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <Channel icon={<Smartphone className="size-4" />} name="SMS" desc="Twilio · India sender" enabled={channels.sms} onToggle={() => setChannels(p => ({ ...p, sms: !p.sms }))} />
            <Channel icon={<MessageSquare className="size-4" />} name="WhatsApp" desc="WA Cloud API · template approved" enabled={channels.whatsapp} onToggle={() => setChannels(p => ({ ...p, whatsapp: !p.whatsapp }))} />
            <Channel icon={<Mail className="size-4" />} name="Email" desc="SES · ops@guardianeye" enabled={channels.email} onToggle={() => setChannels(p => ({ ...p, email: !p.email }))} />
            <Channel icon={<Building2 className="size-4" />} name="Police dashboard" desc="REST hook · KA Police CCC" enabled={channels.police} onToggle={() => setChannels(p => ({ ...p, police: !p.police }))} />
            <Channel icon={<Building2 className="size-4" />} name="Hospital dashboard" desc="Apollo · Manipal · Fortis" enabled={channels.hospital} onToggle={() => setChannels(p => ({ ...p, hospital: !p.hospital }))} />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Channel({ icon, name, desc, enabled, onToggle }: { icon: React.ReactNode; name: string; desc: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className={`p-4 rounded-lg border ${enabled ? "border-ink/40 bg-bone/50" : "border-border bg-muted/30"} flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <div className="size-8 rounded-md bg-ink text-paper grid place-items-center">{icon}</div>
        <button onClick={onToggle} className={`relative w-9 h-5 rounded-full transition-colors ${enabled ? "bg-rust" : "bg-muted-foreground/40"}`}>
          <span className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-paper transition-transform ${enabled ? "translate-x-4" : ""}`} />
        </button>
      </div>
      <div>
        <div className="text-[14px] font-medium">{name}</div>
        <div className="text-[11.5px] text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}
