import type {
  BgpNeighbor,
  EvpnRoute,
  FailureId,
  MacEntry,
  OspfNeighbor,
  SvdState,
  TraceHop,
} from "./types";
import { LINKS, NODE_BY_ID, NODES, TENANTS, vteps } from "./topology";

export interface Plane {
  ospf: OspfNeighbor[];
  bgp: BgpNeighbor[];
  evpn: EvpnRoute[];
  mac: MacEntry[];
  svd: SvdState[];
  reach: Record<string, string[]>;
}

function underlayUp(failures: Set<FailureId>): Set<string> {
  const down = new Set<string>();
  if (failures.has("wifi-flap")) down.add("gre-zero");
  if (failures.has("vti-east-down")) down.add("vti-east");
  if (failures.has("wan-partition")) {
    down.add("vti-east");
    down.add("vti-west");
    down.add("vti-core");
  }
  return new Set(LINKS.filter((l) => l.layer === "underlay" && !down.has(l.id)).map((l) => l.id));
}

function nodeAlive(id: string, failures: Set<FailureId>): boolean {
  if (id === "pi5" && failures.has("pi5-frr-dead")) return false;
  if (id === "arch" && failures.has("rr-svd-down")) return true;
  return true;
}

function neighborsOf(id: string, upLinks: Set<string>): string[] {
  return LINKS.filter(
    (l) => l.layer === "underlay" && upLinks.has(l.id) && (l.a === id || l.b === id),
  ).map((l) => (l.a === id ? l.b : l.a));
}

/** ER4 is the underlay hub. Reachability is hub-and-spoke via ER4. */
function reachableFrom(src: string, upLinks: Set<string>, failures: Set<FailureId>): string[] {
  if (!nodeAlive(src, failures)) return [];
  const seen = new Set<string>([src]);
  const q = [src];
  while (q.length) {
    const cur = q.shift()!;
    for (const n of neighborsOf(cur, upLinks)) {
      if (seen.has(n)) continue;
      if (n !== "er4" && !nodeAlive(n, failures)) continue;
      seen.add(n);
      q.push(n);
    }
  }
  return [...seen];
}

export function computePlane(failures: Set<FailureId>, stage: number): Plane {
  const underlayReady = stage >= 6;
  const svdReady = stage >= 8;
  const overlayReady = stage >= 9;
  const upLinks = underlayUp(failures);
  const ospf: OspfNeighbor[] = [];
  const underlayLinks = LINKS.filter((l) => l.layer === "underlay");

  for (const l of underlayLinks) {
    const up = underlayReady && upLinks.has(l.id);
    const aAlive = nodeAlive(l.a, failures) || l.a === "er4";
    const bAlive = nodeAlive(l.b, failures) || l.b === "er4";
    const state = up && aAlive && bAlive ? "Full/DROther" : "Down";
    const ifaceA = NODE_BY_ID[l.a].interfaces.find((i) => i.kind === l.kind)?.name ?? l.label;
    const ifaceB = NODE_BY_ID[l.b].interfaces.find((i) => i.kind === l.kind)?.name ?? l.label;
    ospf.push({
      node: l.a,
      peer: NODE_BY_ID[l.b].routerId,
      iface: ifaceA,
      state,
      dead: up ? "00:00:37" : "00:00:00",
    });
    ospf.push({
      node: l.b,
      peer: NODE_BY_ID[l.a].routerId,
      iface: ifaceB,
      state,
      dead: up ? "00:00:37" : "00:00:00",
    });
  }

  const reach: Record<string, string[]> = {};
  if (underlayReady) {
    for (const n of NODES) reach[n.id] = reachableFrom(n.id, upLinks, failures);
  } else {
    for (const n of NODES) reach[n.id] = [n.id];
  }

  const rr = NODE_BY_ID.arch;
  const bgp: BgpNeighbor[] = [];
  const evpn: EvpnRoute[] = [];
  const mac: MacEntry[] = [];
  const svd: SvdState[] = [];

  const overlayOn = overlayReady && !failures.has("rr-svd-down");

  for (const n of vteps()) {
    const canReachRr = reach[n.id]?.includes("arch") ?? false;
    const frrAlive = nodeAlive(n.id, failures);
    const est = overlayOn && frrAlive && canReachRr && n.id !== "arch";
    const selfEst = overlayOn && frrAlive && n.id === "arch";

    if (stage >= 9) {
      if (n.id !== "arch") {
        bgp.push({
          node: n.id,
          peer: rr.routerId,
          afi: "l2vpn-evpn",
          state: est ? "Established" : frrAlive ? "Active" : "Idle",
          prefixes: 0,
          rrClient: false,
        });
        bgp.push({
          node: "arch",
          peer: n.routerId,
          afi: "l2vpn-evpn",
          state: est ? "Established" : "Idle",
          prefixes: 0,
          rrClient: true,
        });
      } else {
        bgp.push({
          node: "arch",
          peer: "0.0.0.0",
          afi: "l2vpn-evpn",
          state: selfEst ? "Established" : "Idle",
          prefixes: 0,
          rrClient: false,
        });
      }
    }

    if (svdReady) {
      svd.push({
        node: n.id,
        device: "vxlan0",
        flags: n.os === "arch" ? ["external", "vnifilter", "nolearning", "networkd"] : ["external", "vnifilter", "nolearning"],
        local: n.vtepIp ?? n.routerId,
        dstport: 4789,
        vnis: frrAlive && !(n.id === "arch" && failures.has("rr-svd-down")) ? n.vnis : [],
        vlanTunnel: true,
        neighSuppress: true,
        learning: false,
      });
    }
  }

  if (overlayOn) {
    const activeVteps = vteps().filter(
      (n) => nodeAlive(n.id, failures) && (reach[n.id]?.includes("arch") ?? false),
    );

    for (const n of activeVteps) {
      for (const tenant of TENANTS) {
        if (!n.vnis.includes(tenant.l2vni)) continue;
        evpn.push({
          type: 3,
          rd: tenant.rd,
          rt: tenant.rt,
          vni: tenant.l2vni,
          originator: n.id,
          nexthop: n.vtepIp!,
          etag: 0,
          path: `i ${n.vtepIp}`,
          best: true,
        });
        evpn.push({
          type: 2,
          rd: tenant.rd,
          rt: tenant.rt,
          vni: tenant.l2vni,
          originator: n.id,
          nexthop: n.vtepIp!,
          mac: n.routerMac,
          ip: tenant.gw,
          etag: 0,
          path: `i ${n.vtepIp}`,
          best: true,
        });
        if (n.vnis.includes(tenant.l3vni)) {
          evpn.push({
            type: 5,
            rd: tenant.rd,
            rt: tenant.rt,
            vni: tenant.l3vni,
            originator: n.id,
            nexthop: n.vtepIp!,
            prefix: tenant.prefix,
            mac: n.routerMac,
            etag: 0,
            path: `i ${n.vtepIp}`,
            best: true,
          });
        }
      }
      for (const wl of n.workloads) {
        const tenant = TENANTS.find((t) => t.id === wl.tenant)!;
        evpn.push({
          type: 2,
          rd: tenant.rd,
          rt: tenant.rt,
          vni: tenant.l2vni,
          originator: n.id,
          nexthop: n.vtepIp!,
          mac: wl.mac,
          ip: wl.ip,
          etag: 0,
          path: `i ${n.vtepIp}`,
          best: true,
        });
        mac.push({
          node: n.id,
          vni: tenant.l2vni,
          mac: wl.mac,
          ip: wl.ip,
          type: "local",
        });
      }
    }

    for (const m of [...mac]) {
      for (const n of activeVteps) {
        if (n.id === m.node) continue;
        if (!n.vnis.includes(m.vni)) continue;
        const src = NODE_BY_ID[m.node];
        mac.push({
          node: n.id,
          vni: m.vni,
          mac: m.mac,
          ip: m.ip,
          type: "remote",
          nh: src.vtepIp,
        });
      }
    }
  }

  const prefixCount = (nodeId: string) =>
    evpn.filter((r) => r.originator !== nodeId || true).length;

  for (const b of bgp) {
    if (b.state === "Established") b.prefixes = prefixCount(b.node);
  }

  return { ospf, bgp, evpn, mac, svd, reach };
}

export function packetTrace(
  srcWl: string,
  dstWl: string,
  plane: Plane,
  failures: Set<FailureId>,
): TraceHop[] {
  const src = findWl(srcWl);
  const dst = findWl(dstWl);
  if (!src || !dst) return [{ title: "No such CE", node: "—", layer: "—", packet: "—", note: "Unknown endpoint." }];

  const hops: TraceHop[] = [];
  const srcNode = NODE_BY_ID[src.nodeId];
  const dstNode = NODE_BY_ID[dst.nodeId];
  const tenant = TENANTS.find((t) => t.id === src.wl.tenant)!;

  hops.push({
    title: "CE ingress",
    node: srcNode.hostname,
    layer: `VLAN ${tenant.vlan} / ${tenant.name}`,
    packet: `eth src ${src.wl.mac} dst ${tenant.anycastMac}  |  ${src.wl.ip} → ${dst.wl.ip}`,
    note: "Workload in the tenant bridge domain hits the anycast IRB MAC.",
  });

  if (failures.has("rr-svd-down")) {
    hops.push({
      title: "Overlay down",
      node: "arch-minipc",
      layer: "EVPN",
      packet: "no Type-2 / Type-5",
      note: "RR SVD is down. MAC-VRF empty. Packet blackholes at the local VTEP.",
    });
    return hops;
  }

  const sameL2 = src.wl.tenant === dst.wl.tenant;
  const l2vni = tenant.l2vni;
  const l3vni = tenant.l3vni;
  const vni = sameL2 ? l2vni : l3vni;
  const remoteMac = plane.mac.find(
    (m) => m.node === src.nodeId && m.ip === dst.wl.ip && m.type === "remote",
  );

  hops.push({
    title: "SVD lookup",
    node: srcNode.hostname,
    layer: "vxlan0 external vnifilter",
    packet: remoteMac
      ? `FDB ${dst.wl.mac} → VTEP ${dstNode.vtepIp}  VNI ${vni}`
      : `IRB route ${dst.wl.ip}/32 via Type-5  VNI ${l3vni} nh ${dstNode.vtepIp}`,
    note: "Learning is off. FDB and routes come from BGP EVPN, not from flooding.",
  });

  hops.push({
    title: "VXLAN encapsulate",
    node: srcNode.hostname,
    layer: "UDP/4789",
    packet: `outer ${srcNode.vtepIp} → ${dstNode.vtepIp}  VNI ${vni}  inner ${src.wl.ip} → ${dst.wl.ip}`,
    note: "Single VXLAN Device — one UDP socket, VNI in the header. No per-VNI netdev.",
  });

  const viaHome = srcNode.site === "home" || dstNode.site === "home";
  const srcUnder = srcNode.site === "home" ? "GRE" : "IPsec VTI";
  hops.push({
    title: `Underlay ${srcUnder}`,
    node: srcNode.hostname,
    layer: "OSPF",
    packet: `${srcNode.vtepIp}/32 via ${srcUnder} → 10.254.0.1 (er4)`,
    note: "Loopback is the only EVPN next-hop. Home LAN is not in the RIB.",
  });

  hops.push({
    title: "ER4 forward",
    node: "er4",
    layer: "IPv4 unicast · no VXLAN",
    packet: `route ${dstNode.vtepIp}/32  →  ${dstNode.site === "wan" ? "vti*" : "gre*"}`,
    note: "EdgeOS 3.0.1 / VyOS 1.3 forwards the outer IP. It cannot see VNI, MAC, or tenant.",
    });

  if (viaHome && dstNode.id === "zero" && failures.has("wifi-flap")) {
    hops.push({
      title: "Wi-Fi down",
      node: "pizero2",
      layer: "gre2",
      packet: "OSPF neighbor Down",
      note: "Pi Zero 2 radio flap. Type-5 withdraws. IoT CEs on that node are unreachable.",
    });
    return hops;
  }

  if (dstNode.id === "east" && (failures.has("vti-east-down") || failures.has("wan-partition"))) {
    hops.push({
      title: "VTI down",
      node: "er4",
      layer: "vti0",
      packet: "no route to 10.254.0.11",
      note: "IPsec SA is down. Outer VTEP IP is unreachable. Overlay next-hop goes invalid.",
    });
    return hops;
  }

  hops.push({
    title: "Remote SVD decap",
    node: dstNode.hostname,
    layer: `VNI ${vni} → VLAN ${tenant.vlan}`,
    packet: `inner dest ${dst.wl.mac} ${dst.wl.ip}`,
    note: "vnifilter admits the VNI. vlan_tunnel maps it onto the tenant bridge.",
  });

  hops.push({
    title: "CE egress",
    node: dstNode.hostname,
    layer: tenant.name,
    packet: `${src.wl.ip} → ${dst.wl.ip}  64 bytes ICMP echo`,
    note: "ARP was suppressed (neigh_suppress). Reply follows the symmetric path.",
  });

  return hops;
}

function findWl(key: string): { nodeId: string; wl: { name: string; tenant: string; ip: string; mac: string } } | null {
  for (const n of NODES) {
    for (const wl of n.workloads) {
      if (`${n.id}:${wl.name}` === key || wl.ip === key) return { nodeId: n.id, wl };
    }
  }
  return null;
}

export function allWorkloads(): { key: string; label: string; ip: string; node: string; tenant: string }[] {
  const rows = [];
  for (const n of NODES) {
    for (const wl of n.workloads) {
      rows.push({
        key: `${n.id}:${wl.name}`,
        label: `${n.hostname} ${wl.name}`,
        ip: wl.ip,
        node: n.id,
        tenant: wl.tenant,
      });
    }
  }
  return rows;
}
