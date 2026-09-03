import { Activity, Download, Power, Square } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { downloadLabctl } from "@/lib/fabric/labctl";
import { STAGES } from "@/lib/fabric/topology";
import { useFabric } from "@/stores/fabric";

const STATUS: Record<string, { label: string; variant: "default" | "up" | "warn" | "down" }> = {
  down: { label: "down", variant: "down" },
  "bringing-up": { label: "bringing up", variant: "warn" },
  up: { label: "converged", variant: "up" },
  "tearing-down": { label: "tearing down", variant: "warn" },
  degraded: { label: "degraded", variant: "warn" },
};

export function TopBar() {
  const status = useFabric((s) => s.status);
  const stage = useFabric((s) => s.stage);
  const bringUp = useFabric((s) => s.bringUp);
  const tearDown = useFabric((s) => s.tearDown);
  const st = STATUS[status];
  const busy = status === "bringing-up" || status === "tearing-down";

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-border bg-surface px-4 py-3 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-sm border border-border bg-surface-2">
          <Activity className="size-4 text-accent" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0">
            <h1 className="font-sans text-base font-semibold tracking-tight text-fg">SVD Fabric</h1>
            <p className="font-mono text-xs text-muted">AS64512 · BGP-EVPN · Single VXLAN Device</p>
          </div>
          <p className="mt-0.5 truncate text-xs text-faint">
            Rootless Podman labctl — Arch systemd-networkd SVD, ER4 underlay, FRR VTEPs
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={st.variant}>{st.label}</Badge>
        {stage >= 0 && (
          <span className="hidden font-mono text-xs tabular-nums text-muted sm:inline">
            {Math.min(stage + 1, STAGES.length)}/{STAGES.length}
          </span>
        )}
        <Button size="sm" onClick={downloadLabctl} aria-label="Download labctl script">
          <Download className="size-3.5" />
          Download labctl
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={bringUp}
          disabled={busy || status === "up" || status === "degraded"}
          aria-label="Preview bring-up stages"
        >
          <Power className="size-3.5" />
          Preview stages
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={tearDown}
          disabled={busy || status === "down"}
          aria-label="Reset stage preview"
        >
          <Square className="size-3.5" />
          Reset
        </Button>
      </div>
    </header>
  );
}
