import type { Plane } from "./control-plane";
import { frrConfig, svdBootstrap, vyosConfig, edgeOsConfig } from "./configs";
import { formatNetworkctl, formatNetworkdUnits } from "./networkd";
import { NODE_BY_ID, NODES, TENANTS } from "./topology";
import type { FabricNode } from "./types";

function header(node: FabricNode, cmd: string): string {
  return `${node.hostname}# ${cmd}\n`;
}

function evpnTable(plane: Plane, node: FabricNode): string {
  const routes = plane.evpn.filter((r) => {
    if (!node.isVtep) return false;
    return node.vnis.includes(r.vni) || r.originator === node.id;
  });
  if (!node.isVtep) {
    return `% Unknown command: l2vpn evpn  (this box has no VXLAN dataplane)\n`;
  }
  const lines = [
    `BGP table version is ${routes.length}, local router ID is ${node.routerId}`,
    `Status codes: * valid, > best, i - internal`,
    `Route Distinguisher, Type, Path`,
    ``,
  ];
  for (const r of routes) {
    const nlri =
      r.type === 2
        ? `[2]:[0]:[48]:[${r.mac}]:[32]:[${r.ip ?? "0.0.0.0"}]`
        : r.type === 3
          ? `[3]:[0]:[${r.nexthop}]`
          : `[5]:[0]:[24]:[${r.prefix}]`;
    lines.push(`RD ${r.rd}  RT ${r.rt}  VNI ${r.vni}`);
    lines.push(`${r.best ? "*>" : "*"}[${r.type}]:${nlri}`);
    lines.push(`    NH ${r.nexthop}  ${r.path}  originator ${NODE_BY_ID[r.originator].hostname}`);
  }
  lines.push(``);
  lines.push(`Displayed ${routes.length} EVPN routes`);
  return lines.join("\n") + "\n";
}

export function runCli(nodeId: string, raw: string, plane: Plane, stage = -1): string {
  const node = NODE_BY_ID[nodeId];
  if (!node) return `% unknown node\n`;
  const cmd = raw.trim().replace(/\s+/g, " ");
  if (!cmd) return "";
  const out = header(node, cmd);

  if (cmd === "help" || cmd === "?") {
    return (
      out +
      [
        "show version",
        "show interface [brief]",
        "show ip ospf neighbor",
        "show ip bgp summary",
        "show bgp l2vpn evpn",
        "show evpn vni",
        "show evpn mac vni all",
        "show ip route",
        "show running-config",
        "show svd",
        "show networkd          (arch-minipc)",
        "show vpn ipsec sa     (er4)",
        "ping <ce-ip>",
        "",
      ].join("\n") +
      "\n"
    );
  }

  if (cmd === "show version") {
    if (node.os === "vyos13") {
      return (
        out +
        `Version:      VyOS 1.3.8 (Equuleus)  ·  EdgeOS 3.0.1 personality\n` +
        `Copyright:    lab image — BGP/OSPF/GRE/VTI, VXLAN explicitly disabled\n` +
        `Boot image:   rootless podman systemd  (er4)\n`
      );
    }
    return (
      out +
      `FRRouting 10.4 (lab) on ${node.osLabel}\n` +
      `hostname ${node.hostname}  RID ${node.routerId}\n` +
      (node.os === "arch"
        ? `dataplane: systemd-networkd  vxlan0 External=yes VNIFilter=yes\n`
        : `SVD: ${node.vxlan ? "vxlan0 external vnifilter" : "not a VTEP"}\n`)
    );
  }

  if (cmd === "show interface" || cmd === "show interface brief" || cmd === "show interfaces") {
    const rows = node.interfaces
      .map((i) => `${i.name.padEnd(10)} ${i.kind.padEnd(9)} ${(i.addr ?? "unnumbered").padEnd(18)} mtu ${i.mtu}${i.note ? "  " + i.note : ""}`)
      .join("\n");
    return out + rows + "\n";
  }

  if (cmd === "show ip ospf neighbor" || cmd === "show ip ospf nei") {
    const rows = plane.ospf
      .filter((o) => o.node === node.id)
      .map(
        (o) =>
          `${o.peer.padEnd(16)}  ${o.state.padEnd(14)}  ${o.iface.padEnd(8)}  dead ${o.dead}`,
      );
    if (!rows.length) return out + `% OSPF is not running\n`;
    return out + "Neighbor ID       State           Iface     Dead Time\n" + rows.join("\n") + "\n";
  }

  if (cmd === "show ip bgp summary" || cmd === "show bgp summary") {
    const rows = plane.bgp.filter((b) => b.node === node.id && b.peer !== "0.0.0.0");
    if (node.role === "edge") {
      return (
        out +
        `BGP router identifier ${node.routerId}, local AS number 64512\n` +
        `IPv4 Unicast: no external peers in this lab (underlay is OSPF)\n` +
        `L2VPN EVPN: not supported on this image (EdgeOS 3.0.1 / VyOS 1.3)\n`
      );
    }
    const body = rows
      .map(
        (b) =>
          `${b.peer.padEnd(16)}  ${b.afi.padEnd(12)}  ${b.state.padEnd(13)}  pfx ${String(b.prefixes).padStart(4)}${b.rrClient ? "  RR-client" : ""}`,
      )
      .join("\n");
    return (
      out +
      `BGP router identifier ${node.routerId}, local AS number 64512\n` +
      `Neighbor          AFI          State          Pfx\n` +
      (body || "% no neighbors") +
      "\n"
    );
  }

  if (cmd === "show bgp l2vpn evpn" || cmd === "show bgp evpn" || cmd === "show evpn route") {
    return out + evpnTable(plane, node);
  }

  if (cmd === "show evpn vni" || cmd === "show evpn vni all") {
    if (!node.isVtep) return out + `% Unknown command\n`;
    const svd = plane.svd.find((s) => s.node === node.id);
    const lines = TENANTS.filter((t) => node.vnis.includes(t.l2vni)).map((t) => {
      const on = svd?.vnis.includes(t.l2vni);
      return `VNI ${t.l2vni}  type L2  tenant ${t.name}  RD ${t.rd}  RT ${t.rt}  ${on ? "up" : "down"}\nVNI ${t.l3vni}  type L3  vrf-${t.name}  SVI ${t.name}irb  gw ${t.gw}`;
    });
    return out + (lines.join("\n") || "% no VNIs") + "\n";
  }

  if (cmd === "show evpn mac vni all" || cmd === "show evpn mac") {
    if (!node.isVtep) return out + `% Unknown command\n`;
    const rows = plane.mac
      .filter((m) => m.node === node.id)
      .map((m) => `${m.mac}  ${ (m.ip ?? "").padEnd(15)}  VNI ${m.vni}  ${m.type}${m.nh ? "  nh " + m.nh : "  local"}`);
    return out + "MAC                IP               VNI    Type\n" + (rows.join("\n") || "% empty") + "\n";
  }

  if (cmd === "show svd" || cmd === "show vxlan") {
    if (!node.isVtep) {
      return out + `% No VXLAN device. EdgeOS 3.0.1 kernel has no SVD/VXLAN dataplane.\n`;
    }
    const s = plane.svd.find((x) => x.node === node.id);
    if (!s) return out + "% vxlan0 missing (networkd/iproute2 SVD not applied yet)\n";
    const origin = node.os === "arch" ? "systemd-networkd 50-vxlan0.netdev External=yes VNIFilter=yes" : "ip link add type vxlan external vnifilter";
    return (
      out +
      `11: vxlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1350\n` +
      `    vxlan id 0 local ${s.local} dstport ${s.dstport} ${s.flags.join(" ")}\n` +
      `    vlan_tunnel ${s.vlanTunnel ? "on" : "off"}  neigh_suppress ${s.neighSuppress ? "on" : "off"}  learning ${s.learning ? "on" : "off"}\n` +
      `    vnifilter: ${s.vnis.join(", ") || "(none)"}\n` +
      `    created-by: ${origin}\n`
    );
  }

  if (
    cmd === "show networkd" ||
    cmd === "show systemd-networkd" ||
    cmd === "networkctl" ||
    cmd === "networkctl status" ||
    cmd === "show networkctl"
  ) {
    if (node.os !== "arch") {
      return out + `% systemd-networkd is not used on this node. Dataplane is iproute2 SVD bootstrap.\n`;
    }
    return out + formatNetworkctl(node, stage) + "\n# units\n" + formatNetworkdUnits();
  }

  if (cmd === "show ip route" || cmd === "show ip route ospf") {
    const reach = plane.reach[node.id] ?? [];
    const rows = reach
      .filter((id) => id !== node.id)
      .map((id) => {
        const n = NODE_BY_ID[id];
        const via = n.role === "edge" || node.role === "edge" ? "directly attached tunnel" : `via 10.254.0.1 er4`;
        return `O  ${n.routerId}/32 [${node.site === "wan" ? "110/21" : "110/11"}] ${via}`;
      });
    return out + `Codes: O - OSPF, C - connected\nC  ${node.routerId}/32 is directly connected, lo\n` + rows.join("\n") + "\n";
  }

  if (cmd === "show vpn ipsec sa" || cmd === "show vpn ipsec") {
    if (node.id !== "er4" && node.site !== "wan") return out + `% Unknown command\n`;
    const vtis = plane.ospf.filter((o) => o.node === node.id && o.iface.startsWith("vti"));
    const body = vtis
      .map((o) => `${o.iface}  peer ${o.peer}  IKEv2 AES-256-GCM  ${o.state === "Down" ? "SA down" : "ESTABLISHED"}`)
      .join("\n");
    return out + (body || "% no SAs") + "\n";
  }

  if (cmd === "show running-config" || cmd === "show run" || cmd === "show configuration") {
    if (node.id === "er4") return out + vyosConfig() + "\n! --- EdgeOS equivalent ---\n" + edgeOsConfig();
    if (node.os === "arch") {
      return out + frrConfig(node) + "\n# --- systemd-networkd (owns lo, gre0, br0, vxlan0, VRF, IRB) ---\n" + formatNetworkdUnits();
    }
    if (node.isVtep) return out + frrConfig(node) + "\n! SVD bootstrap\n" + svdBootstrap(node);
    return out + frrConfig(node);
  }

  if (cmd.startsWith("ping ")) {
    const target = cmd.slice(5).trim();
    const hit = NODES.flatMap((n) => n.workloads.map((w) => ({ n, w }))).find(
      (x) => x.w.ip === target || x.n.routerId === target,
    );
    if (!hit) return out + `ping: ${target}: Name or service not known\n`;
    const ok = (plane.reach[node.id] ?? []).includes(hit.n.id) || hit.n.id === node.id;
    if (!ok) return out + `PING ${target}: 100% packet loss\n`;
    return (
      out +
      `PING ${target} (${target}) 56(84) bytes of data.\n` +
      `64 bytes from ${target}: icmp_seq=1 ttl=64 time=1.${(hit.n.site === "wan" ? 8 : 2)} ms\n` +
      `--- ${target} ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss\n`
    );
  }

  return out + `% Unknown command: ${cmd}\n`;
}

export const CLI_EXAMPLES = [
  "show ip ospf neighbor",
  "show bgp l2vpn evpn",
  "show evpn mac vni all",
  "show svd",
  "show networkd",
  "show running-config",
];
