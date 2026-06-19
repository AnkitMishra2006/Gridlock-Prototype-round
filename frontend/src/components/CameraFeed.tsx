import type { Camera } from "@/lib/mock-data";
import { Eyebrow } from "./ui-bits";

export function CameraFeed({
  camera, detection, large = false, overlay = true,
}: {
  camera: Camera;
  detection?: { label: string; confidence: number; severity: "low" | "medium" | "high" | "critical" };
  large?: boolean;
  overlay?: boolean;
}) {
  const offline = camera.status === "offline";
  return (
    <div className={`relative overflow-hidden rounded-lg border border-border bg-ink ${large ? "aspect-video" : "aspect-[4/3]"}`}>
      {offline ? (
        <div className="absolute inset-0 grid place-items-center bg-graphite text-paper/80 scanline">
          <div className="text-center font-mono">
            <div className="text-[10px] uppercase tracking-[0.2em] text-rust">Signal Lost</div>
            <div className="text-[12px] mt-1">{camera.id}</div>
          </div>
        </div>
      ) : (
        <>
          <img src={camera.feedUrl} alt={camera.name} className="absolute inset-0 size-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/80" />
          {overlay && <div className="absolute inset-0 scanline opacity-50 pointer-events-none" />}
          {overlay && (
            <div className="absolute inset-x-0 top-0 h-1 bg-rust/80 scan-bar" style={{ position: "absolute" }} />
          )}
        </>
      )}

      {/* HUD top */}
      <div className="absolute inset-x-0 top-0 p-3 flex items-start justify-between text-paper font-mono text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className={`size-1.5 rounded-full ${offline ? "bg-rust" : camera.status === "warning" ? "bg-amber-flag" : "bg-moss"} ${!offline && "live-dot"}`} />
          <span className="uppercase tracking-[0.18em]">{offline ? "OFFLINE" : "LIVE"}</span>
          <span className="text-paper/60">· {camera.id}</span>
        </div>
        <div className="text-paper/70">{new Date().toLocaleTimeString("en-GB").slice(0,8)}</div>
      </div>

      {/* Bounding box mock */}
      {large && !offline && (
        <>
          <div className="absolute border border-rust/80" style={{ left: "32%", top: "38%", width: "22%", height: "34%" }}>
            <div className="absolute -top-5 left-0 bg-rust text-paper font-mono text-[10px] px-1.5 py-0.5">
              vehicle · 0.94
            </div>
          </div>
          <div className="absolute border border-amber-flag/90" style={{ left: "58%", top: "42%", width: "12%", height: "20%" }}>
            <div className="absolute -top-5 left-0 bg-amber-flag text-ink font-mono text-[10px] px-1.5 py-0.5">
              rider · no_helmet
            </div>
          </div>
        </>
      )}

      {/* HUD bottom */}
      <div className="absolute inset-x-0 bottom-0 p-3 flex items-end justify-between text-paper">
        <div className="leading-tight">
          <div className="font-display text-[15px]">{camera.name}</div>
          <Eyebrow className="text-paper/70">{camera.zone} Zone · {camera.detections24h} det / 24h</Eyebrow>
        </div>
        {detection && !offline && (
          <div className="text-right font-mono text-[10.5px]">
            <div className="bg-paper/10 border border-paper/20 backdrop-blur px-2 py-1 rounded">
              <div className="text-rust uppercase tracking-[0.18em]">{detection.label}</div>
              <div className="text-paper/80">conf {detection.confidence.toFixed(2)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
