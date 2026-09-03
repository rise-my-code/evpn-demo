import { cn } from "@/lib/utils";

function Card({
  title,
  sub,
  ip,
  note,
  accent,
}: {
  title: string;
  sub: string;
  ip?: string;
  note?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-md border px-4 py-3 text-center",
        accent ? "border-accent/40 bg-surface-2" : "border-border bg-surface",
      )}
    >
      <p className="font-medium text-fg">{title}</p>
      <p className="text-sm text-muted">{sub}</p>
      {ip ? <p className="mt-1 font-mono text-xs text-faint">{ip}</p> : null}
      {note ? <p className="mt-1 text-xs text-faint">{note}</p> : null}
    </div>
  );
}

function Spine({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center py-2" aria-hidden="true">
      <div className="h-5 w-px bg-border" />
      <p className="py-1 font-mono text-xs text-muted">{label}</p>
      <div className="h-5 w-px bg-border" />
    </div>
  );
}

export function PhysicalDiagram() {
  return (
    <div className="rounded-lg border border-border bg-bg p-4 sm:p-6">
      <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted">Physical</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Card title="VPS east" sub="Ubuntu 24.04" ip="203.0.113.11" />
        <Card title="VPS core" sub="Ubuntu 26.04 · WAN Caddy" ip="203.0.113.13" />
        <Card title="VPS west" sub="Ubuntu 24.04" ip="203.0.113.12" />
      </div>
      <Spine label="WAN · IPsec" />
      <div className="mx-auto max-w-sm">
        <Card title="ISP modem" sub="Alpine · nftables NAT" ip="10.0.0.1 / 203.0.113.2" note="Only the router sits on the modem LAN" />
      </div>
      <Spine label="modem LAN 10.0.0.0/24" />
      <div className="mx-auto max-w-sm">
        <Card
          title="ER4"
          sub="VyOS 1.3 image · EdgeOS 3.0.1 personality"
          ip="10.0.0.2 · 192.168.100.1"
          note="set / commit. GRE tun0-2, IPsec VTI. No VXLAN."
          accent
        />
      </div>
      <Spine label="lab home LAN 192.168.100.0/24 · GRE endpoints only" />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Card title="Arch miniPC" sub="Arch · systemd-networkd" ip="192.168.100.10" note="Podman host + EVPN RR" />
        <Card title="Pi 5" sub="AlmaLinux 10" ip="192.168.100.20" />
        <Card title="Pi Zero 2" sub="Pi OS · Wi-Fi" ip="192.168.100.30" />
      </div>
    </div>
  );
}

export function UnderlayDiagram() {
  const rows = [
    ["er4 tun0", "arch-minipc gre0", "10.255.0.0/30", "192.168.100.1 ↔ .10"],
    ["er4 tun1", "pi5-alma gre0", "10.255.0.4/30", "192.168.100.1 ↔ .20"],
    ["er4 tun2", "pizero2 gre0", "10.255.0.8/30", "192.168.100.1 ↔ .30 · Wi-Fi"],
    ["er4 vti0", "vps-east vti0", "10.255.1.0/30", "10.0.0.2 ↔ 203.0.113.11"],
    ["er4 vti1", "vps-west vti0", "10.255.1.4/30", "10.0.0.2 ↔ 203.0.113.12"],
    ["er4 vti2", "vps-core vti0", "10.255.1.8/30", "10.0.0.2 ↔ 203.0.113.13"],
  ];
  return (
    <div className="rounded-lg border border-border bg-bg p-4 sm:p-6">
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">Underlay</p>
      <p className="mb-4 max-w-prose text-sm text-muted">
        ER4 is the hub. OSPF area 0 on GRE and VTI only. Loopbacks in 10.254.0.0/24 are
        VTEP IPs. Home LAN never carries EVPN.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="py-2 pr-3 font-medium">ER4</th>
              <th className="py-2 pr-3 font-medium">Remote</th>
              <th className="py-2 pr-3 font-medium">Tunnel net</th>
              <th className="py-2 font-medium">Endpoints</th>
            </tr>
          </thead>
          <tbody className="font-mono text-xs text-fg">
            {rows.map((r) => (
              <tr key={r[2]} className="border-b border-border/60">
                {r.map((c) => (
                  <td key={c} className="py-2 pr-3 align-top">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function OverlayDiagram() {
  return (
    <div className="rounded-lg border border-border bg-bg p-4 sm:p-6">
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">Overlay · BGP-EVPN</p>
      <p className="mb-4 max-w-prose text-sm text-muted">
        iBGP AS 64512. Arch is route-reflector. ER4 is not a VTEP. Each VTEP has one SVD
        <span className="font-mono text-fg"> vxlan0</span> (external + vnifilter).
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Card title="arch-minipc" sub="RR + internal Caddy" ip="10.254.0.10" note="private VNIs" accent />
        <Card title="pi5-alma" sub="VTEP" ip="10.254.0.20" note="priv + pub" />
        <Card title="pizero2" sub="VTEP-lite" ip="10.254.0.30" note="iot private only" />
        <Card title="vps-east" sub="VTEP" ip="10.254.0.11" note="svc lab pub" />
        <Card title="vps-west" sub="VTEP" ip="10.254.0.12" note="svc + pub" />
        <Card title="vps-core" sub="VTEP + WAN Caddy" ip="10.254.0.13" note="public RT 64512:40" />
      </div>
      <p className="mt-4 text-center text-sm text-faint">ER4 stays on the underlay. No vxlan0.</p>
    </div>
  );
}
