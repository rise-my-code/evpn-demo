export type NodeRole =
  | "isp"
  | "edge"
  | "vtep"
  | "vtep-rr"
  | "vtep-lite";

export type OsId =
  | "alpine"
  | "vyos13"
  | "arch"
  | "alma10"
  | "pios"
  | "ubuntu2404"
  | "ubuntu2604";

export type LinkKind = "physical" | "wifi" | "gre" | "vti" | "evpn";

export type Layer = "physical" | "underlay" | "overlay";

export type LabStatus = "down" | "bringing-up" | "up" | "tearing-down" | "degraded";

export type IfKind =
  | "wan"
  | "lan"
  | "wifi"
  | "gre"
  | "vti"
  | "loopback"
  | "svd"
  | "bridge"
  | "svi"
  | "vrf"
  | "veth";

export interface InterfaceSpec {
  name: string;
  kind: IfKind;
  addr?: string;
  peer?: string;
  mtu: number;
  vrf?: string;
  note?: string;
}

export interface Workload {
  name: string;
  tenant: string;
  ip: string;
  mac: string;
}

export interface FabricNode {
  id: string;
  hostname: string;
  label: string;
  role: NodeRole;
  os: OsId;
  osLabel: string;
  site: "home" | "wan" | "edge";
  asn: number;
  routerId: string;
  vtepIp?: string;
  routerMac?: string;
  isVtep: boolean;
  isRr: boolean;
  vxlan: boolean;
  location: string;
  summary: string;
  interfaces: InterfaceSpec[];
  workloads: Workload[];
  vnis: number[];
  x: number;
  y: number;
}

export interface FabricLink {
  id: string;
  a: string;
  b: string;
  kind: LinkKind;
  layer: Layer;
  label: string;
  subnet?: string;
  cost: number;
  mtu: number;
  note?: string;
}

export interface Tenant {
  id: string;
  name: string;
  vlan: number;
  l2vni: number;
  l3vni: number;
  prefix: string;
  gw: string;
  anycastMac: string;
  rd: string;
  rt: string;
  exposure: "private" | "public";
  description: string;
}

export interface PodmanNet {
  name: string;
  subnet: string;
  gateway: string;
  role: string;
}

export interface HostPodmanNet {
  node: string;
  tenant: string;
  subnet: string;
  gw: string;
  ce: string;
  exposure: "private" | "public";
}

export interface Stage {
  id: string;
  title: string;
  detail: string;
  layer: Layer | "host";
}

export type EvpnType = 2 | 3 | 5;

export interface EvpnRoute {
  type: EvpnType;
  rd: string;
  rt: string;
  vni: number;
  originator: string;
  nexthop: string;
  mac?: string;
  ip?: string;
  prefix?: string;
  etag: number;
  path: string;
  best: boolean;
}

export interface OspfNeighbor {
  node: string;
  peer: string;
  iface: string;
  state: "Full/DR" | "Full/BDR" | "Full/DROther" | "Down" | "Init" | "ExStart";
  dead: string;
}

export interface BgpNeighbor {
  node: string;
  peer: string;
  afi: "ipv4" | "l2vpn-evpn";
  state: "Established" | "Idle" | "Active" | "Connect";
  prefixes: number;
  rrClient: boolean;
}

export interface MacEntry {
  node: string;
  vni: number;
  mac: string;
  ip?: string;
  type: "local" | "remote";
  nh?: string;
}

export interface SvdState {
  node: string;
  device: string;
  flags: string[];
  local: string;
  dstport: number;
  vnis: number[];
  vlanTunnel: boolean;
  neighSuppress: boolean;
  learning: boolean;
}

export interface TraceHop {
  title: string;
  node: string;
  layer: string;
  packet: string;
  note: string;
}

export interface LabEvent {
  t: number;
  level: "info" | "ok" | "warn" | "err";
  node?: string;
  message: string;
}

export type FailureId =
  | "wifi-flap"
  | "vti-east-down"
  | "pi5-frr-dead"
  | "rr-svd-down"
  | "wan-partition";
