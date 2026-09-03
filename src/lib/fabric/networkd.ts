import { TENANTS } from "./topology";
import type { FabricNode } from "./types";

export interface NetworkdUnit {
  path: string;
  body: string;
}

/** systemd-networkd units for the Arch VTEP. SVD flags External=/VNIFilter= need systemd 258+. */
export function archNetworkdUnits(): NetworkdUnit[] {
  const vrfs: NetworkdUnit[] = TENANTS.flatMap((t, i) => [
    {
      path: `/etc/systemd/network/40-vrf-${t.name}.netdev`,
      body: `[NetDev]
Name=vrf-${t.name}
Kind=vrf

[VRF]
TableId=${1100 + i}
`,
    },
    {
      path: `/etc/systemd/network/40-vrf-${t.name}.network`,
      body: `[Match]
Name=vrf-${t.name}

[Network]
ConfigureWithoutCarrier=yes
IPv6AcceptRA=no
LinkLocalAddressing=no
`,
    },
  ]);

  const irbNetdev: NetworkdUnit[] = TENANTS.map((t) => ({
    path: `/etc/systemd/network/60-${t.name}-irb.netdev`,
    body: `[NetDev]
Name=${t.name}-irb
Kind=vlan

[VLAN]
Id=${t.vlan}
`,
  }));

  const irbNetwork: NetworkdUnit[] = TENANTS.map((t) => ({
    path: `/etc/systemd/network/60-${t.name}-irb.network`,
    body: `[Match]
Name=${t.name}-irb

[Network]
VRF=vrf-${t.name}
Address=${t.gw}/24
ConfigureWithoutCarrier=yes
IPv6AcceptRA=no
LinkLocalAddressing=no
`,
  }));

  const brVlans = TENANTS.map((t) => `VLAN=${t.name}-irb`).join("\n");
  const vxlanBridgeVlans = TENANTS.flatMap((t) => [
    `[BridgeVLAN]\nVLAN=${t.vlan}`,
    `[BridgeVLAN]\nVLAN=${t.vlan + 1000}`,
  ]).join("\n\n");

  return [
    {
      path: "/etc/systemd/networkd.conf.d/container.conf",
      body: `[Network]
ManageForeignRoutes=no
ManageForeignRoutingPolicyRules=no
`,
    },
    {
      path: "/etc/systemd/network/05-eth0.network",
      body: `[Match]
Name=eth0

[Link]
Unmanaged=yes
`,
    },
    {
      path: "/etc/systemd/network/10-lo.network",
      body: `[Match]
Name=lo

[Network]
KeepConfiguration=static
Address=10.254.0.10/32
`,
    },
    {
      path: "/etc/systemd/network/20-gre0.netdev",
      body: `[NetDev]
Name=gre0
Kind=gre
MTUBytes=1476

[Tunnel]
Independent=yes
Local=192.168.100.10
Remote=192.168.100.1
TTL=64
`,
    },
    {
      path: "/etc/systemd/network/20-gre0.network",
      body: `[Match]
Name=gre0

[Network]
Address=10.255.0.2/30
IPv4Forwarding=yes
ConfigureWithoutCarrier=yes
IPv6AcceptRA=no
LinkLocalAddressing=no
`,
    },
    {
      path: "/etc/systemd/network/30-br0.netdev",
      body: `[NetDev]
Name=br0
Kind=bridge

[Bridge]
VLANFiltering=yes
DefaultPVID=none
STP=no
`,
    },
    {
      path: "/etc/systemd/network/30-br0.network",
      body: `[Match]
Name=br0

[Network]
${brVlans}
ConfigureWithoutCarrier=yes
IPv6AcceptRA=no
LinkLocalAddressing=no
`,
    },
    {
      path: "/etc/systemd/network/50-vxlan0.netdev",
      body: `[NetDev]
Name=vxlan0
Kind=vxlan
MTUBytes=1350

[VXLAN]
External=yes
VNIFilter=yes
Independent=yes
DestinationPort=4789
Local=10.254.0.10
MacLearning=no
`,
    },
    {
      path: "/etc/systemd/network/50-vxlan0.network",
      body: `[Match]
Name=vxlan0

[Network]
Bridge=br0
ConfigureWithoutCarrier=yes
IPv6AcceptRA=no
LinkLocalAddressing=no

[Bridge]
VLANTunnel=yes
NeighborSuppression=yes
Learning=no

${vxlanBridgeVlans}
`,
    },
    ...vrfs,
    ...irbNetdev,
    ...irbNetwork,
    {
      path: "/usr/local/lib/svd-vni.sh",
      body: svdVniScript(),
    },
    {
      path: "/etc/systemd/system/svd-vni.service",
      body: `[Unit]
Description=SVD VLAN-to-VNI maps (networkd 258 has no tunnel_info)
After=systemd-networkd.service
Wants=systemd-networkd.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/local/lib/svd-vni.sh

[Install]
WantedBy=multi-user.target
`,
    },
  ];
}

function svdVniScript(): string {
  const lines = [
    "#!/usr/bin/env bash",
    "# VLAN↔VNI on the SVD. systemd-networkd creates vxlan0 (External+VNIFilter);",
    "# tunnel_info still needs iproute2.",
    "set -euo pipefail",
    "ip link set br0 up || true",
    "ip link set vxlan0 up || true",
  ];
  for (const t of TENANTS) {
    lines.push(
      `bridge vni add dev vxlan0 vni ${t.l2vni} || true`,
      `bridge vlan add dev vxlan0 vid ${t.vlan} || true`,
      `bridge vlan add dev vxlan0 vid ${t.vlan} tunnel_info id ${t.l2vni} || true`,
      `bridge vlan add dev br0 vid ${t.vlan} self || true`,
      `bridge vni add dev vxlan0 vni ${t.l3vni} || true`,
      `bridge vlan add dev vxlan0 vid ${t.vlan + 1000} || true`,
      `bridge vlan add dev vxlan0 vid ${t.vlan + 1000} tunnel_info id ${t.l3vni} || true`,
    );
  }
  return lines.join("\n") + "\n";
}

export function formatNetworkdUnits(): string {
  return archNetworkdUnits()
    .map((u) => `# ${u.path}\n${u.body.trimEnd()}\n`)
    .join("\n");
}

/** `networkctl` flavour for the Arch VTEP. stage: -1 idle, 5 GRE, 8 SVD. */
export function formatNetworkctl(node: FabricNode, stage: number): string {
  const gre = stage >= 5;
  const svd = stage >= 8;
  const row = (
    idx: number,
    name: string,
    type: string,
    oper: string,
    setup: string,
  ) => `${String(idx).padStart(3)} ${name.padEnd(10)} ${type.padEnd(10)} ${oper.padEnd(13)} ${setup}`;
  const lines = [
    "IDX LINK       TYPE       OPERATIONAL   SETUP",
    row(1, "lo", "loopback", gre ? "routable" : "carrier", "configured"),
    row(2, "eth0", "ether", "routable", "unmanaged"),
    row(3, "gre0", "gre", gre ? "routable" : "off", gre ? "configured" : "pending"),
    row(4, "br0", "bridge", svd ? "carrier" : "off", svd ? "configured" : "pending"),
    row(5, "vxlan0", "vxlan", svd ? "carrier" : "off", svd ? "configured" : "pending"),
  ];
  let i = 6;
  for (const t of TENANTS) {
    lines.push(row(i++, `vrf-${t.name}`, "vrf", svd ? "carrier" : "off", svd ? "configured" : "pending"));
  }
  for (const t of TENANTS) {
    lines.push(row(i++, `${t.name}-irb`, "vlan", svd ? "routable" : "off", svd ? "configured" : "pending"));
  }
  lines.push("");
  lines.push(gre ? `lo: 10.254.0.10/32  (KeepConfiguration=static)` : "lo: 127.0.0.1/8 only — waiting for 10-lo.network");
  lines.push("eth0: 192.168.100.10/24 unmanaged (lab veth)");
  if (gre) lines.push("gre0: 10.255.0.2/30 Independent=yes Local=192.168.100.10 Remote=192.168.100.1");
  if (svd) {
    lines.push("vxlan0: External=yes VNIFilter=yes Local=10.254.0.10 dstport 4789");
    lines.push("svd-vni.service: VLAN↔VNI tunnel_info (oneshot after networkd)");
  }
  void node;
  return lines.join("\n") + "\n";
}

export function bashInstallArchNetworkd(): string {
  const writes = archNetworkdUnits()
    .map((u) => {
      const mode = u.path.endsWith(".sh") ? " && podman exec arch-minipc chmod +x " + u.path : "";
      return `  podman exec arch-minipc mkdir -p "$(dirname '${u.path}')"\n  podman exec -i arch-minipc tee '${u.path}' >/dev/null <<'NETD'\n${u.body}NETD${mode}`;
    })
    .join("\n\n");
  return `arch_networkd_up() {
  echo "==> Arch systemd-networkd — GRE, SVD vxlan0 External=+VNIFilter=, VRFs, IRB"
${writes}
  podman exec arch-minipc systemctl mask systemd-networkd-wait-online.service >/dev/null 2>&1 || true
  podman exec arch-minipc systemctl enable --now systemd-networkd svd-vni.service >/dev/null 2>&1 || true
  podman exec arch-minipc systemctl restart systemd-networkd svd-vni.service >/dev/null 2>&1 || true
}
`;
}
