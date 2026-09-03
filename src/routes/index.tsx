import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { OverlayDiagram, PhysicalDiagram, UnderlayDiagram } from "@/components/diagrams";
import { Button } from "@/components/ui/button";
import { downloadLabctl } from "@/lib/fabric/labctl";
import { HOST_PODMAN_NETS, PODMAN_NETS, TENANTS } from "@/lib/fabric/topology";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="min-h-dvh bg-bg text-fg">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">AS 64512</p>
            <h1 className="text-xl font-semibold tracking-tight">SVD Fabric</h1>
            <p className="mt-1 max-w-xl text-sm text-muted">
              Rootless Podman lab of a homelab BGP-EVPN fabric. Download labctl; run it on the
              Arch miniPC.
            </p>
          </div>
          <Button onClick={downloadLabctl} aria-label="Download labctl">
            <Download className="size-4" />
            Download labctl
          </Button>
        </div>
      </header>

      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-10 sm:px-6">
        <section className="max-w-prose space-y-3 text-sm leading-relaxed text-muted">
          <p>
            The house sits behind an ISP modem. The only thing on the modem LAN is an EdgeRouter 4
            running a real VyOS 1.3 image (EdgeOS 3.0.1 personality). That box speaks BGP, OSPF, GRE,
            and IPsec VTI. It does not speak VXLAN, so it is underlay only.
          </p>
          <p>
            Home devices — Arch miniPC, Pi 5 (Alma 10), Pi Zero 2 (Pi OS on Wi-Fi) — sit on the
            house LAN 192.168.1.0/24. The lab uses 192.168.100.0/24 so those two never share a
            subnet. GRE tunnels on the lab LAN addresses are the sanctioned underlay. Change
            the home subnet later and only the GRE endpoints move; EVPN does not care.
          </p>
          <p>
            Three remote VPS (Ubuntu 24.04, 24.04, 26.04) come in over VTI. Every VTEP except the
            router runs FRR and a Single VXLAN Device. Arch owns the dataplane with systemd-networkd
            and is the iBGP route-reflector.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Sites</h2>
          <PhysicalDiagram />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Underlay</h2>
          <UnderlayDiagram />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Overlay</h2>
          <OverlayDiagram />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Tenants</h2>
          <p className="max-w-prose text-sm text-muted">
            One SVD maps VLAN to VNI. L2VNI = 10000+VLAN, L3VNI = 20000+VLAN. Private RTs stay
            on the Arch Caddy; public RT 64512:40 is the only thing vps-core WAN Caddy imports.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-muted">
                  <th className="px-4 py-3 font-medium">VRF</th>
                  <th className="px-4 py-3 font-medium">VLAN</th>
                  <th className="px-4 py-3 font-medium">L2VNI</th>
                  <th className="px-4 py-3 font-medium">L3VNI</th>
                  <th className="px-4 py-3 font-medium">Prefix</th>
                  <th className="px-4 py-3 font-medium">GW</th>
                  <th className="px-4 py-3 font-medium">RT</th>
                </tr>
              </thead>
              <tbody>
                {TENANTS.map((t) => (
                  <tr key={t.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 font-mono text-fg">{t.name}</td>
                    <td className="px-4 py-3 font-mono">{t.vlan}</td>
                    <td className="px-4 py-3 font-mono">{t.l2vni}</td>
                    <td className="px-4 py-3 font-mono">{t.l3vni}</td>
                    <td className="px-4 py-3 font-mono">{t.prefix}</td>
                    <td className="px-4 py-3 font-mono">{t.gw}</td>
                    <td className="px-4 py-3 font-mono">{t.exposure} {t.rt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Hosts, FRR, firewall</h2>
          <p className="max-w-prose text-sm text-muted">
            One Containerfile per OS, built with buildah. FRR is in every VTEP image.
            Firewall is a oneshot after GRE/SVD exists: trust those interfaces, keep the pasta
            veth in public. Overlay isolation is VRF + VNI, not host filter.
            <span className="font-mono text-fg"> bridge-nf-call-iptables=0</span> so firewalld/ufw
            cannot eat bridged VXLAN.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="rounded-md border border-border bg-surface px-4 py-3">
              <p className="font-medium text-fg">arch-minipc</p>
              <p className="text-muted">Arch · systemd-networkd · FRR · firewalld (trusted: gre0, vxlan0, br0, VRFs)</p>
            </li>
            <li className="rounded-md border border-border bg-surface px-4 py-3">
              <p className="font-medium text-fg">pi5-alma</p>
              <p className="text-muted">AlmaLinux 10 · FRR · firewalld · same trusted-zone model</p>
            </li>
            <li className="rounded-md border border-border bg-surface px-4 py-3">
              <p className="font-medium text-fg">pizero2</p>
              <p className="text-muted">Pi OS userspace (Debian 12) · FRR · ufw allow in on gre0/vxlan0/br0</p>
            </li>
            <li className="rounded-md border border-border bg-surface px-4 py-3">
              <p className="font-medium text-fg">FRR</p>
              <p className="text-muted">
                Every VTEP (Arch, Alma, Pi Zero, three VPS). Not the ISP. ER4 is VyOS — its own OSPF/BGP,
                no EVPN. Arch and Alma are Podman servers <em>and</em> VTEPs.
              </p>
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Per-host podman subnets</h2>
          <p className="max-w-prose text-sm text-muted">
            Nested podman is skipped. Each VTEP gets a linux bridge in the tenant VRF (
            <span className="font-mono text-fg">pn-svc</span> …) plus a netns standing in for a
            local container. FRR redistributes those prefixes as EVPN Type-5. IRB 172.16.x.1 stays
            the stretched L2 anycast.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-muted">
                  <th className="px-4 py-3 font-medium">Host</th>
                  <th className="px-4 py-3 font-medium">Tenant</th>
                  <th className="px-4 py-3 font-medium">Subnet</th>
                  <th className="px-4 py-3 font-medium">GW</th>
                  <th className="px-4 py-3 font-medium">CE</th>
                  <th className="px-4 py-3 font-medium">Side</th>
                </tr>
              </thead>
              <tbody>
                {HOST_PODMAN_NETS.map((n) => (
                  <tr key={`${n.node}-${n.tenant}`} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 font-mono text-fg">{n.node}</td>
                    <td className="px-4 py-3 font-mono">{n.tenant}</td>
                    <td className="px-4 py-3 font-mono">{n.subnet}</td>
                    <td className="px-4 py-3 font-mono">{n.gw}</td>
                    <td className="px-4 py-3 font-mono">{n.ce}</td>
                    <td className="px-4 py-3 font-mono">{n.exposure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Podman networks</h2>
          <ul className="space-y-2 text-sm">
            {PODMAN_NETS.map((n) => (
              <li key={n.name} className="rounded-md border border-border bg-surface px-4 py-3">
                <p className="font-mono text-fg">{n.name}</p>
                <p className="text-muted">
                  {n.subnet} — {n.role}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">labctl</h2>
          <p className="max-w-prose text-sm text-muted">
            Single script. Rootful Podman + netavark L2 bridges on 192.168.100.0/24 (not the
            house 192.168.1.0/24). Host IPs stripped from the lab bridges. Inner workloads are
            rootless as user <span className="font-mono text-fg">pod</span>. Arch dataplane is
            systemd-networkd. ER4 is VyOS 1.3.
          </p>
          <pre className="overflow-x-auto rounded-md border border-border bg-surface p-4 font-mono text-sm leading-relaxed text-fg">
            {`chmod +x labctl
./labctl up
./labctl status
./labctl check
./labctl vtysh arch-minipc show bgp l2vpn evpn
./labctl down`}
          </pre>
          <Button variant="secondary" onClick={downloadLabctl}>
            <Download className="size-4" />
            Download labctl
          </Button>
        </section>
      </div>
    </main>
  );
}
