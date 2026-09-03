#!/usr/bin/env bash
# SVD Fabric — rootless Podman BGP-EVPN lab
# Intended host: Arch miniPC, Podman 6.1. Outer nodes are rootful/privileged.
# Lab LANs are netavark bridges with host addresses flushed (isolated from the
# house 192.168.1.0/24). Inner httpd is rootless Podman as user `pod`.
#
#   ./labctl up        networks, systemd containers, GRE/VTI, SVD, FRR
#   ./labctl down      reverse
#   ./labctl status    containers + underlay pings
#   ./labctl check     OSPF / EVPN / tenant ping
#   ./labctl vyos <op-cmd...>   VyOS op-mode on er4 (show interfaces, …)
#   ./labctl vtysh <node> [command...]
#   ./labctl exec  <node> <command...>
#   ./labctl build     images only
#
# Nodes: isp, er4, arch-minipc, pi5-alma, pizero2, vps-east, vps-west, vps-core
#
# Underlay is GRE (home) + IPsec-VTI-or-GRE (WAN). Home LAN 192.168.100.0/24 is
# only GRE endpoints so a LAN renumber touches two IPs, not the EVPN fabric.
# Arch dataplane is systemd-networkd (External=+VNIFilter=). Other VTEPs use
# iproute2 SVD. ER4 is docker.io/vyos/image:1.3 — underlay hub, no VXLAN.
set -euo pipefail

ROOT=$(cd "$(dirname "$0")" && pwd)
export LAB_DIR="${LAB_DIR:-$HOME/.local/share/svd-fabric}"
VYOS_IMAGE="${VYOS_IMAGE:-docker.io/vyos/image:1.3}"
mkdir -p "$LAB_DIR"/{images,state,logs,er4-config}

die() { echo "labctl: $*" >&2; exit 1; }
need() { command -v "$1" >/dev/null || die "missing $1"; }
log() { printf '==> %s\n' "$*"; }

nodes=(isp er4 arch-minipc pi5-alma pizero2 vps-east vps-west vps-core)
vteps=(arch-minipc pi5-alma pizero2 vps-east vps-west vps-core)

execn() { podman exec "$1" bash -lc "$2"; }

put() {
  local n="$1" path="$2"
  podman exec "$n" mkdir -p "$(dirname "$path")"
  podman exec -i "$n" tee "$path" >/dev/null
}

preflight() {
  need podman
  podman info >/dev/null 2>&1 || die "podman info failed — is the user lingering / user.session up?"
  local ver
  ver=$(podman version -f '{{.Client.Version}}' 2>/dev/null || echo unknown)
  log "podman $ver  labdir $LAB_DIR"
  if [[ $(id -u) -eq 0 ]]; then
    echo "    rootful hypervisor: lab bridges are L2-only (host IPs flushed). Isolated from house LAN."
  else
    echo "    rootless hypervisor: OK, but GRE/OSPF/broadcast on a shared LAN is closer to the house as root."
  fi
  local m
  for m in vxlan ip_gre dummy vrf 8021q; do
    if [[ ! -d /sys/module/$m ]]; then
      echo "    warn: kernel module $m is not loaded (root: modprobe $m)"
    fi
  done
}

# --- images (Containerfile per OS, buildah bud) ----------------------------

write_containerfiles() {
  local d="$LAB_DIR/containerfiles"
  mkdir -p "$d"

  cat >"$d/svd-firewall.sh" <<'EOF'
#!/usr/bin/env bash
# Trust underlay + SVD. Do not let firewalld/ufw into the bridge.
# Tenant isolation is VRF + VNI, not the host filter.
set -euo pipefail
sysctl -w net.ipv4.ip_forward=1 >/dev/null || true
sysctl -w net.bridge.bridge-nf-call-iptables=0 >/dev/null 2>&1 || true
sysctl -w net.bridge.bridge-nf-call-ip6tables=0 >/dev/null 2>&1 || true

trust=()
for i in lo gre0 gre1 gre2 vti0 vti1 vti2 vxlan0 br0; do
  ip link show "$i" >/dev/null 2>&1 && trust+=("$i")
done
while read -r i; do
  [[ -n "$i" ]] && trust+=("$i")
done < <(ip -o link show 2>/dev/null | awk -F': ' '{print $2}' | cut -d'@' -f1 | grep -E '^(vrf-|ce-|pn-|veth-|.*-irb$)' || true)

if command -v firewall-cmd >/dev/null 2>&1; then
  systemctl start firewalld >/dev/null 2>&1 || true
  firewall-cmd --permanent --zone=public --add-service=ssh >/dev/null 2>&1 || true
  firewall-cmd --permanent --zone=public --add-protocol=gre >/dev/null 2>&1 || true
  for i in "${trust[@]}"; do
    firewall-cmd --permanent --zone=trusted --add-interface="$i" >/dev/null 2>&1 || true
    firewall-cmd --zone=trusted --add-interface="$i" >/dev/null 2>&1 || true
  done
  firewall-cmd --reload >/dev/null 2>&1 || true
elif command -v ufw >/dev/null 2>&1; then
  ufw --force reset >/dev/null 2>&1 || true
  ufw default deny incoming >/dev/null
  ufw default allow outgoing >/dev/null
  ufw allow 22/tcp >/dev/null || true
  ufw allow proto gre >/dev/null 2>&1 || true
  for i in "${trust[@]}"; do
    ufw allow in on "$i" >/dev/null 2>&1 || true
  done
  ufw --force enable >/dev/null 2>&1 || true
fi
EOF
  chmod +x "$d/svd-firewall.sh"

  cat >"$d/svd-firewall.service" <<'EOF'
[Unit]
Description=SVD trust GRE/VTI/SVD on firewalld or ufw
After=network-online.target systemd-networkd.service frr.service
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/local/lib/svd-firewall.sh

[Install]
WantedBy=multi-user.target
EOF

  cat >"$d/storage.conf" <<'EOF'
[storage]
driver = "vfs"
runroot = "/run/containers/storage"
graphroot = "/var/lib/containers/storage"
EOF
  cat >"$d/containers.conf" <<'EOF'
[engine]
cgroup_manager = "cgroupfs"
events_logger = "file"
EOF

  cat >"$d/isp.Containerfile" <<'EOF'
FROM docker.io/library/alpine:3.20
RUN apk add --no-cache nftables iproute2 iputils bash
CMD ["sleep", "infinity"]
EOF

  cat >"$d/arch.Containerfile" <<'EOF'
FROM docker.io/library/archlinux:latest
ENV container=docker
COPY svd-firewall.sh /usr/local/lib/svd-firewall.sh
COPY svd-firewall.service /etc/systemd/system/svd-firewall.service
COPY storage.conf /etc/containers/storage.conf
COPY containers.conf /etc/containers/containers.conf
RUN pacman-key --init && pacman-key --populate archlinux \
 && pacman -Sy --noconfirm --needed systemd systemd-sysvcompat dbus iproute2 \
      frr python tcpdump iputils firewalld podman catatonit netavark aardvark-dns \
 && mkdir -p /etc/systemd/networkd.conf.d /etc/systemd/network \
 && chmod +x /usr/local/lib/svd-firewall.sh \
 && useradd -m -u 1000 -s /bin/bash pod \
 && echo 'pod:100000:65536' >> /etc/subuid \
 && echo 'pod:100000:65536' >> /etc/subgid \
 && mkdir -p /home/pod/.config/containers /run/user/1000 \
 && cp /etc/containers/storage.conf /home/pod/.config/containers/storage.conf \
 && chown -R pod:pod /home/pod \
 && systemctl enable systemd-networkd frr dbus firewalld svd-firewall.service \
 && systemctl mask systemd-networkd-wait-online.service getty@tty1.service
STOPSIGNAL SIGRTMIN+3
CMD ["/usr/lib/systemd/systemd"]
EOF

  cat >"$d/alma10.Containerfile" <<'EOF'
FROM docker.io/library/almalinux:10
ENV container=oci
COPY svd-firewall.sh /usr/local/lib/svd-firewall.sh
COPY svd-firewall.service /etc/systemd/system/svd-firewall.service
COPY storage.conf /etc/containers/storage.conf
COPY containers.conf /etc/containers/containers.conf
RUN dnf -y install systemd dbus iproute iputils tcpdump procps-ng firewalld python3 podman \
 && (dnf -y install epel-release && dnf -y install frr frr-pythontools || dnf -y install frr) \
 && dnf clean all \
 && chmod +x /usr/local/lib/svd-firewall.sh \
 && useradd -m -u 1000 -s /bin/bash pod \
 && echo 'pod:100000:65536' >> /etc/subuid \
 && echo 'pod:100000:65536' >> /etc/subgid \
 && mkdir -p /home/pod/.config/containers \
 && cp /etc/containers/storage.conf /home/pod/.config/containers/storage.conf \
 && chown -R pod:pod /home/pod \
 && systemctl enable frr dbus firewalld svd-firewall.service \
 && systemctl mask systemd-networkd-wait-online.service
STOPSIGNAL SIGRTMIN+3
CMD ["/usr/lib/systemd/systemd"]
EOF

  cat >"$d/pios.Containerfile" <<'EOF'
# Pi OS userspace stand-in (Debian 12). Lab hypervisor is x86_64; this is not an ARM image.
FROM docker.io/library/debian:12
ENV container=docker DEBIAN_FRONTEND=noninteractive
COPY svd-firewall.sh /usr/local/lib/svd-firewall.sh
COPY svd-firewall.service /etc/systemd/system/svd-firewall.service
COPY storage.conf /etc/containers/storage.conf
COPY containers.conf /etc/containers/containers.conf
RUN apt-get update && apt-get install -y --no-install-recommends \
      systemd systemd-sysv dbus frr frr-pythontools ufw podman uidmap \
      iproute2 iputils-ping tcpdump bridge-utils procps ca-certificates python3 \
 && rm -rf /var/lib/apt/lists/* \
 && chmod +x /usr/local/lib/svd-firewall.sh \
 && useradd -m -u 1000 -s /bin/bash pod \
 && echo 'pod:100000:65536' >> /etc/subuid \
 && echo 'pod:100000:65536' >> /etc/subgid \
 && mkdir -p /home/pod/.config/containers \
 && cp /etc/containers/storage.conf /home/pod/.config/containers/storage.conf \
 && chown -R pod:pod /home/pod \
 && systemctl enable frr dbus ufw svd-firewall.service \
 && systemctl mask systemd-networkd-wait-online.service
STOPSIGNAL SIGRTMIN+3
CMD ["/usr/lib/systemd/systemd"]
EOF

  cat >"$d/ubuntu2404.Containerfile" <<'EOF'
FROM docker.io/library/ubuntu:24.04
ENV container=docker DEBIAN_FRONTEND=noninteractive
COPY svd-firewall.sh /usr/local/lib/svd-firewall.sh
COPY svd-firewall.service /etc/systemd/system/svd-firewall.service
COPY storage.conf /etc/containers/storage.conf
COPY containers.conf /etc/containers/containers.conf
RUN apt-get update && apt-get install -y --no-install-recommends \
      systemd systemd-sysv dbus frr frr-pythontools ufw podman uidmap \
      iproute2 iputils-ping tcpdump bridge-utils procps ca-certificates python3 \
 && rm -rf /var/lib/apt/lists/* \
 && chmod +x /usr/local/lib/svd-firewall.sh \
 && useradd -m -u 1000 -s /bin/bash pod \
 && echo 'pod:100000:65536' >> /etc/subuid \
 && echo 'pod:100000:65536' >> /etc/subgid \
 && mkdir -p /home/pod/.config/containers \
 && cp /etc/containers/storage.conf /home/pod/.config/containers/storage.conf \
 && chown -R pod:pod /home/pod \
 && systemctl enable frr dbus ufw svd-firewall.service \
 && systemctl mask systemd-networkd-wait-online.service
STOPSIGNAL SIGRTMIN+3
CMD ["/usr/lib/systemd/systemd"]
EOF

  cat >"$d/ubuntu2604.Containerfile" <<'EOF'
FROM docker.io/library/ubuntu:26.04
ENV container=docker DEBIAN_FRONTEND=noninteractive
COPY svd-firewall.sh /usr/local/lib/svd-firewall.sh
COPY svd-firewall.service /etc/systemd/system/svd-firewall.service
COPY storage.conf /etc/containers/storage.conf
COPY containers.conf /etc/containers/containers.conf
RUN apt-get update && apt-get install -y --no-install-recommends \
      systemd systemd-sysv dbus frr frr-pythontools ufw podman uidmap \
      iproute2 iputils-ping tcpdump bridge-utils procps ca-certificates python3 \
 && rm -rf /var/lib/apt/lists/* \
 && chmod +x /usr/local/lib/svd-firewall.sh \
 && useradd -m -u 1000 -s /bin/bash pod \
 && echo 'pod:100000:65536' >> /etc/subuid \
 && echo 'pod:100000:65536' >> /etc/subgid \
 && mkdir -p /home/pod/.config/containers \
 && cp /etc/containers/storage.conf /home/pod/.config/containers/storage.conf \
 && chown -R pod:pod /home/pod \
 && systemctl enable frr dbus ufw svd-firewall.service \
 && systemctl mask systemd-networkd-wait-online.service
STOPSIGNAL SIGRTMIN+3
CMD ["/usr/lib/systemd/systemd"]
EOF
}

bud() {
  local tag="$1" file="$2"
  log "buildah $tag  ($file)"
  if command -v buildah >/dev/null 2>&1; then
    buildah bud --layers -t "$tag" -f "$LAB_DIR/containerfiles/$file" "$LAB_DIR/containerfiles"
  else
    echo "    buildah not on PATH — podman build"
    podman build -t "$tag" -f "$LAB_DIR/containerfiles/$file" "$LAB_DIR/containerfiles"
  fi
}

build_images() {
  need podman
  write_containerfiles
  bud localhost/svd-isp:lab    isp.Containerfile
  log "pulling VyOS 1.3 ($VYOS_IMAGE)"
  podman pull "$VYOS_IMAGE"
  podman tag "$VYOS_IMAGE" localhost/svd-edge:lab
  bud localhost/svd-arch:lab   arch.Containerfile
  bud localhost/svd-alma:lab   alma10.Containerfile
  bud localhost/svd-pios:lab   pios.Containerfile
  bud localhost/svd-u2404:lab  ubuntu2404.Containerfile
  bud localhost/svd-u2604:lab  ubuntu2604.Containerfile
  log "images ready"
}

firewall_up() {
  log "firewalld/ufw — trust GRE/VTI/SVD, leave public on lab veth"
  local n
  for n in arch-minipc pi5-alma pizero2 vps-east vps-west vps-core; do
    podman exec "$n" /usr/local/lib/svd-firewall.sh 2>/dev/null \
      || echo "    warn: firewall apply failed on $n"
  done
}

# --- netavark bridges (rootful L2, host IPs stripped) ----------------------
# Shared LANs are real linux bridges, not pasta. Pasta is a userspace L3
# proxy — no ARP flood, GRE/OSPF/VXLAN look wrong. A bridge is a switch.
# Rootful: the bridge appears on the hypervisor. We flush its address so
# this box (already on 192.168.1.0/24 in the house) does not join the lab
# subnet. IPs live only in the node containers.

nets_up() {
  log "podman networks (internal L2, isolate from host)"
  podman network exists svd-isp-lan  || podman network create --internal --opt isolate=true --subnet 10.0.0.0/24    --gateway 10.0.0.254    svd-isp-lan
  podman network exists svd-wan      || podman network create --internal --opt isolate=true --subnet 203.0.113.0/24 --gateway 203.0.113.254 svd-wan
  podman network exists svd-home-lan || podman network create --internal --opt isolate=true --subnet 192.168.100.0/24 --gateway 192.168.100.254 svd-home-lan
  isolate_lab_bridges
}

isolate_lab_bridges() {
  [[ $(id -u) -eq 0 ]] || return 0
  log "flush host addresses on lab bridges (lab 192.168.100.0/24 stays off house 192.168.1.0/24)"
  local net br
  for net in svd-isp-lan svd-wan svd-home-lan; do
    br=$(podman network inspect "$net" -f '{{.NetworkInterface}}' 2>/dev/null) || continue
    [[ -n "$br" ]] || continue
    ip addr flush dev "$br" 2>/dev/null || true
    ip link set "$br" up 2>/dev/null || true
    sysctl -w "net.ipv4.conf.${br//./\/}.forwarding=0" >/dev/null 2>&1 || \
      sysctl -w "net.ipv4.conf.${br}.forwarding=0" >/dev/null 2>&1 || true
  done
}

nets_down() {
  podman network rm --ignore svd-home-lan svd-wan svd-isp-lan || true
}

run_systemd() {
  local name="$1" image="$2"; shift 2
  if podman container exists "$name"; then
    podman start "$name" >/dev/null
    return
  fi
  podman run -d --name "$name" --hostname "$name" \
    --systemd=always --cgroupns=host \
    --cap-add=NET_ADMIN --cap-add=NET_RAW --cap-add=NET_BIND_SERVICE \
    --device=/dev/net/tun \
    --sysctl net.ipv4.ip_forward=1 \
    --sysctl net.ipv4.conf.all.forwarding=1 \
    --sysctl net.ipv4.conf.all.rp_filter=0 \
    --security-opt label=disable \
    "$@" "$image"
}

run_vyos() {
  local name="$1"; shift
  write_er4_config_boot
  if podman container exists "$name"; then
    podman start "$name" >/dev/null
    return
  fi
  local mods=()
  [[ -d /lib/modules ]] && mods+=(-v /lib/modules:/lib/modules:ro)
  # privileged = all caps in the userns (rootless). Host modules already loaded.
  podman run -d --name "$name" --hostname "$name" \
    --privileged --systemd=always --cgroupns=host \
    --device=/dev/net/tun \
    --sysctl net.ipv4.ip_forward=1 \
    --sysctl net.ipv4.conf.all.forwarding=1 \
    --sysctl net.ipv4.conf.all.rp_filter=0 \
    --security-opt label=disable \
    -v "$LAB_DIR/er4-config:/opt/vyatta/etc/config" \
    "${mods[@]}" \
    "$@" "$VYOS_IMAGE" /sbin/init
}

wait_vyos() {
  log "waiting for VyOS 1.3 cli on er4"
  local i=0
  until podman exec er4 test -x /opt/vyatta/sbin/vyatta-cfg-cmd-wrapper 2>/dev/null \
        || (( i++ > 90 )); do
    sleep 1
  done
  i=0
  until podman exec er4 systemctl is-active vyos-router >/dev/null 2>&1 \
        || podman exec er4 pgrep -x vyos-router >/dev/null 2>&1 \
        || (( i++ > 30 )); do
    sleep 1
  done
}

wait_systemd() {
  local n="$1" i=0
  if [[ "$n" == isp ]]; then
    podman exec "$n" true
    return
  fi
  if [[ "$n" == er4 ]]; then
    wait_vyos
    return
  fi
  until podman exec "$n" systemctl is-system-running >/dev/null 2>&1 || (( i++ > 80 )); do
    sleep 0.5
  done
}

containers_up() {
  log "systemd containers"
  # iface order = --network order: eth0 first, eth1 second
  run_systemd isp localhost/svd-isp:lab \
    --network svd-isp-lan:ip=10.0.0.1 --network svd-wan:ip=203.0.113.2

  run_vyos er4 \
    --network svd-isp-lan:ip=10.0.0.2 --network svd-home-lan:ip=192.168.100.1

  run_systemd arch-minipc localhost/svd-arch:lab \
    --privileged --security-opt seccomp=unconfined \
    --network svd-home-lan:ip=192.168.100.10

  run_systemd pi5-alma localhost/svd-alma:lab \
    --privileged --security-opt seccomp=unconfined \
    --network svd-home-lan:ip=192.168.100.20

  run_systemd pizero2 localhost/svd-pios:lab \
    --privileged --security-opt seccomp=unconfined \
    --network svd-home-lan:ip=192.168.100.30

  run_systemd vps-east localhost/svd-u2404:lab \
    --privileged --security-opt seccomp=unconfined \
    --network svd-wan:ip=203.0.113.11

  run_systemd vps-west localhost/svd-u2404:lab \
    --privileged --security-opt seccomp=unconfined \
    --network svd-wan:ip=203.0.113.12

  run_systemd vps-core localhost/svd-u2604:lab \
    --privileged --security-opt seccomp=unconfined \
    --network svd-wan:ip=203.0.113.13

  for n in "${nodes[@]}"; do wait_systemd "$n"; done
}

containers_down() {
  for n in "${nodes[@]}"; do
    podman rm -f "$n" >/dev/null 2>&1 || true
  done
}

isp_nat() {
  log "ISP NAT 10.0.0.0/24 -> 203.0.113.2  + default routes"
  execn isp 'nft flush ruleset
nft add table ip nat
nft add chain ip nat postrouting { type nat hook postrouting priority 100 \; }
nft add rule ip nat postrouting oifname "eth1" ip saddr 10.0.0.0/24 masquerade
nft add table ip filter
nft add chain ip filter forward { type filter hook forward priority 0 \; policy accept \; }
sysctl -w net.ipv4.ip_forward=1 >/dev/null'
  execn arch-minipc 'ip route replace 0.0.0.0/0 via 192.168.100.1 || true'
  execn pi5-alma    'ip route replace 0.0.0.0/0 via 192.168.100.1 || true'
  execn pizero2     'ip route replace 0.0.0.0/0 via 192.168.100.1 || true'
  for n in vps-east vps-west vps-core; do
    execn "$n" 'ip route replace 0.0.0.0/0 via 203.0.113.2 || true
ip route replace 10.0.0.0/24 via 203.0.113.2 || true'
  done
}

# --- Arch systemd-networkd -------------------------------------------------

arch_networkd_up() {
  log "Arch systemd-networkd (lo /32, GRE, br0, SVD vxlan0, VRF, IRB)"
  execn arch-minipc 'mkdir -p /etc/systemd/network /etc/systemd/networkd.conf.d /usr/local/lib /etc/systemd/system'

  put arch-minipc /etc/systemd/networkd.conf.d/container.conf <<'EOF'
[Network]
ManageForeignRoutes=no
ManageForeignRoutingPolicyRules=no
EOF

  put arch-minipc /etc/systemd/network/05-eth0.network <<'EOF'
[Match]
Name=eth0

[Link]
Unmanaged=yes
EOF

  put arch-minipc /etc/systemd/network/10-lo.network <<'EOF'
[Match]
Name=lo

[Network]
KeepConfiguration=static
Address=10.254.0.10/32
EOF

  put arch-minipc /etc/systemd/network/20-gre0.netdev <<'EOF'
[NetDev]
Name=gre0
Kind=gre
MTUBytes=1476

[Tunnel]
Independent=yes
Local=192.168.100.10
Remote=192.168.100.1
TTL=64
EOF

  put arch-minipc /etc/systemd/network/20-gre0.network <<'EOF'
[Match]
Name=gre0

[Network]
Address=10.255.0.2/30
IPv4Forwarding=yes
ConfigureWithoutCarrier=yes
IPv6AcceptRA=no
LinkLocalAddressing=no
EOF

  put arch-minipc /etc/systemd/network/30-br0.netdev <<'EOF'
[NetDev]
Name=br0
Kind=bridge

[Bridge]
VLANFiltering=yes
DefaultPVID=none
STP=no
EOF

  put arch-minipc /etc/systemd/network/30-br0.network <<'EOF'
[Match]
Name=br0

[Network]
VLAN=svc-irb
VLAN=lab-irb
VLAN=iot-irb
VLAN=pub-irb
ConfigureWithoutCarrier=yes
IPv6AcceptRA=no
LinkLocalAddressing=no
EOF

  put arch-minipc /etc/systemd/network/50-vxlan0.netdev <<'EOF'
[NetDev]
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
EOF

  put arch-minipc /etc/systemd/network/50-vxlan0.network <<'EOF'
[Match]
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

[BridgeVLAN]
VLAN=10

[BridgeVLAN]
VLAN=1010

[BridgeVLAN]
VLAN=20

[BridgeVLAN]
VLAN=1020

[BridgeVLAN]
VLAN=30

[BridgeVLAN]
VLAN=1030

[BridgeVLAN]
VLAN=40

[BridgeVLAN]
VLAN=1040
EOF

  local t table=1100
  for t in svc lab iot pub; do
    put arch-minipc /etc/systemd/network/40-vrf-${t}.netdev <<EOF
[NetDev]
Name=vrf-${t}
Kind=vrf

[VRF]
TableId=${table}
EOF
    put arch-minipc /etc/systemd/network/40-vrf-${t}.network <<EOF
[Match]
Name=vrf-${t}

[Network]
ConfigureWithoutCarrier=yes
IPv6AcceptRA=no
LinkLocalAddressing=no
EOF
    table=$((table + 1))
  done

  put arch-minipc /etc/systemd/network/60-svc-irb.netdev <<'EOF'
[NetDev]
Name=svc-irb
Kind=vlan
[VLAN]
Id=10
EOF
  put arch-minipc /etc/systemd/network/60-svc-irb.network <<'EOF'
[Match]
Name=svc-irb
[Network]
VRF=vrf-svc
Address=172.16.10.1/24
ConfigureWithoutCarrier=yes
IPv6AcceptRA=no
LinkLocalAddressing=no
EOF
  put arch-minipc /etc/systemd/network/60-lab-irb.netdev <<'EOF'
[NetDev]
Name=lab-irb
Kind=vlan
[VLAN]
Id=20
EOF
  put arch-minipc /etc/systemd/network/60-lab-irb.network <<'EOF'
[Match]
Name=lab-irb
[Network]
VRF=vrf-lab
Address=172.16.20.1/24
ConfigureWithoutCarrier=yes
IPv6AcceptRA=no
LinkLocalAddressing=no
EOF
  put arch-minipc /etc/systemd/network/60-iot-irb.netdev <<'EOF'
[NetDev]
Name=iot-irb
Kind=vlan
[VLAN]
Id=30
EOF
  put arch-minipc /etc/systemd/network/60-iot-irb.network <<'EOF'
[Match]
Name=iot-irb
[Network]
VRF=vrf-iot
Address=172.16.30.1/24
ConfigureWithoutCarrier=yes
IPv6AcceptRA=no
LinkLocalAddressing=no
EOF

  put arch-minipc /etc/systemd/network/60-pub-irb.netdev <<'EOF'
[NetDev]
Name=pub-irb
Kind=vlan
[VLAN]
Id=40
EOF
  put arch-minipc /etc/systemd/network/60-pub-irb.network <<'EOF'
[Match]
Name=pub-irb
[Network]
VRF=vrf-pub
Address=172.16.40.1/24
ConfigureWithoutCarrier=yes
IPv6AcceptRA=no
LinkLocalAddressing=no
EOF

  put arch-minipc /etc/systemd/network/70-pn-svc.netdev <<'EOF'
[NetDev]
Name=pn-svc
Kind=bridge
EOF
  put arch-minipc /etc/systemd/network/70-pn-svc.network <<'EOF'
[Match]
Name=pn-svc
[Network]
VRF=vrf-svc
Address=10.88.10.1/24
ConfigureWithoutCarrier=yes
IPv6AcceptRA=no
LinkLocalAddressing=no
EOF
  put arch-minipc /etc/systemd/network/70-pn-lab.netdev <<'EOF'
[NetDev]
Name=pn-lab
Kind=bridge
EOF
  put arch-minipc /etc/systemd/network/70-pn-lab.network <<'EOF'
[Match]
Name=pn-lab
[Network]
VRF=vrf-lab
Address=10.88.20.1/24
ConfigureWithoutCarrier=yes
IPv6AcceptRA=no
LinkLocalAddressing=no
EOF
  put arch-minipc /etc/systemd/network/70-pn-pub.netdev <<'EOF'
[NetDev]
Name=pn-pub
Kind=bridge
EOF
  put arch-minipc /etc/systemd/network/70-pn-pub.network <<'EOF'
[Match]
Name=pn-pub
[Network]
VRF=vrf-pub
Address=10.89.10.1/24
ConfigureWithoutCarrier=yes
IPv6AcceptRA=no
LinkLocalAddressing=no
EOF

  put arch-minipc /usr/local/lib/svd-vni.sh <<'EOF'
#!/usr/bin/env bash
# networkd 258 creates vxlan0 (External+VNIFilter). Older networkd: create it here.
# VLAN↔VNI tunnel_info is still iproute2 — systemd has no unit key for it.
set -euo pipefail
if ! ip link show vxlan0 >/dev/null 2>&1; then
  ip link add br0 type bridge vlan_filtering 1 vlan_default_pvid 0 || true
  ip link add vxlan0 type vxlan dstport 4789 local 10.254.0.10 nolearning external vnifilter || true
  ip link set vxlan0 master br0 || true
  bridge link set dev vxlan0 vlan_tunnel on neigh_suppress on learning off || true
fi
ip link set br0 up || true
ip link set vxlan0 up || true
map_vni() {
  local vni="$1" vid="$2"
  bridge vni add dev vxlan0 vni "$vni" || true
  bridge vlan add dev vxlan0 vid "$vid" || true
  bridge vlan add dev vxlan0 vid "$vid" tunnel_info id "$vni" || true
  bridge vlan add dev br0 vid "$vid" self || true
}
map_vni 10010 10
map_vni 10020 20
map_vni 10030 30
map_vni 10040 40
map_vni 20010 1010
map_vni 20020 1020
map_vni 20030 1030
map_vni 20040 1040
EOF
  podman exec arch-minipc chmod +x /usr/local/lib/svd-vni.sh

  put arch-minipc /etc/systemd/system/svd-vni.service <<'EOF'
[Unit]
Description=SVD VLAN-to-VNI maps
After=systemd-networkd.service
Wants=systemd-networkd.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/local/lib/svd-vni.sh

[Install]
WantedBy=multi-user.target
EOF

  podman exec arch-minipc systemctl daemon-reload || true
  podman exec arch-minipc systemctl enable --now systemd-networkd svd-vni.service >/dev/null 2>&1 || true
  podman exec arch-minipc systemctl restart systemd-networkd || true
  sleep 1
  podman exec arch-minipc systemctl restart svd-vni.service || execn arch-minipc /usr/local/lib/svd-vni.sh
}

# --- GRE / VTI underlay ----------------------------------------------------

gre_up() {
  log "GRE sanctioned underlay (home) — ER4 tun0/1/2 come from VyOS, not iproute2"
  arch_networkd_up
  execn pi5-alma 'ip tunnel add gre0 mode gre local 192.168.100.20 remote 192.168.100.1 ttl 64 && ip addr add 10.255.0.6/30 dev gre0 && ip link set gre0 mtu 1476 up' || true
  execn pizero2 'ip tunnel add gre0 mode gre local 192.168.100.30 remote 192.168.100.1 ttl 64 && ip addr add 10.255.0.10/30 dev gre0 && ip link set gre0 mtu 1400 up' || true
}

vti_up() {
  log "VPS underlay toward ER4 (raw VTI, else GRE named vti0)"
  vps_underlay vps-east 203.0.113.11 10.0.0.2 10.255.1.2/30
  vps_underlay vps-west 203.0.113.12 10.0.0.2 10.255.1.6/30
  vps_underlay vps-core 203.0.113.13 10.0.0.2 10.255.1.10/30
  for n in vps-east vps-west vps-core; do
    execn "$n" 'ip route replace 10.255.0.0/16 via 10.255.1.1 || true
ip route replace 10.254.0.0/24 via 10.255.1.1 || true'
  done
}

vps_underlay() {
  local n="$1" localip="$2" remote="$3" addr="$4"
  if execn "$n" "ip link add vti0 type vti local ${localip} remote ${remote} key 1" 2>/dev/null; then
    :
  else
    echo "    xfrm VTI unavailable on $n — GRE stand-in on vti0"
    execn "$n" "ip tunnel add vti0 mode gre local ${localip} remote ${remote} ttl 64" || true
  fi
  execn "$n" "ip addr add ${addr} dev vti0; ip link set vti0 mtu 1400 up; sysctl -w net.ipv4.conf.vti0.rp_filter=0 >/dev/null" || true
}

# --- SVD + IRB + CE on non-Arch VTEPs --------------------------------------
# tenant: name:vlan:l2vni:l3vni:gw:table
# ce:     name:ip:vlan

svd_up() {
  local n="$1" vtep="$2"; shift 2
  log "SVD on $n  local $vtep"
  execn "$n" "ip addr replace ${vtep}/32 dev lo
ip link add br0 type bridge vlan_filtering 1 vlan_default_pvid 0 2>/dev/null || true
ip link add vxlan0 type vxlan dstport 4789 local ${vtep} nolearning external vnifilter 2>/dev/null || true
ip link set vxlan0 master br0 || true
bridge link set dev vxlan0 vlan_tunnel on neigh_suppress on learning off || true
ip link set br0 up
ip link set vxlan0 up
ip link set vxlan0 mtu 1350 || true
sysctl -w net.ipv4.ip_forward=1 >/dev/null"
  local spec name vlan l2 l3 gw table
  for spec in "$@"; do
    IFS=: read -r name vlan l2 l3 gw table <<<"$spec"
    execn "$n" "ip link add vrf-${name} type vrf table ${table} 2>/dev/null || true
ip link set vrf-${name} up
bridge vni add dev vxlan0 vni ${l2} || true
bridge vlan add dev vxlan0 vid ${vlan} || true
bridge vlan add dev vxlan0 vid ${vlan} tunnel_info id ${l2} || true
bridge vlan add dev br0 vid ${vlan} self || true
ip link add ${name}-irb link br0 type vlan id ${vlan} 2>/dev/null || true
ip addr replace ${gw}/24 dev ${name}-irb
ip link set ${name}-irb master vrf-${name} || true
ip link set ${name}-irb up
bridge vni add dev vxlan0 vni ${l3} || true
bridge vlan add dev vxlan0 vid $((vlan + 1000)) || true
bridge vlan add dev vxlan0 vid $((vlan + 1000)) tunnel_info id ${l3} || true"
  done
}

# Inner workloads: rootless podman as user `pod` inside the VTEP.
inner_exec() {
  local n="$1"; shift
  podman exec -u pod -e HOME=/home/pod -e XDG_RUNTIME_DIR=/run/user/1000 "$n" "$@"
}

prep_inner_user() {
  local n
  for n in "${vteps[@]}"; do
    execn "$n" 'mkdir -p /run/user/1000 /home/pod/.local/share/containers
chown -R pod:pod /run/user/1000 /home/pod
chmod 700 /run/user/1000' || true
  done
}

# Inner podman is rootless (user pod). Outer VTEP is rootful/privileged.
# Fallback: netns+python if nested podman cannot start.
inner_pn() {
  local n="$1" tenant="$2" subnet="$3" gw="$4" ce="$5"
  local net="pn-${tenant}"
  log "    $n  rootless www $net $subnet  $ce"
  execn "$n" "mkdir -p /var/www/${tenant} /run/user/1000
printf '<!doctype html><html><body><h1>${n} / ${tenant}</h1><p>${ce}</p></body></html>\n' > /var/www/${tenant}/index.html
chown -R pod:pod /var/www/${tenant} /run/user/1000"
  inner_exec "$n" bash -lc "podman network exists ${net} || podman network create --driver bridge --subnet ${subnet} --gateway ${gw} --interface-name ${net} ${net} || podman network create --driver bridge --subnet ${subnet} --gateway ${gw} ${net}" \
    || echo "    warn: inner network ${net} on ${n}"
  execn "$n" "ip link set ${net} master vrf-${tenant} 2>/dev/null || true
for cand in ${net} podman0 podman1 podman2; do
  ip link show \$cand >/dev/null 2>&1 && ip link set \$cand master vrf-${tenant} 2>/dev/null || true
done"
  inner_exec "$n" bash -lc "podman rm -f www-${tenant} >/dev/null 2>&1 || true
podman run -d --name www-${tenant} --network ${net} --ip ${ce%/*} \
  -v /var/www/${tenant}:/usr/local/apache2/htdocs:ro \
  docker.io/library/httpd:2.4-alpine" \
    || echo "    warn: inner httpd ${tenant} on ${n}"
  if ! inner_exec "$n" podman inspect "www-${tenant}" >/dev/null 2>&1; then
    local_pn "$n" "$tenant" "${gw}/24" "$ce"
    execn "$n" "ip netns exec ctr-${tenant} python3 -m http.server 80 >/tmp/www-${tenant}.log 2>&1 &" || true
  fi
}

local_pn() {
  local n="$1" tenant="$2" gw="$3" ce="$4"
  local br="pn-${tenant}" ns="ctr-${tenant}"
  execn "$n" "ip link add ${br} type bridge 2>/dev/null || true
ip link set ${br} master vrf-${tenant} || true
ip addr replace ${gw} dev ${br}
ip link set ${br} up
ip netns add ${ns} 2>/dev/null || true
ip link del veth-${tenant} 2>/dev/null || true
ip link add veth-${tenant} type veth peer name veth-${tenant}-c
ip link set veth-${tenant} master ${br}
ip link set veth-${tenant} up
ip link set veth-${tenant}-c netns ${ns}
ip netns exec ${ns} ip link set lo up
ip netns exec ${ns} ip addr replace ${ce} dev veth-${tenant}-c
ip netns exec ${ns} ip link set veth-${tenant}-c up
ip netns exec ${ns} ip route replace default via ${gw%/*} || true" \
    || echo "    warn: local net ${br} on ${n} failed"
}

overlay_dataplane() {
  svd_up pi5-alma 10.254.0.20 \
    svc:10:10010:20010:172.16.10.1:1100 \
    lab:20:10020:20020:172.16.20.1:1101 \
    iot:30:10030:20030:172.16.30.1:1102 \
    pub:40:10040:20040:172.16.40.1:1103
  svd_up pizero2 10.254.0.30 \
    iot:30:10030:20030:172.16.30.1:1102
  svd_up vps-east 10.254.0.11 \
    svc:10:10010:20010:172.16.10.1:1100 \
    lab:20:10020:20020:172.16.20.1:1101 \
    pub:40:10040:20040:172.16.40.1:1103
  svd_up vps-west 10.254.0.12 \
    svc:10:10010:20010:172.16.10.1:1100 \
    pub:40:10040:20040:172.16.40.1:1103
  svd_up vps-core 10.254.0.13 \
    svc:10:10010:20010:172.16.10.1:1100 \
    lab:20:10020:20020:172.16.20.1:1101 \
    iot:30:10030:20030:172.16.30.1:1102 \
    pub:40:10040:20040:172.16.40.1:1103

  load_inner_images
  prep_inner_user
  log "rootless inner httpd (user pod)"
  inner_pn arch-minipc svc 10.88.10.0/24 10.88.10.1 10.88.10.10/24
  inner_pn arch-minipc lab 10.88.20.0/24 10.88.20.1 10.88.20.10/24
  inner_pn arch-minipc pub 10.89.10.0/24 10.89.10.1 10.89.10.10/24
  inner_pn pi5-alma    svc 10.88.11.0/24 10.88.11.1 10.88.11.10/24
  inner_pn pi5-alma    lab 10.88.21.0/24 10.88.21.1 10.88.21.10/24
  inner_pn pi5-alma    iot 10.88.31.0/24 10.88.31.1 10.88.31.10/24
  inner_pn pi5-alma    pub 10.89.11.0/24 10.89.11.1 10.89.11.10/24
  inner_pn pizero2     iot 10.88.32.0/24 10.88.32.1 10.88.32.10/24
  inner_pn vps-east    svc 10.88.13.0/24 10.88.13.1 10.88.13.10/24
  inner_pn vps-east    lab 10.88.23.0/24 10.88.23.1 10.88.23.10/24
  inner_pn vps-east    pub 10.89.13.0/24 10.89.13.1 10.89.13.10/24
  inner_pn vps-west    svc 10.88.14.0/24 10.88.14.1 10.88.14.10/24
  inner_pn vps-west    pub 10.89.14.0/24 10.89.14.1 10.89.14.10/24
  inner_pn vps-core    svc 10.88.15.0/24 10.88.15.1 10.88.15.10/24
  inner_pn vps-core    lab 10.88.25.0/24 10.88.25.1 10.88.25.10/24
  inner_pn vps-core    iot 10.88.35.0/24 10.88.35.1 10.88.35.10/24
  inner_pn vps-core    pub 10.89.15.0/24 10.89.15.1 10.89.15.10/24
}

load_inner_images() {
  log "pull httpd+caddy on hypervisor, load into VTEPs"
  podman pull docker.io/library/httpd:2.4-alpine >/dev/null
  podman pull docker.io/library/caddy:2-alpine >/dev/null
  local n
  for n in "${vteps[@]}"; do
    podman save docker.io/library/httpd:2.4-alpine docker.io/library/caddy:2-alpine \
      | podman exec -i -u pod -e HOME=/home/pod -e XDG_RUNTIME_DIR=/run/user/1000 "$n" podman load >/dev/null \
      || echo "    warn: podman load $n failed"
  done
}

caddy_up() {
  log "Caddy — Arch internal (private RTs) and vps-core WAN (public RT only)"
  execn arch-minipc 'ip route replace 10.88.10.0/24 dev vrf-svc; ip route replace 10.88.11.0/24 dev vrf-svc
ip route replace 10.88.13.0/24 dev vrf-svc; ip route replace 10.88.14.0/24 dev vrf-svc
ip route replace 10.88.15.0/24 dev vrf-svc
ip route replace 10.88.20.0/24 dev vrf-lab; ip route replace 10.88.21.0/24 dev vrf-lab
ip route replace 10.88.23.0/24 dev vrf-lab; ip route replace 10.88.25.0/24 dev vrf-lab
ip route replace 10.88.31.0/24 dev vrf-iot; ip route replace 10.88.32.0/24 dev vrf-iot
ip route replace 10.88.35.0/24 dev vrf-iot' || true
  execn vps-core 'ip route replace 10.89.0.0/16 dev vrf-pub' || true

  put arch-minipc /etc/caddy/Caddyfile <<'EOF'
{
  auto_https off
}
:80 {
  handle_path /svc/* { reverse_proxy 10.88.10.10:80 }
  handle_path /lab/* { reverse_proxy 10.88.20.10:80 }
  handle_path /alma/* { reverse_proxy 10.88.11.10:80 }
  handle_path /east/* { reverse_proxy 10.88.13.10:80 }
  handle_path /zero/* { reverse_proxy 10.88.32.10:80 }
  handle / { respond "internal caddy — private VNIs 10010/10020/10030 only" 200 }
}
EOF
  put vps-core /etc/caddy/Caddyfile <<'EOF'
{
  auto_https off
}
:80 {
  handle_path /core/* { reverse_proxy 10.89.15.10:80 }
  handle_path /east/* { reverse_proxy 10.89.13.10:80 }
  handle_path /west/* { reverse_proxy 10.89.14.10:80 }
  handle_path /arch/* { reverse_proxy 10.89.10.10:80 }
  handle_path /alma/* { reverse_proxy 10.89.11.10:80 }
  handle / { respond "wan caddy — public VNI 10040/20040 RT 64512:40 only" 200 }
}
EOF
  execn arch-minipc 'podman rm -f caddy-int >/dev/null 2>&1 || true
podman run -d --name caddy-int --network host -v /etc/caddy/Caddyfile:/etc/caddy/Caddyfile:ro docker.io/library/caddy:2-alpine' \
    || echo "    warn: internal caddy"
  execn vps-core 'podman rm -f caddy-wan >/dev/null 2>&1 || true
podman run -d --name caddy-wan --network host -v /etc/caddy/Caddyfile:/etc/caddy/Caddyfile:ro docker.io/library/caddy:2-alpine' \
    || echo "    warn: wan caddy"
}

# --- FRR -------------------------------------------------------------------

install_frr() {
  local n="$1"
  put "$n" /etc/frr/daemons <<'EOF'
zebra=yes
bgpd=yes
ospfd=yes
staticd=yes
bfdd=yes
vtysh_enable=yes
zebra_options="  -A 127.0.0.1 -s 90000000"
bgpd_options="   -A 127.0.0.1"
ospfd_options="  -A 127.0.0.1"
staticd_options="-A 127.0.0.1"
bfdd_options="   -A 127.0.0.1"
EOF
  put "$n" /etc/frr/frr.conf
  podman exec "$n" chown frr:frr /etc/frr/frr.conf /etc/frr/daemons 2>/dev/null || true
  podman exec "$n" systemctl restart frr || podman exec "$n" service frr restart || true
}

write_er4_config_boot() {
  mkdir -p "$LAB_DIR/er4-config"
  cat > "$LAB_DIR/er4-config/config.boot" <<'BOOT'
interfaces {
    ethernet eth0 {
        address 10.0.0.2/24
        description "ISP modem LAN — only host"
    }
    ethernet eth1 {
        address 192.168.100.1/24
        description "Home LAN — GRE endpoints only"
    }
    loopback lo {
        address 10.254.0.1/32
    }
    tunnel tun0 {
        address 10.255.0.1/30
        description "GRE arch-minipc"
        encapsulation gre
        local-ip 192.168.100.1
        remote-ip 192.168.100.10
        mtu 1476
    }
    tunnel tun1 {
        address 10.255.0.5/30
        description "GRE pi5-alma"
        encapsulation gre
        local-ip 192.168.100.1
        remote-ip 192.168.100.20
        mtu 1476
    }
    tunnel tun2 {
        address 10.255.0.9/30
        description "GRE pizero2 Wi-Fi"
        encapsulation gre
        local-ip 192.168.100.1
        remote-ip 192.168.100.30
        mtu 1400
    }
    vti vti0 {
        address 10.255.1.1/30
        description "IPsec VTI vps-east"
        mtu 1400
    }
    vti vti1 {
        address 10.255.1.5/30
        description "IPsec VTI vps-west"
        mtu 1400
    }
    vti vti2 {
        address 10.255.1.9/30
        description "IPsec VTI vps-core"
        mtu 1400
    }
}
protocols {
    ospf {
        area 0 {
            network 10.254.0.1/32
            network 10.255.0.0/16
        }
        interface tun0 { network point-to-point }
        interface tun1 { network point-to-point }
        interface tun2 { network point-to-point }
        interface vti0 { network point-to-point }
        interface vti1 { network point-to-point }
        interface vti2 { network point-to-point }
        parameters {
            router-id 10.254.0.1
        }
        passive-interface lo
    }
    static {
        route 0.0.0.0/0 {
            next-hop 10.0.0.1 {
            }
        }
        route 203.0.113.0/24 {
            next-hop 10.0.0.1 {
            }
        }
    }
}
vpn {
    ipsec {
        esp-group ESP-LAB {
            compression disable
            lifetime 3600
            pfs dh-group14
            proposal 1 {
                encryption aes256
                hash sha256
            }
        }
        ike-group IKE-LAB {
            lifetime 28800
            proposal 1 {
                dh-group 14
                encryption aes256
                hash sha256
            }
        }
        ipsec-interfaces {
            interface eth0
        }
        nat-traversal enable
        site-to-site {
            peer 203.0.113.11 {
                authentication {
                    mode pre-shared-secret
                    pre-shared-secret lab-only-not-secret
                }
                ike-group IKE-LAB
                local-address 10.0.0.2
                vti {
                    bind vti0
                    esp-group ESP-LAB
                }
            }
            peer 203.0.113.12 {
                authentication {
                    mode pre-shared-secret
                    pre-shared-secret lab-only-not-secret
                }
                ike-group IKE-LAB
                local-address 10.0.0.2
                vti {
                    bind vti1
                    esp-group ESP-LAB
                }
            }
            peer 203.0.113.13 {
                authentication {
                    mode pre-shared-secret
                    pre-shared-secret lab-only-not-secret
                }
                ike-group IKE-LAB
                local-address 10.0.0.2
                vti {
                    bind vti2
                    esp-group ESP-LAB
                }
            }
        }
    }
}
service {
    ssh {
        port 22
    }
}
system {
    host-name er4
    login {
        user vyos {
            authentication {
                plaintext-password "vyos"
            }
            level admin
        }
    }
    syslog {
        global {
            facility all {
                level notice
            }
        }
    }
}
BOOT
}

# Drive VyOS with the real cfg wrapper (same as `configure` / `set` / `commit`).
vyos_sets() {
  local WRAP=/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper tmp
  podman exec er4 test -x "$WRAP" || { echo "    vyos wrapper not ready"; return 1; }
  tmp=$(mktemp)
  cat >"$tmp"
  {
    echo 'WRAP=/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper'
    echo '$WRAP begin || { $WRAP discard >/dev/null 2>&1 || true; $WRAP end >/dev/null 2>&1 || true; $WRAP begin; }'
    while IFS= read -r line; do
      [[ -z "$line" || "$line" == \#* ]] && continue
      printf '$WRAP %s || echo "    skip: %s"\n' "$line" "$line"
    done <"$tmp"
    echo '$WRAP commit || true'
    echo '$WRAP save'
    echo '$WRAP end'
  } | podman exec -i er4 /bin/bash -s
  rm -f "$tmp"
}

vyos_apply() {
  log "VyOS 1.3 configure (set / commit / save)"
  vyos_sets <<'EOF'
set interfaces ethernet eth0 address 10.0.0.2/24
set interfaces ethernet eth0 description 'ISP modem LAN'
set interfaces ethernet eth1 address 192.168.100.1/24
set interfaces ethernet eth1 description 'Home LAN GRE endpoints only'
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
set interfaces tunnel tun1 mtu 1476
set interfaces tunnel tun2 encapsulation gre
set interfaces tunnel tun2 local-ip 192.168.100.1
set interfaces tunnel tun2 remote-ip 192.168.100.30
set interfaces tunnel tun2 address 10.255.0.9/30
set interfaces tunnel tun2 mtu 1400
set interfaces vti vti0 address 10.255.1.1/30
set interfaces vti vti0 mtu 1400
set interfaces vti vti1 address 10.255.1.5/30
set interfaces vti vti1 mtu 1400
set interfaces vti vti2 address 10.255.1.9/30
set interfaces vti vti2 mtu 1400
set vpn ipsec ipsec-interfaces interface eth0
set vpn ipsec nat-traversal enable
set vpn ipsec ike-group IKE-LAB proposal 1 encryption aes256
set vpn ipsec ike-group IKE-LAB proposal 1 hash sha256
set vpn ipsec ike-group IKE-LAB proposal 1 dh-group 14
set vpn ipsec esp-group ESP-LAB proposal 1 encryption aes256
set vpn ipsec esp-group ESP-LAB proposal 1 hash sha256
set vpn ipsec site-to-site peer 203.0.113.11 authentication mode pre-shared-secret
set vpn ipsec site-to-site peer 203.0.113.11 authentication pre-shared-secret lab-only-not-secret
set vpn ipsec site-to-site peer 203.0.113.11 ike-group IKE-LAB
set vpn ipsec site-to-site peer 203.0.113.11 local-address 10.0.0.2
set vpn ipsec site-to-site peer 203.0.113.11 vti bind vti0
set vpn ipsec site-to-site peer 203.0.113.11 vti esp-group ESP-LAB
set vpn ipsec site-to-site peer 203.0.113.12 authentication mode pre-shared-secret
set vpn ipsec site-to-site peer 203.0.113.12 authentication pre-shared-secret lab-only-not-secret
set vpn ipsec site-to-site peer 203.0.113.12 ike-group IKE-LAB
set vpn ipsec site-to-site peer 203.0.113.12 local-address 10.0.0.2
set vpn ipsec site-to-site peer 203.0.113.12 vti bind vti1
set vpn ipsec site-to-site peer 203.0.113.12 vti esp-group ESP-LAB
set vpn ipsec site-to-site peer 203.0.113.13 authentication mode pre-shared-secret
set vpn ipsec site-to-site peer 203.0.113.13 authentication pre-shared-secret lab-only-not-secret
set vpn ipsec site-to-site peer 203.0.113.13 ike-group IKE-LAB
set vpn ipsec site-to-site peer 203.0.113.13 local-address 10.0.0.2
set vpn ipsec site-to-site peer 203.0.113.13 vti bind vti2
set vpn ipsec site-to-site peer 203.0.113.13 vti esp-group ESP-LAB
set protocols ospf parameters router-id 10.254.0.1
set protocols ospf area 0 network 10.254.0.1/32
set protocols ospf area 0 network 10.255.0.0/16
set protocols ospf interface tun0 network point-to-point
set protocols ospf interface tun1 network point-to-point
set protocols ospf interface tun2 network point-to-point
set protocols ospf interface vti0 network point-to-point
set protocols ospf interface vti1 network point-to-point
set protocols ospf interface vti2 network point-to-point
set protocols ospf passive-interface lo
set protocols static route 0.0.0.0/0 next-hop 10.0.0.1
set protocols static route 203.0.113.0/24 next-hop 10.0.0.1
EOF
}

# Rootless userns often has no XFRM — stand WAN up as GRE tun3/4/5 if VTI never appears.
vyos_wan_fix() {
  if podman exec er4 ip link show vti0 >/dev/null 2>&1 \
     && podman exec er4 ping -c 1 -W 2 10.255.1.2 >/dev/null 2>&1; then
    log "VyOS VTI east is up"
    return
  fi
  log "VyOS VTI/IPsec not passing in userns — GRE tun3/4/5 stand-in (same /30s)"
  vyos_sets <<'EOF' || true
set interfaces tunnel tun3 encapsulation gre
set interfaces tunnel tun3 local-ip 10.0.0.2
set interfaces tunnel tun3 remote-ip 203.0.113.11
set interfaces tunnel tun3 address 10.255.1.1/30
set interfaces tunnel tun3 mtu 1400
set interfaces tunnel tun4 encapsulation gre
set interfaces tunnel tun4 local-ip 10.0.0.2
set interfaces tunnel tun4 remote-ip 203.0.113.12
set interfaces tunnel tun4 address 10.255.1.5/30
set interfaces tunnel tun4 mtu 1400
set interfaces tunnel tun5 encapsulation gre
set interfaces tunnel tun5 local-ip 10.0.0.2
set interfaces tunnel tun5 remote-ip 203.0.113.13
set interfaces tunnel tun5 address 10.255.1.9/30
set interfaces tunnel tun5 mtu 1400
set protocols ospf interface tun3 network point-to-point
set protocols ospf interface tun4 network point-to-point
set protocols ospf interface tun5 network point-to-point
EOF
  # VPS already has GRE-or-VTI named vti0 from vps_underlay
}

vyos_op() {
  local wrap=/opt/vyatta/bin/vyos-op-cmd-wrapper
  if podman exec er4 test -x "$wrap"; then
    podman exec er4 "$wrap" "$@"
  else
    podman exec er4 vtysh -c "$*" || podman exec -u vyos er4 /bin/vbash -c "run $*"
  fi
}

write_vtep_frr() {
  local n="$1" rid="$2" rr="$3"
  local tun=gre0
  case "$n" in vps-*) tun=vti0 ;; esac
  local rr_block af_extra lo_block
  if [[ "$rr" == "yes" ]]; then
    rr_block=" neighbor 10.254.0.20 peer-group VTEP
 neighbor 10.254.0.30 peer-group VTEP
 neighbor 10.254.0.11 peer-group VTEP
 neighbor 10.254.0.12 peer-group VTEP
 neighbor 10.254.0.13 peer-group VTEP"
    af_extra="  neighbor VTEP route-reflector-client"
  else
    rr_block=" neighbor 10.254.0.10 peer-group VTEP"
    af_extra=""
  fi
  if [[ "$n" == "arch-minipc" ]]; then
    lo_block="interface lo
 ! ${rid}/32 from systemd-networkd
exit"
  else
    lo_block="interface lo
 ip address ${rid}/32
exit"
  fi
  install_frr "$n" <<EOF
frr version 10.4
frr defaults datacenter
hostname $n
service integrated-vtysh-config
vrf vrf-svc
 vni 20010
exit-vrf
vrf vrf-lab
 vni 20020
exit-vrf
vrf vrf-iot
 vni 20030
exit-vrf
vrf vrf-pub
 vni 20040
exit-vrf
${lo_block}
interface ${tun}
 ip ospf network point-to-point
 ip ospf bfd
exit
router ospf
 ospf router-id ${rid}
 network ${rid}/32 area 0
 network 10.255.0.0/16 area 0
 passive-interface lo
exit
router bgp 64512
 bgp router-id ${rid}
 no bgp ebgp-requires-policy
 no bgp default ipv4-unicast
 neighbor VTEP peer-group
 neighbor VTEP remote-as 64512
 neighbor VTEP capability extended-nexthop
 neighbor VTEP update-source lo
 neighbor VTEP bfd
${rr_block}
 address-family ipv4 unicast
  neighbor VTEP activate
  network ${rid}/32
 exit-address-family
 address-family l2vpn evpn
  neighbor VTEP activate
${af_extra}
  advertise-all-vni
  advertise-svi-ip
 exit-address-family
exit
router bgp 64512 vrf vrf-svc
 address-family ipv4 unicast
  redistribute connected
 exit-address-family
 address-family l2vpn evpn
  advertise ipv4 unicast
 exit-address-family
exit
router bgp 64512 vrf vrf-lab
 address-family ipv4 unicast
  redistribute connected
 exit-address-family
 address-family l2vpn evpn
  advertise ipv4 unicast
 exit-address-family
exit
router bgp 64512 vrf vrf-iot
 address-family ipv4 unicast
  redistribute connected
 exit-address-family
 address-family l2vpn evpn
  advertise ipv4 unicast
 exit-address-family
exit
router bgp 64512 vrf vrf-pub
 address-family ipv4 unicast
  redistribute connected
 exit-address-family
 address-family l2vpn evpn
  advertise ipv4 unicast
 exit-address-family
exit
EOF
}

overlay_frr() {
  log "FRR EVPN on VTEPs (er4 is VyOS — no FRR file drop)"
  write_vtep_frr arch-minipc 10.254.0.10 yes
  write_vtep_frr pi5-alma    10.254.0.20 no
  write_vtep_frr pizero2     10.254.0.30 no
  write_vtep_frr vps-east    10.254.0.11 no
  write_vtep_frr vps-west    10.254.0.12 no
  write_vtep_frr vps-core    10.254.0.13 no
}

# --- commands --------------------------------------------------------------

cmd_up() {
  preflight
  build_images
  nets_up
  containers_up
  isp_nat
  gre_up
  vyos_apply || true
  vti_up
  vyos_wan_fix || true
  overlay_dataplane
  firewall_up
  overlay_frr
  caddy_up
  echo $$ > "$LAB_DIR/state/up.pid"
  log "fabric up"
  echo
  echo "  ./labctl status"
  echo "  ./labctl check"
  echo "  ./labctl vyos show ip ospf neighbor"
  echo "  ./labctl vtysh arch-minipc show bgp l2vpn evpn"
  echo "  ./labctl down"
}

cmd_down() {
  log "tearing down"
  containers_down
  nets_down
  rm -f "$LAB_DIR/state/up.pid"
  log "fabric down"
}

cmd_status() {
  echo "Podman: $(podman version -f '{{.Client.Version}}' 2>/dev/null || echo missing)"
  echo
  local n
  for n in "${nodes[@]}"; do
    if podman container exists "$n" 2>/dev/null; then
      printf "  %-14s %s\n" "$n" "$(podman inspect -f '{{.State.Status}}' "$n")"
    else
      printf "  %-14s absent\n" "$n"
    fi
  done
  echo
  podman network ls --filter name=svd- || true
  echo
  if podman container exists arch-minipc 2>/dev/null; then
    echo "Arch networkctl:"
    podman exec arch-minipc networkctl --no-pager 2>/dev/null || true
    echo
    echo "Underlay pings from arch-minipc:"
    local ip
    for ip in 10.255.0.1 10.254.0.1 10.254.0.20 10.254.0.11; do
      if podman exec arch-minipc ping -c 1 -W 2 "$ip" >/dev/null 2>&1; then
        printf "  %-16s ok\n" "$ip"
      else
        printf "  %-16s FAIL\n" "$ip"
      fi
    done
  fi
}

cmd_check() {
  podman container exists arch-minipc || die "lab is down"
  echo "--- OSPF (er4 VyOS) ---"
  vyos_op show ip ospf neighbor || true
  echo
  echo "--- VyOS interfaces ---"
  vyos_op show interfaces || true
  echo
  echo "--- BGP EVPN (arch-minipc RR) ---"
  podman exec arch-minipc vtysh -c "show bgp l2vpn evpn summary" || true
  echo
  echo "--- EVPN VNI ---"
  podman exec arch-minipc vtysh -c "show evpn vni" || true
  echo
  echo "--- Type-5 / inner httpd (arch ctr or www-svc) ---"
  podman exec arch-minipc curl -sf --max-time 3 http://10.88.10.10/ || \
    podman exec arch-minipc ip netns exec ctr-svc ping -c 1 -W 2 10.88.13.10 || true
  echo
  echo "--- internal Caddy (192.168.100.10 private) ---"
  podman exec arch-minipc curl -sf --max-time 3 http://127.0.0.1/svc/ || true
  echo
  echo "--- WAN Caddy (203.0.113.13 public VNI only) ---"
  podman exec vps-core curl -sf --max-time 3 http://127.0.0.1/core/ || true
}

cmd_vtysh() {
  local n="${1:-}"; shift || true
  [[ -n "$n" ]] || die "vtysh <node> [cmd]"
  if [[ "$n" == er4 ]]; then
    if (( $# )); then vyos_op "$@"; else podman exec -it -u vyos er4 /bin/vbash; fi
    return
  fi
  if (( $# )); then
    podman exec "$n" vtysh -c "$*"
  else
    podman exec -it "$n" vtysh
  fi
}

cmd_vyos() {
  [[ $# -gt 0 ]] || die "vyos <op-mode command...>"
  vyos_op "$@"
}

cmd_exec() {
  local n="${1:-}"; shift || true
  [[ -n "$n" ]] || die "exec <node> <command>"
  podman exec -it "$n" "$@"
}

case "${1:-help}" in
  up) cmd_up ;;
  down|destroy) cmd_down ;;
  status) cmd_status ;;
  check) cmd_check ;;
  build) preflight; build_images ;;
  vtysh) shift; cmd_vtysh "$@" ;;
  vyos) shift; cmd_vyos "$@" ;;
  exec) shift; cmd_exec "$@" ;;
  help|-h|--help)
    sed -n '2,24p' "$0"
    ;;
  *) die "unknown command ${1:-} (try: up | down | status | check | vtysh | vyos | exec | build)" ;;
esac
