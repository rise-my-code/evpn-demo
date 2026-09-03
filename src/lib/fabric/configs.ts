import { ASN, NODE_BY_ID, TENANTS } from "./topology";
import type { FabricNode } from "./types";

export function frrDaemons(): string {
  return `zebra=yes
bgpd=yes
ospfd=yes
staticd=yes
bfdd=yes
vtysh_enable=yes
zebra_options="-A 127.0.0.1 -s 90000000"
bgpd_options="-A 127.0.0.1"
ospfd_options="-A 127.0.0.1"
staticd_options="-A 127.0.0.1"
bfdd_options="-A 127.0.0.1"
`;
}

function ospfBlock(node: FabricNode): string {
  const nets = node.interfaces
    .filter((i) => (i.kind === "gre" || i.kind === "vti") && i.addr)
    .map((i) => {
      const ip = i.addr!.split("/")[0];
      const parts = ip.split(".").map(Number);
      parts[3] = parts[3] - (parts[3] % 4);
      return ` network ${parts.join(".")}/30 area 0`;
    })
    .join("\n");
  return `router ospf
 ospf router-id ${node.routerId}
 network ${node.routerId}/32 area 0
${nets}
 passive-interface lo
exit`;
}

function tunnelIfaces(node: FabricNode): string {
  return node.interfaces
    .filter((i) => i.kind === "gre" || i.kind === "vti")
    .map((i) =>
      node.os === "arch"
        ? `interface ${i.name}
 ! address from systemd-networkd
 ip ospf network point-to-point
 ip ospf bfd
exit`
        : `interface ${i.name}
 ip address ${i.addr}
 ip ospf network point-to-point
 ip ospf bfd
exit`,
    )
    .join("\n");
}

export function svdBootstrap(node: FabricNode): string {
  if (!node.isVtep || !node.vtepIp) return "# not a VTEP\n";
  const vrfs = TENANTS.filter((t) => node.vnis.includes(t.l3vni))
    .map(
      (t, i) => `ip link add vrf-${t.name} type vrf table ${1100 + i}
ip link set vrf-${t.name} up`,
    )
    .join("\n");
  const vniBlocks = TENANTS.filter((t) => node.vnis.includes(t.l2vni))
    .map(
      (t) => `# tenant ${t.name}  L2VNI ${t.l2vni}  L3VNI ${t.l3vni}  VLAN ${t.vlan}
bridge vni add dev vxlan0 vni ${t.l2vni}
bridge vlan add dev vxlan0 vid ${t.vlan}
bridge vlan add dev vxlan0 vid ${t.vlan} tunnel_info id ${t.l2vni}
bridge vlan add dev br0 vid ${t.vlan} self
ip link add ${t.name}irb link br0 type vlan id ${t.vlan}
ip addr add ${t.gw}/24 dev ${t.name}irb
ip link set ${t.name}irb master vrf-${t.name}
ip link set ${t.name}irb up
bridge vni add dev vxlan0 vni ${t.l3vni}
bridge vlan add dev vxlan0 vid ${t.vlan + 1000}
bridge vlan add dev vxlan0 vid ${t.vlan + 1000} tunnel_info id ${t.l3vni}`,
    )
    .join("\n");
  const mtu = node.interfaces.find((i) => i.kind === "svd")?.mtu ?? 1350;
  return `#!/usr/bin/env bash
# SVD (Single VXLAN Device) dataplane for ${node.hostname}
set -euo pipefail
sysctl -w net.ipv4.ip_forward=1
sysctl -w net.ipv6.conf.all.forwarding=1
ip addr replace ${node.vtepIp}/32 dev lo
ip link set lo up

ip link add br0 type bridge vlan_filtering 1 vlan_default_pvid 0
ip link add vxlan0 type vxlan dstport 4789 local ${node.vtepIp} nolearning external vnifilter
ip link set vxlan0 master br0
bridge link set dev vxlan0 vlan_tunnel on neigh_suppress on learning off
ip link set br0 up
ip link set vxlan0 up
ip link set vxlan0 mtu ${mtu}
${vrfs}
${vniBlocks}
`;
}

export function frrConfig(node: FabricNode): string {
  if (node.role === "isp") return "# isp has no FRR\n";
  if (node.role === "edge") {
    return `! ${node.hostname} — EdgeOS 3.0.1 / VyOS 1.3 personality
! BGP + OSPF only. NO address-family l2vpn evpn. NO VXLAN.
frr version 8.5
frr defaults traditional
hostname ${node.hostname}
log syslog informational
service integrated-vtysh-config
!
interface lo
 ip address ${node.routerId}/32
exit
${tunnelIfaces(node)}
!
${ospfBlock(node)}
!
router bgp ${ASN}
 bgp router-id ${node.routerId}
 no bgp ebgp-requires-policy
 address-family ipv4 unicast
  network ${node.routerId}/32
 exit-address-family
exit
!
line vty
exit
`;
  }

  const vrfBlocks = TENANTS.filter((t) => node.vnis.includes(t.l3vni))
    .map(
      (t) => `vrf vrf-${t.name}
 vni ${t.l3vni}
exit-vrf`,
    )
    .join("\n");

  const vrfBgp = TENANTS.filter((t) => node.vnis.includes(t.l3vni))
    .map(
      (t) => `router bgp ${ASN} vrf vrf-${t.name}
 address-family ipv4 unicast
  redistribute connected
 exit-address-family
 address-family l2vpn evpn
  advertise ipv4 unicast
 exit-address-family
exit`,
    )
    .join("\n");

  const rrClients = ["pi5", "zero", "east", "west", "core"].map((id) => NODE_BY_ID[id]);
  const neighbors = node.isRr
    ? rrClients
        .map((c) => ` neighbor ${c.routerId} peer-group VTEP\n neighbor ${c.routerId} description ${c.hostname}`)
        .join("\n")
    : ` neighbor 10.254.0.10 peer-group VTEP\n neighbor 10.254.0.10 description arch-minipc-rr`;

  const loIface =
    node.os === "arch"
      ? `interface lo
 ! ${node.routerId}/32 from systemd-networkd 10-lo.network
exit`
      : `interface lo
 ip address ${node.routerId}/32
exit`;

  return `! ${node.hostname} — FRR VTEP ${node.isRr ? "(EVPN RR)" : "(RR client)"}
${node.os === "arch" ? "! dataplane: systemd-networkd (zebra does not own lo/gre0/vxlan0)\n" : ""}frr version 10.4
frr defaults datacenter
hostname ${node.hostname}
log syslog informational
service integrated-vtysh-config
!
${vrfBlocks}
${loIface}
${tunnelIfaces(node)}
!
${ospfBlock(node)}
!
router bgp ${ASN}
 bgp router-id ${node.routerId}
 no bgp ebgp-requires-policy
 no bgp default ipv4-unicast
 neighbor VTEP peer-group
 neighbor VTEP remote-as ${ASN}
 neighbor VTEP capability extended-nexthop
 neighbor VTEP bfd
 neighbor VTEP update-source lo
${neighbors}
 !
 address-family ipv4 unicast
  neighbor VTEP activate
  network ${node.routerId}/32
 exit-address-family
 !
 address-family l2vpn evpn
  neighbor VTEP activate
${node.isRr ? "  neighbor VTEP route-reflector-client\n" : ""}  advertise-all-vni
  advertise-svi-ip
 exit-address-family
exit
!
${vrfBgp}
line vty
exit
`;
}

export function vyosConfig(): string {
  return `/* VyOS 1.3 config.boot — ER4 personality (EdgeOS 3.0.1 stand-in)
 * VXLAN is intentionally absent. Cavium EdgeOS 3.0.1 has no usable VXLAN dataplane.
 * This box is the underlay hub: OSPF + BGP IPv4 + GRE + IPsec VTI.
 */
interfaces {
    ethernet eth0 {
        address 10.0.0.2/24
        description "ISP modem LAN — only host"
    }
    ethernet eth1 {
        address 192.168.100.1/24
        description "Home LAN 192.168.100.0/24 — GRE endpoints only"
    }
    loopback lo {
        address 10.254.0.1/32
    }
    tunnel tun0 {
        encapsulation gre
        local-ip 192.168.100.1
        remote-ip 192.168.100.10
        address 10.255.0.1/30
        description "GRE arch-minipc (sanctioned underlay)"
        mtu 1476
    }
    tunnel tun1 {
        encapsulation gre
        local-ip 192.168.100.1
        remote-ip 192.168.100.20
        address 10.255.0.5/30
        description "GRE pi5-alma"
        mtu 1476
    }
    tunnel tun2 {
        encapsulation gre
        local-ip 192.168.100.1
        remote-ip 192.168.100.30
        address 10.255.0.9/30
        description "GRE pizero2 via Wi-Fi"
        mtu 1400
    }
    vti vti0 { address 10.255.1.1/30; description "IPsec VTI vps-east"; mtu 1400 }
    vti vti1 { address 10.255.1.5/30; description "IPsec VTI vps-west"; mtu 1400 }
    vti vti2 { address 10.255.1.9/30; description "IPsec VTI vps-core"; mtu 1400 }
}
protocols {
    ospf {
        parameters { router-id 10.254.0.1 }
        area 0 {
            network 10.254.0.1/32
            network 10.255.0.0/30
            network 10.255.0.4/30
            network 10.255.0.8/30
            network 10.255.1.0/30
            network 10.255.1.4/30
            network 10.255.1.8/30
        }
        interface tun0 { network point-to-point }
        interface tun1 { network point-to-point }
        interface tun2 { network point-to-point }
        interface vti0 { network point-to-point }
        interface vti1 { network point-to-point }
        interface vti2 { network point-to-point }
        passive-interface lo
    }
    static {
        route 0.0.0.0/0 { next-hop 10.0.0.1 }
    }
}
`;
}

export function edgeOsConfig(): string {
  return `# EdgeOS 3.0.1 (EdgeRouter 4) — real box syntax
# No VXLAN. No EVPN. Underlay hub only.
configure
set interfaces ethernet eth0 address 10.0.0.2/24
set interfaces ethernet eth0 description 'ISP modem LAN'
set interfaces ethernet eth1 address 192.168.100.1/24
set interfaces ethernet eth1 description 'Home LAN'
set interfaces loopback lo address 10.254.0.1/32
set interfaces tunnel tun0 encapsulation gre
set interfaces tunnel tun0 local-ip 192.168.100.1
set interfaces tunnel tun0 remote-ip 192.168.100.10
set interfaces tunnel tun0 address 10.255.0.1/30
set interfaces tunnel tun0 mtu 1476
set interfaces tunnel tun1 encapsulation gre
set interfaces tunnel tun1 local-ip 192.168.100.1
set interfaces tunnel tun1 remote-ip 192.168.100.20
set interfaces tunnel tun1 address 10.255.0.5/30
set interfaces tunnel tun2 encapsulation gre
set interfaces tunnel tun2 local-ip 192.168.100.1
set interfaces tunnel tun2 remote-ip 192.168.100.30
set interfaces tunnel tun2 address 10.255.0.9/30
set interfaces vti vti0 address 10.255.1.1/30
set interfaces vti vti1 address 10.255.1.5/30
set interfaces vti vti2 address 10.255.1.9/30
set vpn ipsec ike-group IKE-LAB proposal 1 encryption aes256
set vpn ipsec ike-group IKE-LAB proposal 1 hash sha256
set vpn ipsec ike-group IKE-LAB proposal 1 dh-group 14
set vpn ipsec esp-group ESP-LAB proposal 1 encryption aes256gcm128
set vpn ipsec ipsec-interfaces interface eth0
set vpn ipsec site-to-site peer 203.0.113.11 authentication mode pre-shared-secret
set vpn ipsec site-to-site peer 203.0.113.11 authentication pre-shared-secret lab-only-not-secret
set vpn ipsec site-to-site peer 203.0.113.11 local-address 10.0.0.2
set vpn ipsec site-to-site peer 203.0.113.11 vti bind vti0
set vpn ipsec site-to-site peer 203.0.113.12 authentication mode pre-shared-secret
set vpn ipsec site-to-site peer 203.0.113.12 authentication pre-shared-secret lab-only-not-secret
set vpn ipsec site-to-site peer 203.0.113.12 local-address 10.0.0.2
set vpn ipsec site-to-site peer 203.0.113.12 vti bind vti1
set vpn ipsec site-to-site peer 203.0.113.13 authentication mode pre-shared-secret
set vpn ipsec site-to-site peer 203.0.113.13 authentication pre-shared-secret lab-only-not-secret
set vpn ipsec site-to-site peer 203.0.113.13 local-address 10.0.0.2
set vpn ipsec site-to-site peer 203.0.113.13 vti bind vti2
set protocols ospf parameters router-id 10.254.0.1
set protocols ospf area 0 network 10.254.0.1/32
set protocols ospf area 0 network 10.255.0.0/16
set protocols ospf interface tun0 network point-to-point
set protocols ospf interface tun1 network point-to-point
set protocols ospf interface tun2 network point-to-point
set protocols ospf interface vti0 network point-to-point
set protocols ospf interface vti1 network point-to-point
set protocols ospf interface vti2 network point-to-point
set protocols static route 0.0.0.0/0 next-hop 10.0.0.1
commit
save
`;
}
