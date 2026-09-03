import { useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { runCli } from "@/lib/fabric/cli";
import { svdBootstrap, edgeOsConfig } from "@/lib/fabric/configs";
import { allWorkloads } from "@/lib/fabric/control-plane";
import { downloadLabctl, LABCTL } from "@/lib/fabric/labctl";
import { formatNetworkdUnits } from "@/lib/fabric/networkd";
import { NODE_BY_ID, NODES, TENANTS } from "@/lib/fabric/topology";
import type { FailureId } from "@/lib/fabric/types";
import { useFabric } from "@/stores/fabric";
import { cn } from "@/lib/utils";

const FAILURES: { id: FailureId; label: string; hint: string }[] = [
  { id: "wifi-flap", label: "Pi Zero Wi-Fi flap", hint: "GRE2 / OSPF cost-100 path dies" },
  { id: "vti-east-down", label: "Drop VTI east", hint: "IPsec SA to Ubuntu 24.04 east" },
  { id: "pi5-frr-dead", label: "Kill FRR on Pi 5", hint: "Alma 10 VTEP withdraws" },
  { id: "rr-svd-down", label: "RR SVD down", hint: "Arch reflector — overlay blackhole" },
  { id: "wan-partition", label: "WAN partition", hint: "All three VTIs down" },
];

function Pre({ children }: { children: string }) {
  return (
    <pre className="terminal-scroll max-h-[52vh] overflow-auto whitespace-pre-wrap break-all rounded-md border border-border bg-bg p-3 font-mono text-[11px] leading-relaxed text-fg">
      {children}
    </pre>
  );
}

function NodeTab() {
  const id = useFabric((s) => s.selected);
  const plane = useFabric((s) => s.plane);
  const node = NODE_BY_ID[id];
  const ospf = plane.ospf.filter((o) => o.node === id);
  const bgp = plane.bgp.filter((b) => b.node === id && b.peer !== "0.0.0.0");
  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold text-fg">{node.label}</h2>
          {node.isRr && <Badge variant="accent">EVPN RR</Badge>}
          {node.isVtep && <Badge variant="up">VTEP</Badge>}
          {!node.vxlan && node.role === "edge" && <Badge variant="warn">no VXLAN</Badge>}
        </div>
        <p className="mt-1 text-xs text-muted">{node.osLabel}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{node.summary}</p>
        <p className="mt-1 font-mono text-[11px] text-faint">{node.location}</p>
      </div>
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Interfaces</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left font-mono text-[11px]">
            <thead className="text-faint">
              <tr>
                <th className="pb-1 font-medium">Name</th>
                <th className="pb-1 font-medium">Kind</th>
                <th className="pb-1 font-medium">Address</th>
                <th className="pb-1 font-medium">MTU</th>
              </tr>
            </thead>
            <tbody>
              {node.interfaces.map((i) => (
                <tr key={i.name} className="border-t border-border/80">
                  <td className="py-1.5 text-fg">{i.name}</td>
                  <td className="text-muted">{i.kind}</td>
                  <td className="text-accent">{i.addr ?? "—"}</td>
                  <td className="tabular-nums text-muted">{i.mtu}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {ospf.length > 0 && (
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">OSPF</p>
          <ul className="space-y-1 font-mono text-[11px]">
            {ospf.map((o) => (
              <li key={o.peer + o.iface} className="flex justify-between gap-2">
                <span className="text-fg">
                  {o.peer} via {o.iface}
                </span>
                <span className={o.state === "Down" ? "text-down" : "text-up"}>{o.state}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {bgp.length > 0 && (
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">BGP EVPN</p>
          <ul className="space-y-1 font-mono text-[11px]">
            {bgp.map((b) => (
              <li key={b.peer} className="flex justify-between gap-2">
                <span className="text-fg">
                  {b.peer} {b.rrClient ? "RR-c" : ""}
                </span>
                <span className={b.state === "Established" ? "text-up" : "text-warn"}>
                  {b.state} · {b.prefixes}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {node.workloads.length > 0 && (
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">CEs</p>
          <ul className="space-y-1 font-mono text-[11px] text-fg">
            {node.workloads.map((w) => (
              <li key={w.name}>
                {w.name} · {w.tenant} · {w.ip} · {w.mac}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function EvpnTab() {
  const plane = useFabric((s) => s.plane);
  const status = useFabric((s) => s.status);
  const [filter, setFilter] = useState<"all" | 2 | 3 | 5>("all");
  const rows = plane.evpn.filter((r) => (filter === "all" ? true : r.type === filter));
  const fabricDown = status === "down" || status === "bringing-up" || status === "tearing-down";
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {(["all", 2, 3, 5] as const).map((k) => (
          <button
            key={String(k)}
            type="button"
            onClick={() => setFilter(k)}
            className={cn(
              "h-8 rounded-sm px-2.5 font-mono text-[10px] uppercase tracking-[0.12em]",
              filter === k ? "bg-surface-2 text-fg" : "text-faint",
            )}
          >
            {k === "all" ? "all" : `Type-${k}`}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted">
        Type-2 MAC/IP · Type-3 IMET (head-end replication) · Type-5 IP prefix. ER4 never appears here.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left font-mono text-[11px]">
          <thead className="text-faint">
            <tr>
              <th className="pb-1 font-medium">T</th>
              <th className="pb-1 font-medium">RD / RT</th>
              <th className="pb-1 font-medium">NLRI</th>
              <th className="pb-1 font-medium">NH</th>
              <th className="pb-1 font-medium">Orig</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-faint">
                  {fabricDown ? "Overlay is down. Bring the fabric up." : "No EVPN routes for this filter."}
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border/80">
                <td className="py-1.5 text-accent">{r.type}</td>
                <td className="text-muted">
                  {r.rd}
                  <br />
                  {r.rt}
                </td>
                <td className="text-fg">
                  {r.type === 2 && `${r.mac} ${r.ip}`}
                  {r.type === 3 && `IMET ${r.nexthop}`}
                  {r.type === 5 && r.prefix}
                  <span className="block text-faint">VNI {r.vni}</span>
                </td>
                <td className="text-muted">{r.nexthop}</td>
                <td className="text-muted">{NODE_BY_ID[r.originator].hostname}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SvdTab() {
  const plane = useFabric((s) => s.plane);
  const id = useFabric((s) => s.selected);
  const node = NODE_BY_ID[id];
  const svd = plane.svd.find((s) => s.node === id);
  if (!node.isVtep) {
    return (
      <div className="space-y-3 text-sm text-muted">
        <p>
          {node.label} has no SVD. EdgeOS 3.0.1 on the Cavium ER4 never grew a VXLAN dataplane — VyOS 1.3 in
          this lab is constrained the same way.
        </p>
        <p>
          Outer VXLAN (UDP/4789) is just another IPv4 packet. This box forwards 10.254.0.0/24 between GRE and
          VTI and never looks inside.
        </p>
        <Pre>{edgeOsConfig()}</Pre>
      </div>
    );
  }
  if (node.os === "arch") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted">
          Arch owns the dataplane with <span className="font-mono text-fg">systemd-networkd</span>.{" "}
          <span className="font-mono text-fg">vxlan0</span> is created as{" "}
          <span className="font-mono text-fg">Kind=vxlan</span> with{" "}
          <span className="font-mono text-fg">External=yes</span> and{" "}
          <span className="font-mono text-fg">VNIFilter=yes</span> (systemd 258+). VLAN↔VNI{" "}
          <span className="font-mono text-fg">tunnel_info</span> is still an iproute2 oneshot — networkd has
          no unit key for it.
        </p>
        {svd && (
          <dl className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <dt className="text-faint">local</dt>
            <dd className="text-fg">{svd.local}</dd>
            <dt className="text-faint">dstport</dt>
            <dd className="text-fg">{svd.dstport}</dd>
            <dt className="text-faint">flags</dt>
            <dd className="text-fg">{svd.flags.join(" ")}</dd>
            <dt className="text-faint">VNIs</dt>
            <dd className="text-fg">{svd.vnis.join(", ") || "—"}</dd>
            <dt className="text-faint">vlan_tunnel</dt>
            <dd className="text-fg">{svd.vlanTunnel ? "on" : "off"}</dd>
            <dt className="text-faint">neigh_suppress</dt>
            <dd className="text-fg">{svd.neighSuppress ? "on" : "off"}</dd>
          </dl>
        )}
        {!svd && (
          <p className="text-xs text-faint">vxlan0 is pending — bring the fabric past the SVD stage.</p>
        )}
        <Pre>{formatNetworkdUnits()}</Pre>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        One <span className="font-mono text-fg">vxlan0</span> with <span className="font-mono text-fg">external vnifilter</span>.
        Traditional Linux was one netdev per VNI. SVD maps VLAN↔VNI on a single collect-metadata device.
      </p>
      {svd && (
        <dl className="grid grid-cols-2 gap-2 font-mono text-[11px]">
          <dt className="text-faint">local</dt>
          <dd className="text-fg">{svd.local}</dd>
          <dt className="text-faint">dstport</dt>
          <dd className="text-fg">{svd.dstport}</dd>
          <dt className="text-faint">flags</dt>
          <dd className="text-fg">{svd.flags.join(" ")}</dd>
          <dt className="text-faint">VNIs</dt>
          <dd className="text-fg">{svd.vnis.join(", ") || "—"}</dd>
          <dt className="text-faint">vlan_tunnel</dt>
          <dd className="text-fg">{svd.vlanTunnel ? "on" : "off"}</dd>
          <dt className="text-faint">neigh_suppress</dt>
          <dd className="text-fg">{svd.neighSuppress ? "on" : "off"}</dd>
        </dl>
      )}
      <Pre>{svdBootstrap(node)}</Pre>
    </div>
  );
}

function CliTab() {
  const id = useFabric((s) => s.selected);
  const plane = useFabric((s) => s.plane);
  const stage = useFabric((s) => s.stage);
  const [input, setInput] = useState("show bgp l2vpn evpn");
  const [hist, setHist] = useState<string[]>(() => [
    runCli(id, "show version", plane, stage).trimEnd(),
  ]);
  const node = NODE_BY_ID[id];

  function submit(e: FormEvent) {
    e.preventDefault();
    const line = input.trim();
    if (!line) return;
    if (line === "clear") {
      setHist([]);
      setInput("");
      return;
    }
    setHist((h) => [...h, runCli(id, line, plane, stage).trimEnd()]);
    setInput("");
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        {node.hostname} · vtysh
      </p>
      <ScrollArea className="h-[280px] rounded-md border border-border bg-bg">
        <pre className="p-3 font-mono text-[11px] leading-relaxed text-fg">
          {hist.join("\n\n") || " "}
        </pre>
      </ScrollArea>
      <form onSubmit={submit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="show ip ospf neighbor"
          className="h-11 font-mono text-xs"
          aria-label="vtysh command"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <Button type="submit" size="sm" className="h-11">
          Run
        </Button>
      </form>
      <div className="flex flex-wrap gap-1">
        {(node.os === "arch"
          ? ["show ip ospf neighbor", "show bgp l2vpn evpn", "show networkd", "show svd", "show running-config"]
          : ["show ip ospf neighbor", "show bgp l2vpn evpn", "show evpn mac vni all", "show svd", "show running-config"]
        ).map((c) => (
            <button
              key={c}
              type="button"
              className="h-8 rounded-sm px-2 font-mono text-[10px] text-muted hover:text-fg"
              onClick={() => {
                setHist((h) => [...h, runCli(id, c, plane, stage).trimEnd()]);
              }}
            >
              {c}
            </button>
          ))}
      </div>
    </div>
  );
}

function TraceTab() {
  const src = useFabric((s) => s.traceSrc);
  const dst = useFabric((s) => s.traceDst);
  const setTrace = useFabric((s) => s.setTrace);
  const hops = useFabric((s) => s.trace);
  const rerun = useFabric((s) => s.rerunTrace);
  const status = useFabric((s) => s.status);
  const wls = allWorkloads();

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        Follow a tenant packet: CE → SVD → VXLAN → GRE/VTI → ER4 (IPv4 only) → remote SVD → CE.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="space-y-1 text-xs text-muted">
          Source CE
          <select
            className="h-11 w-full rounded-sm border border-border bg-surface px-2 font-mono text-xs text-fg"
            value={src}
            onChange={(e) => setTrace(e.target.value, dst)}
          >
            {wls.map((w) => (
              <option key={w.key} value={w.key}>
                {w.label} ({w.ip})
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs text-muted">
          Dest CE
          <select
            className="h-11 w-full rounded-sm border border-border bg-surface px-2 font-mono text-xs text-fg"
            value={dst}
            onChange={(e) => setTrace(src, e.target.value)}
          >
            {wls.map((w) => (
              <option key={w.key} value={w.key}>
                {w.label} ({w.ip})
              </option>
            ))}
          </select>
        </label>
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={rerun}
        disabled={status === "down"}
      >
        Trace path
      </Button>
      <ol className="space-y-2">
        {hops.length === 0 && (
          <li className="text-xs text-faint">Bring the fabric up, then trace.</li>
        )}
        {hops.map((h, i) => (
          <li key={i} className="rounded-md border border-border bg-bg p-3">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-fg">
                {i + 1}. {h.title}
              </p>
              <p className="font-mono text-[10px] text-muted">{h.node}</p>
            </div>
            <p className="mt-1 font-mono text-[11px] text-accent">{h.packet}</p>
            <p className="mt-1 text-xs text-muted">{h.note}</p>
            <p className="mt-0.5 font-mono text-[10px] text-faint">{h.layer}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function LabTab() {
  const failures = useFabric((s) => s.failures);
  const toggle = useFabric((s) => s.toggleFailure);
  const status = useFabric((s) => s.status);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted">
          The demo is the rootless Podman lab on the Arch miniPC — not this browser.{" "}
          <span className="font-mono text-fg">labctl up</span> builds images, pasta networks, systemd
          containers, GRE/VTI, systemd-networkd SVD on Arch, FRR EVPN.{" "}
          <span className="font-mono text-fg">labctl down</span> tears it out.
        </p>
        <Button size="sm" className="mt-3" onClick={downloadLabctl}>
          Download labctl
        </Button>
      </div>
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">labctl</p>
        <Pre>{LABCTL}</Pre>
      </div>
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Tenants</p>
        <ul className="space-y-1 text-xs text-muted">
          {TENANTS.map((t) => (
            <li key={t.id} className="font-mono text-[11px] text-fg">
              {t.name} vlan {t.vlan} L2VNI {t.l2vni} L3VNI {t.l3vni} {t.prefix} gw {t.gw}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          Preview-only failure injection
        </p>
        <div className="space-y-1">
          {FAILURES.map((f) => {
            const on = failures.includes(f.id);
            return (
              <button
                key={f.id}
                type="button"
                disabled={status === "down"}
                onClick={() => toggle(f.id)}
                className={cn(
                  "flex min-h-11 w-full items-center justify-between rounded-md border px-3 text-left",
                  on ? "border-warn/40 bg-warn/10" : "border-border bg-bg",
                )}
              >
                <span>
                  <span className="block text-sm text-fg">{f.label}</span>
                  <span className="block text-xs text-muted">{f.hint}</span>
                </span>
                <span className={cn("font-mono text-[10px] uppercase", on ? "text-warn" : "text-faint")}>
                  {on ? "on" : "off"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Inspector() {
  const select = useFabric((s) => s.select);
  const selected = useFabric((s) => s.selected);
  return (
    <aside className="flex min-h-0 flex-col rounded-[20px] border border-border bg-surface">
      <div className="border-b border-border px-3 py-2">
        <label className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Node</span>
          <select
            className="h-9 flex-1 rounded-sm border border-border bg-bg px-2 font-mono text-xs text-fg"
            value={selected}
            onChange={(e) => select(e.target.value)}
            aria-label="Select node"
          >
            {NODES.map((n) => (
              <option key={n.id} value={n.id}>
                {n.hostname}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Tabs defaultValue="lab" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-3 mt-3 h-auto w-[calc(100%-1.5rem)] flex-wrap justify-start gap-1">
          <TabsTrigger value="lab">labctl</TabsTrigger>
          <TabsTrigger value="node">Node</TabsTrigger>
          <TabsTrigger value="evpn">EVPN</TabsTrigger>
          <TabsTrigger value="svd">SVD</TabsTrigger>
          <TabsTrigger value="cli">CLI</TabsTrigger>
          <TabsTrigger value="trace">Trace</TabsTrigger>
        </TabsList>
        <div className="min-h-0 flex-1 overflow-y-auto p-3 terminal-scroll">
          <TabsContent value="lab">
            <LabTab />
          </TabsContent>
          <TabsContent value="node">
            <NodeTab />
          </TabsContent>
          <TabsContent value="evpn">
            <EvpnTab />
          </TabsContent>
          <TabsContent value="svd">
            <SvdTab />
          </TabsContent>
          <TabsContent value="cli">
            <CliTab key={selected} />
          </TabsContent>
          <TabsContent value="trace">
            <TraceTab />
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
}
