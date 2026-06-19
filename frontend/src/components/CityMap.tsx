import type { Camera, Severity } from "@/lib/mock-data";
import { cameras, hotspots } from "@/lib/mock-data";

const sevColor: Record<Severity, string> = {
  low: "var(--color-sev-low)",
  medium: "var(--color-sev-med)",
  high: "var(--color-rust)",
  critical: "var(--color-sev-crit)",
};

export function CityMap({
  height = 520,
  showHotspots = true,
  selected,
  onSelect,
}: {
  height?: number;
  showHotspots?: boolean;
  selected?: string;
  onSelect?: (c: Camera) => void;
}) {
  return (
    <div
      className="relative w-full rounded-lg overflow-hidden border border-border bg-bone"
      style={{ height }}
    >
      {/* hairline grid */}
      <div className="absolute inset-0 hairline-grid opacity-60" />
      {/* paper grain */}
      <div className="absolute inset-0 paper-grain opacity-70" />

      {/* roads — hand-drawn topographic feel */}
      <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="dashes" width="2" height="0.4" patternUnits="userSpaceOnUse">
            <rect width="1" height="0.4" fill="currentColor" />
          </pattern>
        </defs>
        <g className="text-graphite/30" strokeWidth="0.35" fill="none" stroke="currentColor">
          <path d="M0,28 C 20,30 40,24 60,30 S 90,34 100,30" />
          <path d="M0,58 C 25,56 45,62 65,58 S 95,54 100,58" />
          <path d="M22,0 C 24,20 18,40 26,60 S 30,90 28,100" />
          <path d="M62,0 C 60,18 68,36 64,58 S 70,86 68,100" />
          <path d="M0,82 L 100,78" />
        </g>
        <g className="text-graphite/15" strokeWidth="0.18" fill="none" stroke="currentColor">
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={i} x1={i * 7} y1="0" x2={i * 7 + 8} y2="100" />
          ))}
        </g>
      </svg>

      {/* risk haze blobs */}
      {showHotspots && (
        <>
          <div className="absolute rounded-full blur-3xl"
            style={{ left: "56%", top: "58%", width: 180, height: 180, background: "oklch(0.55 0.18 32 / 0.28)" }} />
          <div className="absolute rounded-full blur-3xl"
            style={{ left: "18%", top: "8%", width: 140, height: 140, background: "oklch(0.55 0.18 32 / 0.18)" }} />
          <div className="absolute rounded-full blur-3xl"
            style={{ left: "66%", top: "78%", width: 160, height: 160, background: "oklch(0.74 0.14 75 / 0.22)" }} />
        </>
      )}

      {/* camera pins */}
      {cameras.map((c) => {
        const active = selected === c.id;
        const sev: Severity = c.status === "offline" ? "medium" : c.detections24h > 400 ? "high" : c.detections24h > 200 ? "medium" : "low";
        return (
          <button
            key={c.id}
            onClick={() => onSelect?.(c)}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${c.lng}%`, top: `${c.lat}%` }}
          >
            <span
              className="block size-3 rounded-full ring-2 ring-paper shadow"
              style={{ background: c.status === "offline" ? "var(--color-graphite)" : sevColor[sev] }}
            />
            {c.status !== "offline" && (
              <span
                className="absolute inset-0 -m-1.5 rounded-full opacity-40 live-dot"
                style={{ background: sevColor[sev] }}
              />
            )}
            <span className={`absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] px-1.5 py-0.5 rounded bg-paper/90 border border-border ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}>
              {c.id} · {c.name}
            </span>
          </button>
        );
      })}

      {/* compass + legend */}
      <div className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-[0.18em] text-graphite/80 bg-paper/80 border border-border rounded px-2 py-1">
        N ↑ · Bengaluru · 12.97°N
      </div>
      <div className="absolute bottom-3 left-3 flex items-center gap-3 font-mono text-[10px] bg-paper/80 border border-border rounded px-2.5 py-1.5">
        {(["low","medium","high","critical"] as Severity[]).map(s => (
          <span key={s} className="flex items-center gap-1 uppercase tracking-[0.14em]">
            <span className="size-2 rounded-full" style={{ background: sevColor[s] }} />{s}
          </span>
        ))}
      </div>
      <div className="absolute bottom-3 right-3 font-mono text-[10px] uppercase tracking-[0.18em] text-graphite/70 bg-paper/80 border border-border rounded px-2 py-1">
        scale 1:24,000
      </div>
    </div>
  );
}

export function HotspotsList() {
  return (
    <div className="space-y-1">
      {hotspots.map((h, i) => (
        <div key={h.name} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
          <span className="font-mono text-[11px] text-muted-foreground w-5">{String(i + 1).padStart(2, "0")}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium truncate">{h.name}</div>
            <div className="font-mono text-[10.5px] text-muted-foreground">{h.incidents} incidents · 7d</div>
          </div>
          <div className="text-right">
            <div className="font-display text-[20px] leading-none">{h.risk}</div>
            <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-rust">risk</div>
          </div>
        </div>
      ))}
    </div>
  );
}
