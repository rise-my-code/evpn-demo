import { LINKS, NODES, NODE_BY_ID, STAGES } from "@/lib/fabric/topology";
import type { FabricLink, FabricNode, OsId } from "@/lib/fabric/types";
import { useFabric } from "@/stores/fabric";
import { cn } from "@/lib/utils";

const OS_SHORT: Record<OsId, string> = {
  alpine: "Alpine",
  vyos13: "VyOS 1.3",
  arch: "Arch Linux",
  alma10: "AlmaLinux 10",
  pios: "Pi OS · Wi-Fi",
  ubuntu2404: "Ubuntu 24.04",
  ubuntu2604: "Ubuntu 26.04",
};

function nodeLive(stage: number, node: FabricNode): boolean {
  if (stage < 0) return true;
  if (node.role === "isp") return stage >= 1;
  if (node.role === "edge") return stage >= 3;
  return stage >= 1;
}

function linkVisible(stage: number, link: FabricLink, overlayOn: boolean): boolean {
  if (link.kind === "physical" || link.kind === "wifi") return true;
  if (link.kind === "vti") return stage >= 4;
  if (link.kind === "gre") return stage >= 5;
  if (link.kind === "evpn") return overlayOn;
  return false;
}

function linkDown(link: FabricLink, failures: string[]): boolean {
  if (link.id === "gre-zero" && failures.includes("wifi-flap")) return true;
  if (link.id === "phy-er4-zero" && failures.includes("wifi-flap")) return true;
  if (link.id === "vti-east" && (failures.includes("vti-east-down") || failures.includes("wan-partition")))
    return true;
  if ((link.id === "vti-west" || link.id === "vti-core") && failures.includes("wan-partition")) return true;
  if (link.b === "pi5" && failures.includes("pi5-frr-dead") && link.layer === "underlay") return true;
  return false;
}

function dash(kind: FabricLink["kind"]): string {
  if (kind === "gre") return "6 4";
  if (kind === "vti") return "2 5";
  if (kind === "wifi") return "1 3";
  if (kind === "evpn") return "10 8";
  return "";
}

function pathOf(a: FabricNode, b: FabricNode, kind: FabricLink["kind"]): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  if (kind === "vti") return `M ${a.x} ${a.y} Q ${mx} ${my - 36} ${b.x} ${b.y}`;
  if (kind === "gre") return `M ${a.x} ${a.y} Q ${mx + 18} ${my + 16} ${b.x} ${b.y}`;
  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
}

function roleTag(node: FabricNode): string {
  if (node.isRr) return "RR · VTEP";
  if (node.vxlan) return "VTEP";
  if (node.role === "edge") return "no VXLAN";
  return "NAT";
}

function LayerToggles() {
  const layers = useFabric((s) => s.layers);
  const toggleLayer = useFabric((s) => s.toggleLayer);
  return (
    <div className="flex gap-1">
      {(["physical", "underlay", "overlay"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => toggleLayer(l)}
          className={cn(
            "h-9 rounded-sm px-2.5 font-mono text-[10px] uppercase tracking-[0.12em]",
            layers[l] ? "bg-surface-2 text-fg" : "text-faint hover:text-muted",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function NodeGrid() {
  const stage = useFabric((s) => s.stage);
  const selected = useFabric((s) => s.selected);
  const select = useFabric((s) => s.select);
  const failures = useFabric((s) => s.failures);
  return (
    <ul className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-2">
      {NODES.map((node) => {
        const live = nodeLive(stage, node);
        const sel = selected === node.id;
        const failed =
          (node.id === "zero" && failures.includes("wifi-flap")) ||
          (node.id === "east" && failures.includes("vti-east-down")) ||
          (node.id === "pi5" && failures.includes("pi5-frr-dead")) ||
          (node.id === "arch" && failures.includes("rr-svd-down")) ||
          (node.site === "wan" && failures.includes("wan-partition"));
        return (
          <li key={node.id}>
            <button
              type="button"
              onClick={() => select(node.id)}
              className={cn(
                "flex min-h-16 w-full flex-col items-start rounded-lg border px-3 py-2 text-left",
                sel ? "border-accent bg-surface-2" : "border-border bg-bg",
                !live && "opacity-40",
              )}
            >
              <span className="flex items-center gap-2 text-sm font-medium text-fg">
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    !live ? "bg-faint" : failed ? "bg-down" : node.isVtep ? "bg-accent" : "bg-muted",
                  )}
                />
                {node.label}
              </span>
              <span className="mt-0.5 font-mono text-[10px] text-muted">{OS_SHORT[node.os]}</span>
              <span className="font-mono text-[10px] text-faint">
                {node.vtepIp ?? node.routerId} · {roleTag(node)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function TopologyCanvas() {
  const stage = useFabric((s) => s.stage);
  const selected = useFabric((s) => s.selected);
  const select = useFabric((s) => s.select);
  const layers = useFabric((s) => s.layers);
  const failures = useFabric((s) => s.failures);
  const status = useFabric((s) => s.status);
  const overlayOn = stage >= 9 && status !== "down";

  const vtepPairs: FabricLink[] = [];
  if (overlayOn && layers.overlay) {
    const vteps = NODES.filter((n) => n.isVtep);
    for (let i = 0; i < vteps.length; i++) {
      for (let j = i + 1; j < vteps.length; j++) {
        vtepPairs.push({
          id: `evpn-${vteps[i].id}-${vteps[j].id}`,
          a: vteps[i].id,
          b: vteps[j].id,
          kind: "evpn",
          layer: "overlay",
          label: "VXLAN",
          cost: 0,
          mtu: 1350,
        });
      }
    }
  }

  const W = 196;
  const H = 72;

  return (
    <div className="relative flex min-h-[320px] flex-1 flex-col overflow-hidden rounded-[20px] border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Topology</p>
        <LayerToggles />
      </div>
      <div className="lg:hidden">
        <NodeGrid />
      </div>
      <div className="relative hidden min-h-[420px] flex-1 lg:block">
        <svg
          viewBox="0 0 1200 640"
          className="h-full w-full"
          role="img"
          aria-label="Homelab BGP-EVPN topology"
        >
          <title>SVD Fabric topology</title>
          <text
            x="48"
            y="28"
            fill="currentColor"
            className="fill-faint"
            fontSize="11"
            fontFamily="IBM Plex Mono, monospace"
            letterSpacing="0.18em"
          >
            WAN / VPS
          </text>
          <text
            x="48"
            y="448"
            fill="currentColor"
            className="fill-faint"
            fontSize="11"
            fontFamily="IBM Plex Mono, monospace"
            letterSpacing="0.18em"
          >
            HOUSE
          </text>
          <line
            x1="40"
            y1="428"
            x2="1160"
            y2="428"
            stroke="currentColor"
            className="stroke-border"
            strokeDasharray="2 6"
          />

          {[...vtepPairs, ...LINKS].map((link) => {
            if (link.layer !== "overlay" && !layers[link.layer]) return null;
            if (link.layer === "overlay" && !layers.overlay) return null;
            if (!linkVisible(stage, link, overlayOn) && link.kind !== "evpn") return null;
            const a = NODE_BY_ID[link.a];
            const b = NODE_BY_ID[link.b];
            const down = linkDown(link, failures);
            const dormant = (link.kind === "physical" || link.kind === "wifi") && stage < 3;
            const overlay = link.kind === "evpn";
            return (
              <g key={link.id} opacity={overlay ? 0.28 : down ? 0.35 : dormant ? 0.55 : 1}>
                <path
                  d={pathOf(a, b, link.kind)}
                  fill="none"
                  stroke="currentColor"
                  className={down ? "stroke-down" : overlay ? "stroke-accent" : "stroke-muted"}
                  strokeWidth={overlay ? 1 : link.layer === "underlay" ? 1.6 : 1.15}
                  strokeDasharray={down ? "3 5" : dash(link.kind)}
                />
              </g>
            );
          })}

          {NODES.map((node) => {
            const live = nodeLive(stage, node);
            const sel = selected === node.id;
            const x = node.x - W / 2;
            const y = node.y - H / 2;
            const failed =
              (node.id === "zero" && failures.includes("wifi-flap")) ||
              (node.id === "east" && failures.includes("vti-east-down")) ||
              (node.id === "pi5" && failures.includes("pi5-frr-dead")) ||
              (node.id === "arch" && failures.includes("rr-svd-down")) ||
              (node.site === "wan" && failures.includes("wan-partition"));
            const clip = `clip-${node.id}`;
            return (
              <g key={node.id} transform={`translate(${x} ${y})`} className="cursor-pointer">
                <defs>
                  <clipPath id={clip}>
                    <rect width={W} height={H} rx={14} />
                  </clipPath>
                </defs>
                <rect
                  width={W}
                  height={H}
                  rx={14}
                  className={cn(
                    sel ? "fill-surface-2 stroke-accent" : "fill-bg stroke-border",
                    !live && "opacity-40",
                  )}
                  strokeWidth={sel ? 1.5 : 1}
                  onClick={() => select(node.id)}
                />
                <g clipPath={`url(#${clip})`} onClick={() => select(node.id)}>
                  <circle
                    cx={16}
                    cy={18}
                    r={4}
                    className={
                      !live
                        ? "fill-faint"
                        : failed
                          ? "fill-down"
                          : node.isVtep
                            ? "fill-accent"
                            : "fill-muted"
                    }
                  />
                  <text
                    x={28}
                    y={22}
                    fill="currentColor"
                    className="fill-fg"
                    fontSize="13"
                    fontFamily="IBM Plex Sans, sans-serif"
                    fontWeight={500}
                  >
                    {node.label}
                  </text>
                  <text
                    x={16}
                    y={42}
                    fill="currentColor"
                    className="fill-muted"
                    fontSize="11"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    {OS_SHORT[node.os]}
                  </text>
                  <text
                    x={16}
                    y={58}
                    fill="currentColor"
                    className="fill-faint"
                    fontSize="11"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    {node.vtepIp ?? node.routerId} · {roleTag(node)}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
        {stage >= 0 && stage < STAGES.length && status !== "up" && status !== "degraded" && (
          <p className="pointer-events-none absolute bottom-3 left-3 right-3 font-mono text-[11px] text-muted">
            {STAGES[stage].title}
          </p>
        )}
      </div>
    </div>
  );
}
