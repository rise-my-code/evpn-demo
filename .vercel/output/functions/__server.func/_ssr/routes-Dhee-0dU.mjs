import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as Download } from "../_libs/lucide-react.mjs";
import { i as Slot } from "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./router-uOM5_hVi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Dhee-0dU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Card({ title, sub, ip, note, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("min-w-0 rounded-md border px-4 py-3 text-center", accent ? "border-accent/40 bg-surface-2" : "border-border bg-surface"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium text-fg",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: sub
			}),
			ip ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-mono text-xs text-faint",
				children: ip
			}) : null,
			note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-faint",
				children: note
			}) : null
		]
	});
}
function Spine({ label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center py-2",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-5 w-px bg-border" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-1 font-mono text-xs text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-5 w-px bg-border" })
		]
	});
}
function PhysicalDiagram() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-bg p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-4 font-mono text-xs uppercase tracking-widest text-muted",
				children: "Physical"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-2 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "VPS east",
						sub: "Ubuntu 24.04",
						ip: "203.0.113.11"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "VPS core",
						sub: "Ubuntu 26.04 · WAN Caddy",
						ip: "203.0.113.13"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "VPS west",
						sub: "Ubuntu 24.04",
						ip: "203.0.113.12"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spine, { label: "WAN · IPsec" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto max-w-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					title: "ISP modem",
					sub: "Alpine · nftables NAT",
					ip: "10.0.0.1 / 203.0.113.2",
					note: "Only the router sits on the modem LAN"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spine, { label: "modem LAN 10.0.0.0/24" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto max-w-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					title: "ER4",
					sub: "VyOS 1.3 image · EdgeOS 3.0.1 personality",
					ip: "10.0.0.2 · 192.168.100.1",
					note: "set / commit. GRE tun0-2, IPsec VTI. No VXLAN.",
					accent: true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spine, { label: "lab home LAN 192.168.100.0/24 · GRE endpoints only" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-2 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "Arch miniPC",
						sub: "Arch · systemd-networkd",
						ip: "192.168.100.10",
						note: "Podman host + EVPN RR"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "Pi 5",
						sub: "AlmaLinux 10",
						ip: "192.168.100.20"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "Pi Zero 2",
						sub: "Pi OS · Wi-Fi",
						ip: "192.168.100.30"
					})
				]
			})
		]
	});
}
function UnderlayDiagram() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-bg p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 font-mono text-xs uppercase tracking-widest text-muted",
				children: "Underlay"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-4 max-w-prose text-sm text-muted",
				children: "ER4 is the hub. OSPF area 0 on GRE and VTI only. Loopbacks in 10.254.0.0/24 are VTEP IPs. Home LAN never carries EVPN."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "ER4"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "Remote"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "Tunnel net"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "Endpoints"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "font-mono text-xs text-fg",
						children: [
							[
								"er4 tun0",
								"arch-minipc gre0",
								"10.255.0.0/30",
								"192.168.100.1 ↔ .10"
							],
							[
								"er4 tun1",
								"pi5-alma gre0",
								"10.255.0.4/30",
								"192.168.100.1 ↔ .20"
							],
							[
								"er4 tun2",
								"pizero2 gre0",
								"10.255.0.8/30",
								"192.168.100.1 ↔ .30 · Wi-Fi"
							],
							[
								"er4 vti0",
								"vps-east vti0",
								"10.255.1.0/30",
								"10.0.0.2 ↔ 203.0.113.11"
							],
							[
								"er4 vti1",
								"vps-west vti0",
								"10.255.1.4/30",
								"10.0.0.2 ↔ 203.0.113.12"
							],
							[
								"er4 vti2",
								"vps-core vti0",
								"10.255.1.8/30",
								"10.0.0.2 ↔ 203.0.113.13"
							]
						].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
							className: "border-b border-border/60",
							children: r.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2 pr-3 align-top",
								children: c
							}, c))
						}, r[2]))
					})]
				})
			})
		]
	});
}
function OverlayDiagram() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-bg p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 font-mono text-xs uppercase tracking-widest text-muted",
				children: "Overlay · BGP-EVPN"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-4 max-w-prose text-sm text-muted",
				children: [
					"iBGP AS 64512. Arch is route-reflector. ER4 is not a VTEP. Each VTEP has one SVD",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-fg",
						children: " vxlan0"
					}),
					" (external + vnifilter)."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "arch-minipc",
						sub: "RR + internal Caddy",
						ip: "10.254.0.10",
						note: "private VNIs",
						accent: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "pi5-alma",
						sub: "VTEP",
						ip: "10.254.0.20",
						note: "priv + pub"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "pizero2",
						sub: "VTEP-lite",
						ip: "10.254.0.30",
						note: "iot private only"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "vps-east",
						sub: "VTEP",
						ip: "10.254.0.11",
						note: "svc lab pub"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "vps-west",
						sub: "VTEP",
						ip: "10.254.0.12",
						note: "svc + pub"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "vps-core",
						sub: "VTEP + WAN Caddy",
						ip: "10.254.0.13",
						note: "public RT 64512:40"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-center text-sm text-faint",
				children: "ER4 stays on the underlay. No vxlan0."
			})
		]
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-[opacity,transform,background-color,border-color,color] duration-[var(--motion-quick,150ms)] ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:opacity-90",
			secondary: "bg-surface-2 text-fg border border-border hover:border-muted",
			ghost: "text-muted hover:text-fg hover:bg-surface-2",
			outline: "border border-border bg-transparent text-fg hover:bg-surface-2",
			destructive: "bg-down/15 text-down border border-down/30 hover:bg-down/25"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-xs",
			lg: "h-12 px-5",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var labctl_default = "#!/usr/bin/env bash\n# SVD Fabric — rootless Podman BGP-EVPN lab\n# Intended host: Arch miniPC, Podman 6.1. Outer nodes are rootful/privileged.\n# Lab LANs are netavark bridges with host addresses flushed (isolated from the\n# house 192.168.1.0/24). Inner httpd is rootless Podman as user `pod`.\n#\n#   ./labctl up        networks, systemd containers, GRE/VTI, SVD, FRR\n#   ./labctl down      reverse\n#   ./labctl status    containers + underlay pings\n#   ./labctl check     OSPF / EVPN / tenant ping\n#   ./labctl vyos <op-cmd...>   VyOS op-mode on er4 (show interfaces, …)\n#   ./labctl vtysh <node> [command...]\n#   ./labctl exec  <node> <command...>\n#   ./labctl build     images only\n#\n# Nodes: isp, er4, arch-minipc, pi5-alma, pizero2, vps-east, vps-west, vps-core\n#\n# Underlay is GRE (home) + IPsec-VTI-or-GRE (WAN). Home LAN 192.168.100.0/24 is\n# only GRE endpoints so a LAN renumber touches two IPs, not the EVPN fabric.\n# Arch dataplane is systemd-networkd (External=+VNIFilter=). Other VTEPs use\n# iproute2 SVD. ER4 is docker.io/vyos/image:1.3 — underlay hub, no VXLAN.\nset -euo pipefail\n\nROOT=$(cd \"$(dirname \"$0\")\" && pwd)\nexport LAB_DIR=\"${LAB_DIR:-$HOME/.local/share/svd-fabric}\"\nVYOS_IMAGE=\"${VYOS_IMAGE:-docker.io/vyos/image:1.3}\"\nmkdir -p \"$LAB_DIR\"/{images,state,logs,er4-config}\n\ndie() { echo \"labctl: $*\" >&2; exit 1; }\nneed() { command -v \"$1\" >/dev/null || die \"missing $1\"; }\nlog() { printf '==> %s\\n' \"$*\"; }\n\nnodes=(isp er4 arch-minipc pi5-alma pizero2 vps-east vps-west vps-core)\nvteps=(arch-minipc pi5-alma pizero2 vps-east vps-west vps-core)\n\nexecn() { podman exec \"$1\" bash -lc \"$2\"; }\n\nput() {\n  local n=\"$1\" path=\"$2\"\n  podman exec \"$n\" mkdir -p \"$(dirname \"$path\")\"\n  podman exec -i \"$n\" tee \"$path\" >/dev/null\n}\n\npreflight() {\n  need podman\n  podman info >/dev/null 2>&1 || die \"podman info failed — is the user lingering / user.session up?\"\n  local ver\n  ver=$(podman version -f '{{.Client.Version}}' 2>/dev/null || echo unknown)\n  log \"podman $ver  labdir $LAB_DIR\"\n  if [[ $(id -u) -eq 0 ]]; then\n    echo \"    rootful hypervisor: lab bridges are L2-only (host IPs flushed). Isolated from house LAN.\"\n  else\n    echo \"    rootless hypervisor: OK, but GRE/OSPF/broadcast on a shared LAN is closer to the house as root.\"\n  fi\n  local m\n  for m in vxlan ip_gre dummy vrf 8021q; do\n    if [[ ! -d /sys/module/$m ]]; then\n      echo \"    warn: kernel module $m is not loaded (root: modprobe $m)\"\n    fi\n  done\n}\n\n# --- images (Containerfile per OS, buildah bud) ----------------------------\n\nwrite_containerfiles() {\n  local d=\"$LAB_DIR/containerfiles\"\n  mkdir -p \"$d\"\n\n  cat >\"$d/svd-firewall.sh\" <<'EOF'\n#!/usr/bin/env bash\n# Trust underlay + SVD. Do not let firewalld/ufw into the bridge.\n# Tenant isolation is VRF + VNI, not the host filter.\nset -euo pipefail\nsysctl -w net.ipv4.ip_forward=1 >/dev/null || true\nsysctl -w net.bridge.bridge-nf-call-iptables=0 >/dev/null 2>&1 || true\nsysctl -w net.bridge.bridge-nf-call-ip6tables=0 >/dev/null 2>&1 || true\n\ntrust=()\nfor i in lo gre0 gre1 gre2 vti0 vti1 vti2 vxlan0 br0; do\n  ip link show \"$i\" >/dev/null 2>&1 && trust+=(\"$i\")\ndone\nwhile read -r i; do\n  [[ -n \"$i\" ]] && trust+=(\"$i\")\ndone < <(ip -o link show 2>/dev/null | awk -F': ' '{print $2}' | cut -d'@' -f1 | grep -E '^(vrf-|ce-|pn-|veth-|.*-irb$)' || true)\n\nif command -v firewall-cmd >/dev/null 2>&1; then\n  systemctl start firewalld >/dev/null 2>&1 || true\n  firewall-cmd --permanent --zone=public --add-service=ssh >/dev/null 2>&1 || true\n  firewall-cmd --permanent --zone=public --add-protocol=gre >/dev/null 2>&1 || true\n  for i in \"${trust[@]}\"; do\n    firewall-cmd --permanent --zone=trusted --add-interface=\"$i\" >/dev/null 2>&1 || true\n    firewall-cmd --zone=trusted --add-interface=\"$i\" >/dev/null 2>&1 || true\n  done\n  firewall-cmd --reload >/dev/null 2>&1 || true\nelif command -v ufw >/dev/null 2>&1; then\n  ufw --force reset >/dev/null 2>&1 || true\n  ufw default deny incoming >/dev/null\n  ufw default allow outgoing >/dev/null\n  ufw allow 22/tcp >/dev/null || true\n  ufw allow proto gre >/dev/null 2>&1 || true\n  for i in \"${trust[@]}\"; do\n    ufw allow in on \"$i\" >/dev/null 2>&1 || true\n  done\n  ufw --force enable >/dev/null 2>&1 || true\nfi\nEOF\n  chmod +x \"$d/svd-firewall.sh\"\n\n  cat >\"$d/svd-firewall.service\" <<'EOF'\n[Unit]\nDescription=SVD trust GRE/VTI/SVD on firewalld or ufw\nAfter=network-online.target systemd-networkd.service frr.service\nWants=network-online.target\n\n[Service]\nType=oneshot\nRemainAfterExit=yes\nExecStart=/usr/local/lib/svd-firewall.sh\n\n[Install]\nWantedBy=multi-user.target\nEOF\n\n  cat >\"$d/storage.conf\" <<'EOF'\n[storage]\ndriver = \"vfs\"\nrunroot = \"/run/containers/storage\"\ngraphroot = \"/var/lib/containers/storage\"\nEOF\n  cat >\"$d/containers.conf\" <<'EOF'\n[engine]\ncgroup_manager = \"cgroupfs\"\nevents_logger = \"file\"\nEOF\n\n  cat >\"$d/isp.Containerfile\" <<'EOF'\nFROM docker.io/library/alpine:3.20\nRUN apk add --no-cache nftables iproute2 iputils bash\nCMD [\"sleep\", \"infinity\"]\nEOF\n\n  cat >\"$d/arch.Containerfile\" <<'EOF'\nFROM docker.io/library/archlinux:latest\nENV container=docker\nCOPY svd-firewall.sh /usr/local/lib/svd-firewall.sh\nCOPY svd-firewall.service /etc/systemd/system/svd-firewall.service\nCOPY storage.conf /etc/containers/storage.conf\nCOPY containers.conf /etc/containers/containers.conf\nRUN pacman-key --init && pacman-key --populate archlinux \\\n && pacman -Sy --noconfirm --needed systemd systemd-sysvcompat dbus iproute2 \\\n      frr python tcpdump iputils firewalld podman catatonit netavark aardvark-dns \\\n && mkdir -p /etc/systemd/networkd.conf.d /etc/systemd/network \\\n && chmod +x /usr/local/lib/svd-firewall.sh \\\n && useradd -m -u 1000 -s /bin/bash pod \\\n && echo 'pod:100000:65536' >> /etc/subuid \\\n && echo 'pod:100000:65536' >> /etc/subgid \\\n && mkdir -p /home/pod/.config/containers /run/user/1000 \\\n && cp /etc/containers/storage.conf /home/pod/.config/containers/storage.conf \\\n && chown -R pod:pod /home/pod \\\n && systemctl enable systemd-networkd frr dbus firewalld svd-firewall.service \\\n && systemctl mask systemd-networkd-wait-online.service getty@tty1.service\nSTOPSIGNAL SIGRTMIN+3\nCMD [\"/usr/lib/systemd/systemd\"]\nEOF\n\n  cat >\"$d/alma10.Containerfile\" <<'EOF'\nFROM docker.io/library/almalinux:10\nENV container=oci\nCOPY svd-firewall.sh /usr/local/lib/svd-firewall.sh\nCOPY svd-firewall.service /etc/systemd/system/svd-firewall.service\nCOPY storage.conf /etc/containers/storage.conf\nCOPY containers.conf /etc/containers/containers.conf\nRUN dnf -y install systemd dbus iproute iputils tcpdump procps-ng firewalld python3 podman \\\n && (dnf -y install epel-release && dnf -y install frr frr-pythontools || dnf -y install frr) \\\n && dnf clean all \\\n && chmod +x /usr/local/lib/svd-firewall.sh \\\n && useradd -m -u 1000 -s /bin/bash pod \\\n && echo 'pod:100000:65536' >> /etc/subuid \\\n && echo 'pod:100000:65536' >> /etc/subgid \\\n && mkdir -p /home/pod/.config/containers \\\n && cp /etc/containers/storage.conf /home/pod/.config/containers/storage.conf \\\n && chown -R pod:pod /home/pod \\\n && systemctl enable frr dbus firewalld svd-firewall.service \\\n && systemctl mask systemd-networkd-wait-online.service\nSTOPSIGNAL SIGRTMIN+3\nCMD [\"/usr/lib/systemd/systemd\"]\nEOF\n\n  cat >\"$d/pios.Containerfile\" <<'EOF'\n# Pi OS userspace stand-in (Debian 12). Lab hypervisor is x86_64; this is not an ARM image.\nFROM docker.io/library/debian:12\nENV container=docker DEBIAN_FRONTEND=noninteractive\nCOPY svd-firewall.sh /usr/local/lib/svd-firewall.sh\nCOPY svd-firewall.service /etc/systemd/system/svd-firewall.service\nCOPY storage.conf /etc/containers/storage.conf\nCOPY containers.conf /etc/containers/containers.conf\nRUN apt-get update && apt-get install -y --no-install-recommends \\\n      systemd systemd-sysv dbus frr frr-pythontools ufw podman uidmap \\\n      iproute2 iputils-ping tcpdump bridge-utils procps ca-certificates python3 \\\n && rm -rf /var/lib/apt/lists/* \\\n && chmod +x /usr/local/lib/svd-firewall.sh \\\n && useradd -m -u 1000 -s /bin/bash pod \\\n && echo 'pod:100000:65536' >> /etc/subuid \\\n && echo 'pod:100000:65536' >> /etc/subgid \\\n && mkdir -p /home/pod/.config/containers \\\n && cp /etc/containers/storage.conf /home/pod/.config/containers/storage.conf \\\n && chown -R pod:pod /home/pod \\\n && systemctl enable frr dbus ufw svd-firewall.service \\\n && systemctl mask systemd-networkd-wait-online.service\nSTOPSIGNAL SIGRTMIN+3\nCMD [\"/usr/lib/systemd/systemd\"]\nEOF\n\n  cat >\"$d/ubuntu2404.Containerfile\" <<'EOF'\nFROM docker.io/library/ubuntu:24.04\nENV container=docker DEBIAN_FRONTEND=noninteractive\nCOPY svd-firewall.sh /usr/local/lib/svd-firewall.sh\nCOPY svd-firewall.service /etc/systemd/system/svd-firewall.service\nCOPY storage.conf /etc/containers/storage.conf\nCOPY containers.conf /etc/containers/containers.conf\nRUN apt-get update && apt-get install -y --no-install-recommends \\\n      systemd systemd-sysv dbus frr frr-pythontools ufw podman uidmap \\\n      iproute2 iputils-ping tcpdump bridge-utils procps ca-certificates python3 \\\n && rm -rf /var/lib/apt/lists/* \\\n && chmod +x /usr/local/lib/svd-firewall.sh \\\n && useradd -m -u 1000 -s /bin/bash pod \\\n && echo 'pod:100000:65536' >> /etc/subuid \\\n && echo 'pod:100000:65536' >> /etc/subgid \\\n && mkdir -p /home/pod/.config/containers \\\n && cp /etc/containers/storage.conf /home/pod/.config/containers/storage.conf \\\n && chown -R pod:pod /home/pod \\\n && systemctl enable frr dbus ufw svd-firewall.service \\\n && systemctl mask systemd-networkd-wait-online.service\nSTOPSIGNAL SIGRTMIN+3\nCMD [\"/usr/lib/systemd/systemd\"]\nEOF\n\n  cat >\"$d/ubuntu2604.Containerfile\" <<'EOF'\nFROM docker.io/library/ubuntu:26.04\nENV container=docker DEBIAN_FRONTEND=noninteractive\nCOPY svd-firewall.sh /usr/local/lib/svd-firewall.sh\nCOPY svd-firewall.service /etc/systemd/system/svd-firewall.service\nCOPY storage.conf /etc/containers/storage.conf\nCOPY containers.conf /etc/containers/containers.conf\nRUN apt-get update && apt-get install -y --no-install-recommends \\\n      systemd systemd-sysv dbus frr frr-pythontools ufw podman uidmap \\\n      iproute2 iputils-ping tcpdump bridge-utils procps ca-certificates python3 \\\n && rm -rf /var/lib/apt/lists/* \\\n && chmod +x /usr/local/lib/svd-firewall.sh \\\n && useradd -m -u 1000 -s /bin/bash pod \\\n && echo 'pod:100000:65536' >> /etc/subuid \\\n && echo 'pod:100000:65536' >> /etc/subgid \\\n && mkdir -p /home/pod/.config/containers \\\n && cp /etc/containers/storage.conf /home/pod/.config/containers/storage.conf \\\n && chown -R pod:pod /home/pod \\\n && systemctl enable frr dbus ufw svd-firewall.service \\\n && systemctl mask systemd-networkd-wait-online.service\nSTOPSIGNAL SIGRTMIN+3\nCMD [\"/usr/lib/systemd/systemd\"]\nEOF\n}\n\nbud() {\n  local tag=\"$1\" file=\"$2\"\n  log \"buildah $tag  ($file)\"\n  if command -v buildah >/dev/null 2>&1; then\n    buildah bud --layers -t \"$tag\" -f \"$LAB_DIR/containerfiles/$file\" \"$LAB_DIR/containerfiles\"\n  else\n    echo \"    buildah not on PATH — podman build\"\n    podman build -t \"$tag\" -f \"$LAB_DIR/containerfiles/$file\" \"$LAB_DIR/containerfiles\"\n  fi\n}\n\nbuild_images() {\n  need podman\n  write_containerfiles\n  bud localhost/svd-isp:lab    isp.Containerfile\n  log \"pulling VyOS 1.3 ($VYOS_IMAGE)\"\n  podman pull \"$VYOS_IMAGE\"\n  podman tag \"$VYOS_IMAGE\" localhost/svd-edge:lab\n  bud localhost/svd-arch:lab   arch.Containerfile\n  bud localhost/svd-alma:lab   alma10.Containerfile\n  bud localhost/svd-pios:lab   pios.Containerfile\n  bud localhost/svd-u2404:lab  ubuntu2404.Containerfile\n  bud localhost/svd-u2604:lab  ubuntu2604.Containerfile\n  log \"images ready\"\n}\n\nfirewall_up() {\n  log \"firewalld/ufw — trust GRE/VTI/SVD, leave public on lab veth\"\n  local n\n  for n in arch-minipc pi5-alma pizero2 vps-east vps-west vps-core; do\n    podman exec \"$n\" /usr/local/lib/svd-firewall.sh 2>/dev/null \\\n      || echo \"    warn: firewall apply failed on $n\"\n  done\n}\n\n# --- netavark bridges (rootful L2, host IPs stripped) ----------------------\n# Shared LANs are real linux bridges, not pasta. Pasta is a userspace L3\n# proxy — no ARP flood, GRE/OSPF/VXLAN look wrong. A bridge is a switch.\n# Rootful: the bridge appears on the hypervisor. We flush its address so\n# this box (already on 192.168.1.0/24 in the house) does not join the lab\n# subnet. IPs live only in the node containers.\n\nnets_up() {\n  log \"podman networks (internal L2, isolate from host)\"\n  podman network exists svd-isp-lan  || podman network create --internal --opt isolate=true --subnet 10.0.0.0/24    --gateway 10.0.0.254    svd-isp-lan\n  podman network exists svd-wan      || podman network create --internal --opt isolate=true --subnet 203.0.113.0/24 --gateway 203.0.113.254 svd-wan\n  podman network exists svd-home-lan || podman network create --internal --opt isolate=true --subnet 192.168.100.0/24 --gateway 192.168.100.254 svd-home-lan\n  isolate_lab_bridges\n}\n\nisolate_lab_bridges() {\n  [[ $(id -u) -eq 0 ]] || return 0\n  log \"flush host addresses on lab bridges (lab 192.168.100.0/24 stays off house 192.168.1.0/24)\"\n  local net br\n  for net in svd-isp-lan svd-wan svd-home-lan; do\n    br=$(podman network inspect \"$net\" -f '{{.NetworkInterface}}' 2>/dev/null) || continue\n    [[ -n \"$br\" ]] || continue\n    ip addr flush dev \"$br\" 2>/dev/null || true\n    ip link set \"$br\" up 2>/dev/null || true\n    sysctl -w \"net.ipv4.conf.${br//./\\/}.forwarding=0\" >/dev/null 2>&1 || \\\n      sysctl -w \"net.ipv4.conf.${br}.forwarding=0\" >/dev/null 2>&1 || true\n  done\n}\n\nnets_down() {\n  podman network rm --ignore svd-home-lan svd-wan svd-isp-lan || true\n}\n\nrun_systemd() {\n  local name=\"$1\" image=\"$2\"; shift 2\n  if podman container exists \"$name\"; then\n    podman start \"$name\" >/dev/null\n    return\n  fi\n  podman run -d --name \"$name\" --hostname \"$name\" \\\n    --systemd=always --cgroupns=host \\\n    --cap-add=NET_ADMIN --cap-add=NET_RAW --cap-add=NET_BIND_SERVICE \\\n    --device=/dev/net/tun \\\n    --sysctl net.ipv4.ip_forward=1 \\\n    --sysctl net.ipv4.conf.all.forwarding=1 \\\n    --sysctl net.ipv4.conf.all.rp_filter=0 \\\n    --security-opt label=disable \\\n    \"$@\" \"$image\"\n}\n\nrun_vyos() {\n  local name=\"$1\"; shift\n  write_er4_config_boot\n  if podman container exists \"$name\"; then\n    podman start \"$name\" >/dev/null\n    return\n  fi\n  local mods=()\n  [[ -d /lib/modules ]] && mods+=(-v /lib/modules:/lib/modules:ro)\n  # privileged = all caps in the userns (rootless). Host modules already loaded.\n  podman run -d --name \"$name\" --hostname \"$name\" \\\n    --privileged --systemd=always --cgroupns=host \\\n    --device=/dev/net/tun \\\n    --sysctl net.ipv4.ip_forward=1 \\\n    --sysctl net.ipv4.conf.all.forwarding=1 \\\n    --sysctl net.ipv4.conf.all.rp_filter=0 \\\n    --security-opt label=disable \\\n    -v \"$LAB_DIR/er4-config:/opt/vyatta/etc/config\" \\\n    \"${mods[@]}\" \\\n    \"$@\" \"$VYOS_IMAGE\" /sbin/init\n}\n\nwait_vyos() {\n  log \"waiting for VyOS 1.3 cli on er4\"\n  local i=0\n  until podman exec er4 test -x /opt/vyatta/sbin/vyatta-cfg-cmd-wrapper 2>/dev/null \\\n        || (( i++ > 90 )); do\n    sleep 1\n  done\n  i=0\n  until podman exec er4 systemctl is-active vyos-router >/dev/null 2>&1 \\\n        || podman exec er4 pgrep -x vyos-router >/dev/null 2>&1 \\\n        || (( i++ > 30 )); do\n    sleep 1\n  done\n}\n\nwait_systemd() {\n  local n=\"$1\" i=0\n  if [[ \"$n\" == isp ]]; then\n    podman exec \"$n\" true\n    return\n  fi\n  if [[ \"$n\" == er4 ]]; then\n    wait_vyos\n    return\n  fi\n  until podman exec \"$n\" systemctl is-system-running >/dev/null 2>&1 || (( i++ > 80 )); do\n    sleep 0.5\n  done\n}\n\ncontainers_up() {\n  log \"systemd containers\"\n  # iface order = --network order: eth0 first, eth1 second\n  run_systemd isp localhost/svd-isp:lab \\\n    --network svd-isp-lan:ip=10.0.0.1 --network svd-wan:ip=203.0.113.2\n\n  run_vyos er4 \\\n    --network svd-isp-lan:ip=10.0.0.2 --network svd-home-lan:ip=192.168.100.1\n\n  run_systemd arch-minipc localhost/svd-arch:lab \\\n    --privileged --security-opt seccomp=unconfined \\\n    --network svd-home-lan:ip=192.168.100.10\n\n  run_systemd pi5-alma localhost/svd-alma:lab \\\n    --privileged --security-opt seccomp=unconfined \\\n    --network svd-home-lan:ip=192.168.100.20\n\n  run_systemd pizero2 localhost/svd-pios:lab \\\n    --privileged --security-opt seccomp=unconfined \\\n    --network svd-home-lan:ip=192.168.100.30\n\n  run_systemd vps-east localhost/svd-u2404:lab \\\n    --privileged --security-opt seccomp=unconfined \\\n    --network svd-wan:ip=203.0.113.11\n\n  run_systemd vps-west localhost/svd-u2404:lab \\\n    --privileged --security-opt seccomp=unconfined \\\n    --network svd-wan:ip=203.0.113.12\n\n  run_systemd vps-core localhost/svd-u2604:lab \\\n    --privileged --security-opt seccomp=unconfined \\\n    --network svd-wan:ip=203.0.113.13\n\n  for n in \"${nodes[@]}\"; do wait_systemd \"$n\"; done\n}\n\ncontainers_down() {\n  for n in \"${nodes[@]}\"; do\n    podman rm -f \"$n\" >/dev/null 2>&1 || true\n  done\n}\n\nisp_nat() {\n  log \"ISP NAT 10.0.0.0/24 -> 203.0.113.2  + default routes\"\n  execn isp 'nft flush ruleset\nnft add table ip nat\nnft add chain ip nat postrouting { type nat hook postrouting priority 100 \\; }\nnft add rule ip nat postrouting oifname \"eth1\" ip saddr 10.0.0.0/24 masquerade\nnft add table ip filter\nnft add chain ip filter forward { type filter hook forward priority 0 \\; policy accept \\; }\nsysctl -w net.ipv4.ip_forward=1 >/dev/null'\n  execn arch-minipc 'ip route replace 0.0.0.0/0 via 192.168.100.1 || true'\n  execn pi5-alma    'ip route replace 0.0.0.0/0 via 192.168.100.1 || true'\n  execn pizero2     'ip route replace 0.0.0.0/0 via 192.168.100.1 || true'\n  for n in vps-east vps-west vps-core; do\n    execn \"$n\" 'ip route replace 0.0.0.0/0 via 203.0.113.2 || true\nip route replace 10.0.0.0/24 via 203.0.113.2 || true'\n  done\n}\n\n# --- Arch systemd-networkd -------------------------------------------------\n\narch_networkd_up() {\n  log \"Arch systemd-networkd (lo /32, GRE, br0, SVD vxlan0, VRF, IRB)\"\n  execn arch-minipc 'mkdir -p /etc/systemd/network /etc/systemd/networkd.conf.d /usr/local/lib /etc/systemd/system'\n\n  put arch-minipc /etc/systemd/networkd.conf.d/container.conf <<'EOF'\n[Network]\nManageForeignRoutes=no\nManageForeignRoutingPolicyRules=no\nEOF\n\n  put arch-minipc /etc/systemd/network/05-eth0.network <<'EOF'\n[Match]\nName=eth0\n\n[Link]\nUnmanaged=yes\nEOF\n\n  put arch-minipc /etc/systemd/network/10-lo.network <<'EOF'\n[Match]\nName=lo\n\n[Network]\nKeepConfiguration=static\nAddress=10.254.0.10/32\nEOF\n\n  put arch-minipc /etc/systemd/network/20-gre0.netdev <<'EOF'\n[NetDev]\nName=gre0\nKind=gre\nMTUBytes=1476\n\n[Tunnel]\nIndependent=yes\nLocal=192.168.100.10\nRemote=192.168.100.1\nTTL=64\nEOF\n\n  put arch-minipc /etc/systemd/network/20-gre0.network <<'EOF'\n[Match]\nName=gre0\n\n[Network]\nAddress=10.255.0.2/30\nIPv4Forwarding=yes\nConfigureWithoutCarrier=yes\nIPv6AcceptRA=no\nLinkLocalAddressing=no\nEOF\n\n  put arch-minipc /etc/systemd/network/30-br0.netdev <<'EOF'\n[NetDev]\nName=br0\nKind=bridge\n\n[Bridge]\nVLANFiltering=yes\nDefaultPVID=none\nSTP=no\nEOF\n\n  put arch-minipc /etc/systemd/network/30-br0.network <<'EOF'\n[Match]\nName=br0\n\n[Network]\nVLAN=svc-irb\nVLAN=lab-irb\nVLAN=iot-irb\nVLAN=pub-irb\nConfigureWithoutCarrier=yes\nIPv6AcceptRA=no\nLinkLocalAddressing=no\nEOF\n\n  put arch-minipc /etc/systemd/network/50-vxlan0.netdev <<'EOF'\n[NetDev]\nName=vxlan0\nKind=vxlan\nMTUBytes=1350\n\n[VXLAN]\nExternal=yes\nVNIFilter=yes\nIndependent=yes\nDestinationPort=4789\nLocal=10.254.0.10\nMacLearning=no\nEOF\n\n  put arch-minipc /etc/systemd/network/50-vxlan0.network <<'EOF'\n[Match]\nName=vxlan0\n\n[Network]\nBridge=br0\nConfigureWithoutCarrier=yes\nIPv6AcceptRA=no\nLinkLocalAddressing=no\n\n[Bridge]\nVLANTunnel=yes\nNeighborSuppression=yes\nLearning=no\n\n[BridgeVLAN]\nVLAN=10\n\n[BridgeVLAN]\nVLAN=1010\n\n[BridgeVLAN]\nVLAN=20\n\n[BridgeVLAN]\nVLAN=1020\n\n[BridgeVLAN]\nVLAN=30\n\n[BridgeVLAN]\nVLAN=1030\n\n[BridgeVLAN]\nVLAN=40\n\n[BridgeVLAN]\nVLAN=1040\nEOF\n\n  local t table=1100\n  for t in svc lab iot pub; do\n    put arch-minipc /etc/systemd/network/40-vrf-${t}.netdev <<EOF\n[NetDev]\nName=vrf-${t}\nKind=vrf\n\n[VRF]\nTableId=${table}\nEOF\n    put arch-minipc /etc/systemd/network/40-vrf-${t}.network <<EOF\n[Match]\nName=vrf-${t}\n\n[Network]\nConfigureWithoutCarrier=yes\nIPv6AcceptRA=no\nLinkLocalAddressing=no\nEOF\n    table=$((table + 1))\n  done\n\n  put arch-minipc /etc/systemd/network/60-svc-irb.netdev <<'EOF'\n[NetDev]\nName=svc-irb\nKind=vlan\n[VLAN]\nId=10\nEOF\n  put arch-minipc /etc/systemd/network/60-svc-irb.network <<'EOF'\n[Match]\nName=svc-irb\n[Network]\nVRF=vrf-svc\nAddress=172.16.10.1/24\nConfigureWithoutCarrier=yes\nIPv6AcceptRA=no\nLinkLocalAddressing=no\nEOF\n  put arch-minipc /etc/systemd/network/60-lab-irb.netdev <<'EOF'\n[NetDev]\nName=lab-irb\nKind=vlan\n[VLAN]\nId=20\nEOF\n  put arch-minipc /etc/systemd/network/60-lab-irb.network <<'EOF'\n[Match]\nName=lab-irb\n[Network]\nVRF=vrf-lab\nAddress=172.16.20.1/24\nConfigureWithoutCarrier=yes\nIPv6AcceptRA=no\nLinkLocalAddressing=no\nEOF\n  put arch-minipc /etc/systemd/network/60-iot-irb.netdev <<'EOF'\n[NetDev]\nName=iot-irb\nKind=vlan\n[VLAN]\nId=30\nEOF\n  put arch-minipc /etc/systemd/network/60-iot-irb.network <<'EOF'\n[Match]\nName=iot-irb\n[Network]\nVRF=vrf-iot\nAddress=172.16.30.1/24\nConfigureWithoutCarrier=yes\nIPv6AcceptRA=no\nLinkLocalAddressing=no\nEOF\n\n  put arch-minipc /etc/systemd/network/60-pub-irb.netdev <<'EOF'\n[NetDev]\nName=pub-irb\nKind=vlan\n[VLAN]\nId=40\nEOF\n  put arch-minipc /etc/systemd/network/60-pub-irb.network <<'EOF'\n[Match]\nName=pub-irb\n[Network]\nVRF=vrf-pub\nAddress=172.16.40.1/24\nConfigureWithoutCarrier=yes\nIPv6AcceptRA=no\nLinkLocalAddressing=no\nEOF\n\n  put arch-minipc /etc/systemd/network/70-pn-svc.netdev <<'EOF'\n[NetDev]\nName=pn-svc\nKind=bridge\nEOF\n  put arch-minipc /etc/systemd/network/70-pn-svc.network <<'EOF'\n[Match]\nName=pn-svc\n[Network]\nVRF=vrf-svc\nAddress=10.88.10.1/24\nConfigureWithoutCarrier=yes\nIPv6AcceptRA=no\nLinkLocalAddressing=no\nEOF\n  put arch-minipc /etc/systemd/network/70-pn-lab.netdev <<'EOF'\n[NetDev]\nName=pn-lab\nKind=bridge\nEOF\n  put arch-minipc /etc/systemd/network/70-pn-lab.network <<'EOF'\n[Match]\nName=pn-lab\n[Network]\nVRF=vrf-lab\nAddress=10.88.20.1/24\nConfigureWithoutCarrier=yes\nIPv6AcceptRA=no\nLinkLocalAddressing=no\nEOF\n  put arch-minipc /etc/systemd/network/70-pn-pub.netdev <<'EOF'\n[NetDev]\nName=pn-pub\nKind=bridge\nEOF\n  put arch-minipc /etc/systemd/network/70-pn-pub.network <<'EOF'\n[Match]\nName=pn-pub\n[Network]\nVRF=vrf-pub\nAddress=10.89.10.1/24\nConfigureWithoutCarrier=yes\nIPv6AcceptRA=no\nLinkLocalAddressing=no\nEOF\n\n  put arch-minipc /usr/local/lib/svd-vni.sh <<'EOF'\n#!/usr/bin/env bash\n# networkd 258 creates vxlan0 (External+VNIFilter). Older networkd: create it here.\n# VLAN↔VNI tunnel_info is still iproute2 — systemd has no unit key for it.\nset -euo pipefail\nif ! ip link show vxlan0 >/dev/null 2>&1; then\n  ip link add br0 type bridge vlan_filtering 1 vlan_default_pvid 0 || true\n  ip link add vxlan0 type vxlan dstport 4789 local 10.254.0.10 nolearning external vnifilter || true\n  ip link set vxlan0 master br0 || true\n  bridge link set dev vxlan0 vlan_tunnel on neigh_suppress on learning off || true\nfi\nip link set br0 up || true\nip link set vxlan0 up || true\nmap_vni() {\n  local vni=\"$1\" vid=\"$2\"\n  bridge vni add dev vxlan0 vni \"$vni\" || true\n  bridge vlan add dev vxlan0 vid \"$vid\" || true\n  bridge vlan add dev vxlan0 vid \"$vid\" tunnel_info id \"$vni\" || true\n  bridge vlan add dev br0 vid \"$vid\" self || true\n}\nmap_vni 10010 10\nmap_vni 10020 20\nmap_vni 10030 30\nmap_vni 10040 40\nmap_vni 20010 1010\nmap_vni 20020 1020\nmap_vni 20030 1030\nmap_vni 20040 1040\nEOF\n  podman exec arch-minipc chmod +x /usr/local/lib/svd-vni.sh\n\n  put arch-minipc /etc/systemd/system/svd-vni.service <<'EOF'\n[Unit]\nDescription=SVD VLAN-to-VNI maps\nAfter=systemd-networkd.service\nWants=systemd-networkd.service\n\n[Service]\nType=oneshot\nRemainAfterExit=yes\nExecStart=/usr/local/lib/svd-vni.sh\n\n[Install]\nWantedBy=multi-user.target\nEOF\n\n  podman exec arch-minipc systemctl daemon-reload || true\n  podman exec arch-minipc systemctl enable --now systemd-networkd svd-vni.service >/dev/null 2>&1 || true\n  podman exec arch-minipc systemctl restart systemd-networkd || true\n  sleep 1\n  podman exec arch-minipc systemctl restart svd-vni.service || execn arch-minipc /usr/local/lib/svd-vni.sh\n}\n\n# --- GRE / VTI underlay ----------------------------------------------------\n\ngre_up() {\n  log \"GRE sanctioned underlay (home) — ER4 tun0/1/2 come from VyOS, not iproute2\"\n  arch_networkd_up\n  execn pi5-alma 'ip tunnel add gre0 mode gre local 192.168.100.20 remote 192.168.100.1 ttl 64 && ip addr add 10.255.0.6/30 dev gre0 && ip link set gre0 mtu 1476 up' || true\n  execn pizero2 'ip tunnel add gre0 mode gre local 192.168.100.30 remote 192.168.100.1 ttl 64 && ip addr add 10.255.0.10/30 dev gre0 && ip link set gre0 mtu 1400 up' || true\n}\n\nvti_up() {\n  log \"VPS underlay toward ER4 (raw VTI, else GRE named vti0)\"\n  vps_underlay vps-east 203.0.113.11 10.0.0.2 10.255.1.2/30\n  vps_underlay vps-west 203.0.113.12 10.0.0.2 10.255.1.6/30\n  vps_underlay vps-core 203.0.113.13 10.0.0.2 10.255.1.10/30\n  for n in vps-east vps-west vps-core; do\n    execn \"$n\" 'ip route replace 10.255.0.0/16 via 10.255.1.1 || true\nip route replace 10.254.0.0/24 via 10.255.1.1 || true'\n  done\n}\n\nvps_underlay() {\n  local n=\"$1\" localip=\"$2\" remote=\"$3\" addr=\"$4\"\n  if execn \"$n\" \"ip link add vti0 type vti local ${localip} remote ${remote} key 1\" 2>/dev/null; then\n    :\n  else\n    echo \"    xfrm VTI unavailable on $n — GRE stand-in on vti0\"\n    execn \"$n\" \"ip tunnel add vti0 mode gre local ${localip} remote ${remote} ttl 64\" || true\n  fi\n  execn \"$n\" \"ip addr add ${addr} dev vti0; ip link set vti0 mtu 1400 up; sysctl -w net.ipv4.conf.vti0.rp_filter=0 >/dev/null\" || true\n}\n\n# --- SVD + IRB + CE on non-Arch VTEPs --------------------------------------\n# tenant: name:vlan:l2vni:l3vni:gw:table\n# ce:     name:ip:vlan\n\nsvd_up() {\n  local n=\"$1\" vtep=\"$2\"; shift 2\n  log \"SVD on $n  local $vtep\"\n  execn \"$n\" \"ip addr replace ${vtep}/32 dev lo\nip link add br0 type bridge vlan_filtering 1 vlan_default_pvid 0 2>/dev/null || true\nip link add vxlan0 type vxlan dstport 4789 local ${vtep} nolearning external vnifilter 2>/dev/null || true\nip link set vxlan0 master br0 || true\nbridge link set dev vxlan0 vlan_tunnel on neigh_suppress on learning off || true\nip link set br0 up\nip link set vxlan0 up\nip link set vxlan0 mtu 1350 || true\nsysctl -w net.ipv4.ip_forward=1 >/dev/null\"\n  local spec name vlan l2 l3 gw table\n  for spec in \"$@\"; do\n    IFS=: read -r name vlan l2 l3 gw table <<<\"$spec\"\n    execn \"$n\" \"ip link add vrf-${name} type vrf table ${table} 2>/dev/null || true\nip link set vrf-${name} up\nbridge vni add dev vxlan0 vni ${l2} || true\nbridge vlan add dev vxlan0 vid ${vlan} || true\nbridge vlan add dev vxlan0 vid ${vlan} tunnel_info id ${l2} || true\nbridge vlan add dev br0 vid ${vlan} self || true\nip link add ${name}-irb link br0 type vlan id ${vlan} 2>/dev/null || true\nip addr replace ${gw}/24 dev ${name}-irb\nip link set ${name}-irb master vrf-${name} || true\nip link set ${name}-irb up\nbridge vni add dev vxlan0 vni ${l3} || true\nbridge vlan add dev vxlan0 vid $((vlan + 1000)) || true\nbridge vlan add dev vxlan0 vid $((vlan + 1000)) tunnel_info id ${l3} || true\"\n  done\n}\n\n# Inner workloads: rootless podman as user `pod` inside the VTEP.\ninner_exec() {\n  local n=\"$1\"; shift\n  podman exec -u pod -e HOME=/home/pod -e XDG_RUNTIME_DIR=/run/user/1000 \"$n\" \"$@\"\n}\n\nprep_inner_user() {\n  local n\n  for n in \"${vteps[@]}\"; do\n    execn \"$n\" 'mkdir -p /run/user/1000 /home/pod/.local/share/containers\nchown -R pod:pod /run/user/1000 /home/pod\nchmod 700 /run/user/1000' || true\n  done\n}\n\n# Inner podman is rootless (user pod). Outer VTEP is rootful/privileged.\n# Fallback: netns+python if nested podman cannot start.\ninner_pn() {\n  local n=\"$1\" tenant=\"$2\" subnet=\"$3\" gw=\"$4\" ce=\"$5\"\n  local net=\"pn-${tenant}\"\n  log \"    $n  rootless www $net $subnet  $ce\"\n  execn \"$n\" \"mkdir -p /var/www/${tenant} /run/user/1000\nprintf '<!doctype html><html><body><h1>${n} / ${tenant}</h1><p>${ce}</p></body></html>\\n' > /var/www/${tenant}/index.html\nchown -R pod:pod /var/www/${tenant} /run/user/1000\"\n  inner_exec \"$n\" bash -lc \"podman network exists ${net} || podman network create --driver bridge --subnet ${subnet} --gateway ${gw} --interface-name ${net} ${net} || podman network create --driver bridge --subnet ${subnet} --gateway ${gw} ${net}\" \\\n    || echo \"    warn: inner network ${net} on ${n}\"\n  execn \"$n\" \"ip link set ${net} master vrf-${tenant} 2>/dev/null || true\nfor cand in ${net} podman0 podman1 podman2; do\n  ip link show \\$cand >/dev/null 2>&1 && ip link set \\$cand master vrf-${tenant} 2>/dev/null || true\ndone\"\n  inner_exec \"$n\" bash -lc \"podman rm -f www-${tenant} >/dev/null 2>&1 || true\npodman run -d --name www-${tenant} --network ${net} --ip ${ce%/*} \\\n  -v /var/www/${tenant}:/usr/local/apache2/htdocs:ro \\\n  docker.io/library/httpd:2.4-alpine\" \\\n    || echo \"    warn: inner httpd ${tenant} on ${n}\"\n  if ! inner_exec \"$n\" podman inspect \"www-${tenant}\" >/dev/null 2>&1; then\n    local_pn \"$n\" \"$tenant\" \"${gw}/24\" \"$ce\"\n    execn \"$n\" \"ip netns exec ctr-${tenant} python3 -m http.server 80 >/tmp/www-${tenant}.log 2>&1 &\" || true\n  fi\n}\n\nlocal_pn() {\n  local n=\"$1\" tenant=\"$2\" gw=\"$3\" ce=\"$4\"\n  local br=\"pn-${tenant}\" ns=\"ctr-${tenant}\"\n  execn \"$n\" \"ip link add ${br} type bridge 2>/dev/null || true\nip link set ${br} master vrf-${tenant} || true\nip addr replace ${gw} dev ${br}\nip link set ${br} up\nip netns add ${ns} 2>/dev/null || true\nip link del veth-${tenant} 2>/dev/null || true\nip link add veth-${tenant} type veth peer name veth-${tenant}-c\nip link set veth-${tenant} master ${br}\nip link set veth-${tenant} up\nip link set veth-${tenant}-c netns ${ns}\nip netns exec ${ns} ip link set lo up\nip netns exec ${ns} ip addr replace ${ce} dev veth-${tenant}-c\nip netns exec ${ns} ip link set veth-${tenant}-c up\nip netns exec ${ns} ip route replace default via ${gw%/*} || true\" \\\n    || echo \"    warn: local net ${br} on ${n} failed\"\n}\n\noverlay_dataplane() {\n  svd_up pi5-alma 10.254.0.20 \\\n    svc:10:10010:20010:172.16.10.1:1100 \\\n    lab:20:10020:20020:172.16.20.1:1101 \\\n    iot:30:10030:20030:172.16.30.1:1102 \\\n    pub:40:10040:20040:172.16.40.1:1103\n  svd_up pizero2 10.254.0.30 \\\n    iot:30:10030:20030:172.16.30.1:1102\n  svd_up vps-east 10.254.0.11 \\\n    svc:10:10010:20010:172.16.10.1:1100 \\\n    lab:20:10020:20020:172.16.20.1:1101 \\\n    pub:40:10040:20040:172.16.40.1:1103\n  svd_up vps-west 10.254.0.12 \\\n    svc:10:10010:20010:172.16.10.1:1100 \\\n    pub:40:10040:20040:172.16.40.1:1103\n  svd_up vps-core 10.254.0.13 \\\n    svc:10:10010:20010:172.16.10.1:1100 \\\n    lab:20:10020:20020:172.16.20.1:1101 \\\n    iot:30:10030:20030:172.16.30.1:1102 \\\n    pub:40:10040:20040:172.16.40.1:1103\n\n  load_inner_images\n  prep_inner_user\n  log \"rootless inner httpd (user pod)\"\n  inner_pn arch-minipc svc 10.88.10.0/24 10.88.10.1 10.88.10.10/24\n  inner_pn arch-minipc lab 10.88.20.0/24 10.88.20.1 10.88.20.10/24\n  inner_pn arch-minipc pub 10.89.10.0/24 10.89.10.1 10.89.10.10/24\n  inner_pn pi5-alma    svc 10.88.11.0/24 10.88.11.1 10.88.11.10/24\n  inner_pn pi5-alma    lab 10.88.21.0/24 10.88.21.1 10.88.21.10/24\n  inner_pn pi5-alma    iot 10.88.31.0/24 10.88.31.1 10.88.31.10/24\n  inner_pn pi5-alma    pub 10.89.11.0/24 10.89.11.1 10.89.11.10/24\n  inner_pn pizero2     iot 10.88.32.0/24 10.88.32.1 10.88.32.10/24\n  inner_pn vps-east    svc 10.88.13.0/24 10.88.13.1 10.88.13.10/24\n  inner_pn vps-east    lab 10.88.23.0/24 10.88.23.1 10.88.23.10/24\n  inner_pn vps-east    pub 10.89.13.0/24 10.89.13.1 10.89.13.10/24\n  inner_pn vps-west    svc 10.88.14.0/24 10.88.14.1 10.88.14.10/24\n  inner_pn vps-west    pub 10.89.14.0/24 10.89.14.1 10.89.14.10/24\n  inner_pn vps-core    svc 10.88.15.0/24 10.88.15.1 10.88.15.10/24\n  inner_pn vps-core    lab 10.88.25.0/24 10.88.25.1 10.88.25.10/24\n  inner_pn vps-core    iot 10.88.35.0/24 10.88.35.1 10.88.35.10/24\n  inner_pn vps-core    pub 10.89.15.0/24 10.89.15.1 10.89.15.10/24\n}\n\nload_inner_images() {\n  log \"pull httpd+caddy on hypervisor, load into VTEPs\"\n  podman pull docker.io/library/httpd:2.4-alpine >/dev/null\n  podman pull docker.io/library/caddy:2-alpine >/dev/null\n  local n\n  for n in \"${vteps[@]}\"; do\n    podman save docker.io/library/httpd:2.4-alpine docker.io/library/caddy:2-alpine \\\n      | podman exec -i -u pod -e HOME=/home/pod -e XDG_RUNTIME_DIR=/run/user/1000 \"$n\" podman load >/dev/null \\\n      || echo \"    warn: podman load $n failed\"\n  done\n}\n\ncaddy_up() {\n  log \"Caddy — Arch internal (private RTs) and vps-core WAN (public RT only)\"\n  execn arch-minipc 'ip route replace 10.88.10.0/24 dev vrf-svc; ip route replace 10.88.11.0/24 dev vrf-svc\nip route replace 10.88.13.0/24 dev vrf-svc; ip route replace 10.88.14.0/24 dev vrf-svc\nip route replace 10.88.15.0/24 dev vrf-svc\nip route replace 10.88.20.0/24 dev vrf-lab; ip route replace 10.88.21.0/24 dev vrf-lab\nip route replace 10.88.23.0/24 dev vrf-lab; ip route replace 10.88.25.0/24 dev vrf-lab\nip route replace 10.88.31.0/24 dev vrf-iot; ip route replace 10.88.32.0/24 dev vrf-iot\nip route replace 10.88.35.0/24 dev vrf-iot' || true\n  execn vps-core 'ip route replace 10.89.0.0/16 dev vrf-pub' || true\n\n  put arch-minipc /etc/caddy/Caddyfile <<'EOF'\n{\n  auto_https off\n}\n:80 {\n  handle_path /svc/* { reverse_proxy 10.88.10.10:80 }\n  handle_path /lab/* { reverse_proxy 10.88.20.10:80 }\n  handle_path /alma/* { reverse_proxy 10.88.11.10:80 }\n  handle_path /east/* { reverse_proxy 10.88.13.10:80 }\n  handle_path /zero/* { reverse_proxy 10.88.32.10:80 }\n  handle / { respond \"internal caddy — private VNIs 10010/10020/10030 only\" 200 }\n}\nEOF\n  put vps-core /etc/caddy/Caddyfile <<'EOF'\n{\n  auto_https off\n}\n:80 {\n  handle_path /core/* { reverse_proxy 10.89.15.10:80 }\n  handle_path /east/* { reverse_proxy 10.89.13.10:80 }\n  handle_path /west/* { reverse_proxy 10.89.14.10:80 }\n  handle_path /arch/* { reverse_proxy 10.89.10.10:80 }\n  handle_path /alma/* { reverse_proxy 10.89.11.10:80 }\n  handle / { respond \"wan caddy — public VNI 10040/20040 RT 64512:40 only\" 200 }\n}\nEOF\n  execn arch-minipc 'podman rm -f caddy-int >/dev/null 2>&1 || true\npodman run -d --name caddy-int --network host -v /etc/caddy/Caddyfile:/etc/caddy/Caddyfile:ro docker.io/library/caddy:2-alpine' \\\n    || echo \"    warn: internal caddy\"\n  execn vps-core 'podman rm -f caddy-wan >/dev/null 2>&1 || true\npodman run -d --name caddy-wan --network host -v /etc/caddy/Caddyfile:/etc/caddy/Caddyfile:ro docker.io/library/caddy:2-alpine' \\\n    || echo \"    warn: wan caddy\"\n}\n\n# --- FRR -------------------------------------------------------------------\n\ninstall_frr() {\n  local n=\"$1\"\n  put \"$n\" /etc/frr/daemons <<'EOF'\nzebra=yes\nbgpd=yes\nospfd=yes\nstaticd=yes\nbfdd=yes\nvtysh_enable=yes\nzebra_options=\"  -A 127.0.0.1 -s 90000000\"\nbgpd_options=\"   -A 127.0.0.1\"\nospfd_options=\"  -A 127.0.0.1\"\nstaticd_options=\"-A 127.0.0.1\"\nbfdd_options=\"   -A 127.0.0.1\"\nEOF\n  put \"$n\" /etc/frr/frr.conf\n  podman exec \"$n\" chown frr:frr /etc/frr/frr.conf /etc/frr/daemons 2>/dev/null || true\n  podman exec \"$n\" systemctl restart frr || podman exec \"$n\" service frr restart || true\n}\n\nwrite_er4_config_boot() {\n  mkdir -p \"$LAB_DIR/er4-config\"\n  cat > \"$LAB_DIR/er4-config/config.boot\" <<'BOOT'\ninterfaces {\n    ethernet eth0 {\n        address 10.0.0.2/24\n        description \"ISP modem LAN — only host\"\n    }\n    ethernet eth1 {\n        address 192.168.100.1/24\n        description \"Home LAN — GRE endpoints only\"\n    }\n    loopback lo {\n        address 10.254.0.1/32\n    }\n    tunnel tun0 {\n        address 10.255.0.1/30\n        description \"GRE arch-minipc\"\n        encapsulation gre\n        local-ip 192.168.100.1\n        remote-ip 192.168.100.10\n        mtu 1476\n    }\n    tunnel tun1 {\n        address 10.255.0.5/30\n        description \"GRE pi5-alma\"\n        encapsulation gre\n        local-ip 192.168.100.1\n        remote-ip 192.168.100.20\n        mtu 1476\n    }\n    tunnel tun2 {\n        address 10.255.0.9/30\n        description \"GRE pizero2 Wi-Fi\"\n        encapsulation gre\n        local-ip 192.168.100.1\n        remote-ip 192.168.100.30\n        mtu 1400\n    }\n    vti vti0 {\n        address 10.255.1.1/30\n        description \"IPsec VTI vps-east\"\n        mtu 1400\n    }\n    vti vti1 {\n        address 10.255.1.5/30\n        description \"IPsec VTI vps-west\"\n        mtu 1400\n    }\n    vti vti2 {\n        address 10.255.1.9/30\n        description \"IPsec VTI vps-core\"\n        mtu 1400\n    }\n}\nprotocols {\n    ospf {\n        area 0 {\n            network 10.254.0.1/32\n            network 10.255.0.0/16\n        }\n        interface tun0 { network point-to-point }\n        interface tun1 { network point-to-point }\n        interface tun2 { network point-to-point }\n        interface vti0 { network point-to-point }\n        interface vti1 { network point-to-point }\n        interface vti2 { network point-to-point }\n        parameters {\n            router-id 10.254.0.1\n        }\n        passive-interface lo\n    }\n    static {\n        route 0.0.0.0/0 {\n            next-hop 10.0.0.1 {\n            }\n        }\n        route 203.0.113.0/24 {\n            next-hop 10.0.0.1 {\n            }\n        }\n    }\n}\nvpn {\n    ipsec {\n        esp-group ESP-LAB {\n            compression disable\n            lifetime 3600\n            pfs dh-group14\n            proposal 1 {\n                encryption aes256\n                hash sha256\n            }\n        }\n        ike-group IKE-LAB {\n            lifetime 28800\n            proposal 1 {\n                dh-group 14\n                encryption aes256\n                hash sha256\n            }\n        }\n        ipsec-interfaces {\n            interface eth0\n        }\n        nat-traversal enable\n        site-to-site {\n            peer 203.0.113.11 {\n                authentication {\n                    mode pre-shared-secret\n                    pre-shared-secret lab-only-not-secret\n                }\n                ike-group IKE-LAB\n                local-address 10.0.0.2\n                vti {\n                    bind vti0\n                    esp-group ESP-LAB\n                }\n            }\n            peer 203.0.113.12 {\n                authentication {\n                    mode pre-shared-secret\n                    pre-shared-secret lab-only-not-secret\n                }\n                ike-group IKE-LAB\n                local-address 10.0.0.2\n                vti {\n                    bind vti1\n                    esp-group ESP-LAB\n                }\n            }\n            peer 203.0.113.13 {\n                authentication {\n                    mode pre-shared-secret\n                    pre-shared-secret lab-only-not-secret\n                }\n                ike-group IKE-LAB\n                local-address 10.0.0.2\n                vti {\n                    bind vti2\n                    esp-group ESP-LAB\n                }\n            }\n        }\n    }\n}\nservice {\n    ssh {\n        port 22\n    }\n}\nsystem {\n    host-name er4\n    login {\n        user vyos {\n            authentication {\n                plaintext-password \"vyos\"\n            }\n            level admin\n        }\n    }\n    syslog {\n        global {\n            facility all {\n                level notice\n            }\n        }\n    }\n}\nBOOT\n}\n\n# Drive VyOS with the real cfg wrapper (same as `configure` / `set` / `commit`).\nvyos_sets() {\n  local WRAP=/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper tmp\n  podman exec er4 test -x \"$WRAP\" || { echo \"    vyos wrapper not ready\"; return 1; }\n  tmp=$(mktemp)\n  cat >\"$tmp\"\n  {\n    echo 'WRAP=/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper'\n    echo '$WRAP begin || { $WRAP discard >/dev/null 2>&1 || true; $WRAP end >/dev/null 2>&1 || true; $WRAP begin; }'\n    while IFS= read -r line; do\n      [[ -z \"$line\" || \"$line\" == \\#* ]] && continue\n      printf '$WRAP %s || echo \"    skip: %s\"\\n' \"$line\" \"$line\"\n    done <\"$tmp\"\n    echo '$WRAP commit || true'\n    echo '$WRAP save'\n    echo '$WRAP end'\n  } | podman exec -i er4 /bin/bash -s\n  rm -f \"$tmp\"\n}\n\nvyos_apply() {\n  log \"VyOS 1.3 configure (set / commit / save)\"\n  vyos_sets <<'EOF'\nset interfaces ethernet eth0 address 10.0.0.2/24\nset interfaces ethernet eth0 description 'ISP modem LAN'\nset interfaces ethernet eth1 address 192.168.100.1/24\nset interfaces ethernet eth1 description 'Home LAN GRE endpoints only'\nset interfaces loopback lo address 10.254.0.1/32\nset interfaces tunnel tun0 encapsulation gre\nset interfaces tunnel tun0 local-ip 192.168.100.1\nset interfaces tunnel tun0 remote-ip 192.168.100.10\nset interfaces tunnel tun0 address 10.255.0.1/30\nset interfaces tunnel tun0 mtu 1476\nset interfaces tunnel tun1 encapsulation gre\nset interfaces tunnel tun1 local-ip 192.168.100.1\nset interfaces tunnel tun1 remote-ip 192.168.100.20\nset interfaces tunnel tun1 address 10.255.0.5/30\nset interfaces tunnel tun1 mtu 1476\nset interfaces tunnel tun2 encapsulation gre\nset interfaces tunnel tun2 local-ip 192.168.100.1\nset interfaces tunnel tun2 remote-ip 192.168.100.30\nset interfaces tunnel tun2 address 10.255.0.9/30\nset interfaces tunnel tun2 mtu 1400\nset interfaces vti vti0 address 10.255.1.1/30\nset interfaces vti vti0 mtu 1400\nset interfaces vti vti1 address 10.255.1.5/30\nset interfaces vti vti1 mtu 1400\nset interfaces vti vti2 address 10.255.1.9/30\nset interfaces vti vti2 mtu 1400\nset vpn ipsec ipsec-interfaces interface eth0\nset vpn ipsec nat-traversal enable\nset vpn ipsec ike-group IKE-LAB proposal 1 encryption aes256\nset vpn ipsec ike-group IKE-LAB proposal 1 hash sha256\nset vpn ipsec ike-group IKE-LAB proposal 1 dh-group 14\nset vpn ipsec esp-group ESP-LAB proposal 1 encryption aes256\nset vpn ipsec esp-group ESP-LAB proposal 1 hash sha256\nset vpn ipsec site-to-site peer 203.0.113.11 authentication mode pre-shared-secret\nset vpn ipsec site-to-site peer 203.0.113.11 authentication pre-shared-secret lab-only-not-secret\nset vpn ipsec site-to-site peer 203.0.113.11 ike-group IKE-LAB\nset vpn ipsec site-to-site peer 203.0.113.11 local-address 10.0.0.2\nset vpn ipsec site-to-site peer 203.0.113.11 vti bind vti0\nset vpn ipsec site-to-site peer 203.0.113.11 vti esp-group ESP-LAB\nset vpn ipsec site-to-site peer 203.0.113.12 authentication mode pre-shared-secret\nset vpn ipsec site-to-site peer 203.0.113.12 authentication pre-shared-secret lab-only-not-secret\nset vpn ipsec site-to-site peer 203.0.113.12 ike-group IKE-LAB\nset vpn ipsec site-to-site peer 203.0.113.12 local-address 10.0.0.2\nset vpn ipsec site-to-site peer 203.0.113.12 vti bind vti1\nset vpn ipsec site-to-site peer 203.0.113.12 vti esp-group ESP-LAB\nset vpn ipsec site-to-site peer 203.0.113.13 authentication mode pre-shared-secret\nset vpn ipsec site-to-site peer 203.0.113.13 authentication pre-shared-secret lab-only-not-secret\nset vpn ipsec site-to-site peer 203.0.113.13 ike-group IKE-LAB\nset vpn ipsec site-to-site peer 203.0.113.13 local-address 10.0.0.2\nset vpn ipsec site-to-site peer 203.0.113.13 vti bind vti2\nset vpn ipsec site-to-site peer 203.0.113.13 vti esp-group ESP-LAB\nset protocols ospf parameters router-id 10.254.0.1\nset protocols ospf area 0 network 10.254.0.1/32\nset protocols ospf area 0 network 10.255.0.0/16\nset protocols ospf interface tun0 network point-to-point\nset protocols ospf interface tun1 network point-to-point\nset protocols ospf interface tun2 network point-to-point\nset protocols ospf interface vti0 network point-to-point\nset protocols ospf interface vti1 network point-to-point\nset protocols ospf interface vti2 network point-to-point\nset protocols ospf passive-interface lo\nset protocols static route 0.0.0.0/0 next-hop 10.0.0.1\nset protocols static route 203.0.113.0/24 next-hop 10.0.0.1\nEOF\n}\n\n# Rootless userns often has no XFRM — stand WAN up as GRE tun3/4/5 if VTI never appears.\nvyos_wan_fix() {\n  if podman exec er4 ip link show vti0 >/dev/null 2>&1 \\\n     && podman exec er4 ping -c 1 -W 2 10.255.1.2 >/dev/null 2>&1; then\n    log \"VyOS VTI east is up\"\n    return\n  fi\n  log \"VyOS VTI/IPsec not passing in userns — GRE tun3/4/5 stand-in (same /30s)\"\n  vyos_sets <<'EOF' || true\nset interfaces tunnel tun3 encapsulation gre\nset interfaces tunnel tun3 local-ip 10.0.0.2\nset interfaces tunnel tun3 remote-ip 203.0.113.11\nset interfaces tunnel tun3 address 10.255.1.1/30\nset interfaces tunnel tun3 mtu 1400\nset interfaces tunnel tun4 encapsulation gre\nset interfaces tunnel tun4 local-ip 10.0.0.2\nset interfaces tunnel tun4 remote-ip 203.0.113.12\nset interfaces tunnel tun4 address 10.255.1.5/30\nset interfaces tunnel tun4 mtu 1400\nset interfaces tunnel tun5 encapsulation gre\nset interfaces tunnel tun5 local-ip 10.0.0.2\nset interfaces tunnel tun5 remote-ip 203.0.113.13\nset interfaces tunnel tun5 address 10.255.1.9/30\nset interfaces tunnel tun5 mtu 1400\nset protocols ospf interface tun3 network point-to-point\nset protocols ospf interface tun4 network point-to-point\nset protocols ospf interface tun5 network point-to-point\nEOF\n  # VPS already has GRE-or-VTI named vti0 from vps_underlay\n}\n\nvyos_op() {\n  local wrap=/opt/vyatta/bin/vyos-op-cmd-wrapper\n  if podman exec er4 test -x \"$wrap\"; then\n    podman exec er4 \"$wrap\" \"$@\"\n  else\n    podman exec er4 vtysh -c \"$*\" || podman exec -u vyos er4 /bin/vbash -c \"run $*\"\n  fi\n}\n\nwrite_vtep_frr() {\n  local n=\"$1\" rid=\"$2\" rr=\"$3\"\n  local tun=gre0\n  case \"$n\" in vps-*) tun=vti0 ;; esac\n  local rr_block af_extra lo_block\n  if [[ \"$rr\" == \"yes\" ]]; then\n    rr_block=\" neighbor 10.254.0.20 peer-group VTEP\n neighbor 10.254.0.30 peer-group VTEP\n neighbor 10.254.0.11 peer-group VTEP\n neighbor 10.254.0.12 peer-group VTEP\n neighbor 10.254.0.13 peer-group VTEP\"\n    af_extra=\"  neighbor VTEP route-reflector-client\"\n  else\n    rr_block=\" neighbor 10.254.0.10 peer-group VTEP\"\n    af_extra=\"\"\n  fi\n  if [[ \"$n\" == \"arch-minipc\" ]]; then\n    lo_block=\"interface lo\n ! ${rid}/32 from systemd-networkd\nexit\"\n  else\n    lo_block=\"interface lo\n ip address ${rid}/32\nexit\"\n  fi\n  install_frr \"$n\" <<EOF\nfrr version 10.4\nfrr defaults datacenter\nhostname $n\nservice integrated-vtysh-config\nvrf vrf-svc\n vni 20010\nexit-vrf\nvrf vrf-lab\n vni 20020\nexit-vrf\nvrf vrf-iot\n vni 20030\nexit-vrf\nvrf vrf-pub\n vni 20040\nexit-vrf\n${lo_block}\ninterface ${tun}\n ip ospf network point-to-point\n ip ospf bfd\nexit\nrouter ospf\n ospf router-id ${rid}\n network ${rid}/32 area 0\n network 10.255.0.0/16 area 0\n passive-interface lo\nexit\nrouter bgp 64512\n bgp router-id ${rid}\n no bgp ebgp-requires-policy\n no bgp default ipv4-unicast\n neighbor VTEP peer-group\n neighbor VTEP remote-as 64512\n neighbor VTEP capability extended-nexthop\n neighbor VTEP update-source lo\n neighbor VTEP bfd\n${rr_block}\n address-family ipv4 unicast\n  neighbor VTEP activate\n  network ${rid}/32\n exit-address-family\n address-family l2vpn evpn\n  neighbor VTEP activate\n${af_extra}\n  advertise-all-vni\n  advertise-svi-ip\n exit-address-family\nexit\nrouter bgp 64512 vrf vrf-svc\n address-family ipv4 unicast\n  redistribute connected\n exit-address-family\n address-family l2vpn evpn\n  advertise ipv4 unicast\n exit-address-family\nexit\nrouter bgp 64512 vrf vrf-lab\n address-family ipv4 unicast\n  redistribute connected\n exit-address-family\n address-family l2vpn evpn\n  advertise ipv4 unicast\n exit-address-family\nexit\nrouter bgp 64512 vrf vrf-iot\n address-family ipv4 unicast\n  redistribute connected\n exit-address-family\n address-family l2vpn evpn\n  advertise ipv4 unicast\n exit-address-family\nexit\nrouter bgp 64512 vrf vrf-pub\n address-family ipv4 unicast\n  redistribute connected\n exit-address-family\n address-family l2vpn evpn\n  advertise ipv4 unicast\n exit-address-family\nexit\nEOF\n}\n\noverlay_frr() {\n  log \"FRR EVPN on VTEPs (er4 is VyOS — no FRR file drop)\"\n  write_vtep_frr arch-minipc 10.254.0.10 yes\n  write_vtep_frr pi5-alma    10.254.0.20 no\n  write_vtep_frr pizero2     10.254.0.30 no\n  write_vtep_frr vps-east    10.254.0.11 no\n  write_vtep_frr vps-west    10.254.0.12 no\n  write_vtep_frr vps-core    10.254.0.13 no\n}\n\n# --- commands --------------------------------------------------------------\n\ncmd_up() {\n  preflight\n  build_images\n  nets_up\n  containers_up\n  isp_nat\n  gre_up\n  vyos_apply || true\n  vti_up\n  vyos_wan_fix || true\n  overlay_dataplane\n  firewall_up\n  overlay_frr\n  caddy_up\n  echo $$ > \"$LAB_DIR/state/up.pid\"\n  log \"fabric up\"\n  echo\n  echo \"  ./labctl status\"\n  echo \"  ./labctl check\"\n  echo \"  ./labctl vyos show ip ospf neighbor\"\n  echo \"  ./labctl vtysh arch-minipc show bgp l2vpn evpn\"\n  echo \"  ./labctl down\"\n}\n\ncmd_down() {\n  log \"tearing down\"\n  containers_down\n  nets_down\n  rm -f \"$LAB_DIR/state/up.pid\"\n  log \"fabric down\"\n}\n\ncmd_status() {\n  echo \"Podman: $(podman version -f '{{.Client.Version}}' 2>/dev/null || echo missing)\"\n  echo\n  local n\n  for n in \"${nodes[@]}\"; do\n    if podman container exists \"$n\" 2>/dev/null; then\n      printf \"  %-14s %s\\n\" \"$n\" \"$(podman inspect -f '{{.State.Status}}' \"$n\")\"\n    else\n      printf \"  %-14s absent\\n\" \"$n\"\n    fi\n  done\n  echo\n  podman network ls --filter name=svd- || true\n  echo\n  if podman container exists arch-minipc 2>/dev/null; then\n    echo \"Arch networkctl:\"\n    podman exec arch-minipc networkctl --no-pager 2>/dev/null || true\n    echo\n    echo \"Underlay pings from arch-minipc:\"\n    local ip\n    for ip in 10.255.0.1 10.254.0.1 10.254.0.20 10.254.0.11; do\n      if podman exec arch-minipc ping -c 1 -W 2 \"$ip\" >/dev/null 2>&1; then\n        printf \"  %-16s ok\\n\" \"$ip\"\n      else\n        printf \"  %-16s FAIL\\n\" \"$ip\"\n      fi\n    done\n  fi\n}\n\ncmd_check() {\n  podman container exists arch-minipc || die \"lab is down\"\n  echo \"--- OSPF (er4 VyOS) ---\"\n  vyos_op show ip ospf neighbor || true\n  echo\n  echo \"--- VyOS interfaces ---\"\n  vyos_op show interfaces || true\n  echo\n  echo \"--- BGP EVPN (arch-minipc RR) ---\"\n  podman exec arch-minipc vtysh -c \"show bgp l2vpn evpn summary\" || true\n  echo\n  echo \"--- EVPN VNI ---\"\n  podman exec arch-minipc vtysh -c \"show evpn vni\" || true\n  echo\n  echo \"--- Type-5 / inner httpd (arch ctr or www-svc) ---\"\n  podman exec arch-minipc curl -sf --max-time 3 http://10.88.10.10/ || \\\n    podman exec arch-minipc ip netns exec ctr-svc ping -c 1 -W 2 10.88.13.10 || true\n  echo\n  echo \"--- internal Caddy (192.168.100.10 private) ---\"\n  podman exec arch-minipc curl -sf --max-time 3 http://127.0.0.1/svc/ || true\n  echo\n  echo \"--- WAN Caddy (203.0.113.13 public VNI only) ---\"\n  podman exec vps-core curl -sf --max-time 3 http://127.0.0.1/core/ || true\n}\n\ncmd_vtysh() {\n  local n=\"${1:-}\"; shift || true\n  [[ -n \"$n\" ]] || die \"vtysh <node> [cmd]\"\n  if [[ \"$n\" == er4 ]]; then\n    if (( $# )); then vyos_op \"$@\"; else podman exec -it -u vyos er4 /bin/vbash; fi\n    return\n  fi\n  if (( $# )); then\n    podman exec \"$n\" vtysh -c \"$*\"\n  else\n    podman exec -it \"$n\" vtysh\n  fi\n}\n\ncmd_vyos() {\n  [[ $# -gt 0 ]] || die \"vyos <op-mode command...>\"\n  vyos_op \"$@\"\n}\n\ncmd_exec() {\n  local n=\"${1:-}\"; shift || true\n  [[ -n \"$n\" ]] || die \"exec <node> <command>\"\n  podman exec -it \"$n\" \"$@\"\n}\n\ncase \"${1:-help}\" in\n  up) cmd_up ;;\n  down|destroy) cmd_down ;;\n  status) cmd_status ;;\n  check) cmd_check ;;\n  build) preflight; build_images ;;\n  vtysh) shift; cmd_vtysh \"$@\" ;;\n  vyos) shift; cmd_vyos \"$@\" ;;\n  exec) shift; cmd_exec \"$@\" ;;\n  help|-h|--help)\n    sed -n '2,24p' \"$0\"\n    ;;\n  *) die \"unknown command ${1:-} (try: up | down | status | check | vtysh | vyos | exec | build)\" ;;\nesac\n";
/** Download the rootless Podman up/down script. */
function downloadLabctl() {
	const blob = new Blob([labctl_default], { type: "text/x-shellscript" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = "labctl";
	a.click();
	URL.revokeObjectURL(url);
}
var ASN = 64512;
var ANYCAST_MAC = "00:00:5e:00:01:01";
var PODMAN_NETS = [
	{
		name: "svd-isp-lan",
		subnet: "10.0.0.0/24",
		gateway: "10.0.0.1",
		role: "Modem LAN — only the edge router is attached"
	},
	{
		name: "svd-wan",
		subnet: "203.0.113.0/24",
		gateway: "203.0.113.1",
		role: "Simulated Internet (TEST-NET-3)"
	},
	{
		name: "svd-home-lan",
		subnet: "192.168.100.0/24",
		gateway: "192.168.100.1",
		role: "Lab home LAN (192.168.100.0/24, not house 192.168.1.0/24) — GRE endpoints only"
	}
];
var HOST_PODMAN_NETS = [
	{
		node: "arch-minipc",
		tenant: "svc",
		subnet: "10.88.10.0/24",
		gw: "10.88.10.1",
		ce: "10.88.10.10",
		exposure: "private"
	},
	{
		node: "arch-minipc",
		tenant: "lab",
		subnet: "10.88.20.0/24",
		gw: "10.88.20.1",
		ce: "10.88.20.10",
		exposure: "private"
	},
	{
		node: "arch-minipc",
		tenant: "pub",
		subnet: "10.89.10.0/24",
		gw: "10.89.10.1",
		ce: "10.89.10.10",
		exposure: "public"
	},
	{
		node: "pi5-alma",
		tenant: "svc",
		subnet: "10.88.11.0/24",
		gw: "10.88.11.1",
		ce: "10.88.11.10",
		exposure: "private"
	},
	{
		node: "pi5-alma",
		tenant: "lab",
		subnet: "10.88.21.0/24",
		gw: "10.88.21.1",
		ce: "10.88.21.10",
		exposure: "private"
	},
	{
		node: "pi5-alma",
		tenant: "iot",
		subnet: "10.88.31.0/24",
		gw: "10.88.31.1",
		ce: "10.88.31.10",
		exposure: "private"
	},
	{
		node: "pi5-alma",
		tenant: "pub",
		subnet: "10.89.11.0/24",
		gw: "10.89.11.1",
		ce: "10.89.11.10",
		exposure: "public"
	},
	{
		node: "pizero2",
		tenant: "iot",
		subnet: "10.88.32.0/24",
		gw: "10.88.32.1",
		ce: "10.88.32.10",
		exposure: "private"
	},
	{
		node: "vps-east",
		tenant: "svc",
		subnet: "10.88.13.0/24",
		gw: "10.88.13.1",
		ce: "10.88.13.10",
		exposure: "private"
	},
	{
		node: "vps-east",
		tenant: "lab",
		subnet: "10.88.23.0/24",
		gw: "10.88.23.1",
		ce: "10.88.23.10",
		exposure: "private"
	},
	{
		node: "vps-east",
		tenant: "pub",
		subnet: "10.89.13.0/24",
		gw: "10.89.13.1",
		ce: "10.89.13.10",
		exposure: "public"
	},
	{
		node: "vps-west",
		tenant: "svc",
		subnet: "10.88.14.0/24",
		gw: "10.88.14.1",
		ce: "10.88.14.10",
		exposure: "private"
	},
	{
		node: "vps-west",
		tenant: "pub",
		subnet: "10.89.14.0/24",
		gw: "10.89.14.1",
		ce: "10.89.14.10",
		exposure: "public"
	},
	{
		node: "vps-core",
		tenant: "svc",
		subnet: "10.88.15.0/24",
		gw: "10.88.15.1",
		ce: "10.88.15.10",
		exposure: "private"
	},
	{
		node: "vps-core",
		tenant: "lab",
		subnet: "10.88.25.0/24",
		gw: "10.88.25.1",
		ce: "10.88.25.10",
		exposure: "private"
	},
	{
		node: "vps-core",
		tenant: "iot",
		subnet: "10.88.35.0/24",
		gw: "10.88.35.1",
		ce: "10.88.35.10",
		exposure: "private"
	},
	{
		node: "vps-core",
		tenant: "pub",
		subnet: "10.89.15.0/24",
		gw: "10.89.15.1",
		ce: "10.89.15.10",
		exposure: "public"
	}
];
var TENANTS = [
	{
		id: "svc",
		name: "svc",
		vlan: 10,
		l2vni: 10010,
		l3vni: 20010,
		prefix: "172.16.10.0/24",
		gw: "172.16.10.1",
		anycastMac: ANYCAST_MAC,
		rd: `${ASN}:10`,
		rt: `${ASN}:10`,
		exposure: "private",
		description: "Private infra. L2VNI=10000+VLAN, L3VNI=20000+VLAN."
	},
	{
		id: "lab",
		name: "lab",
		vlan: 20,
		l2vni: 10020,
		l3vni: 20020,
		prefix: "172.16.20.0/24",
		gw: "172.16.20.1",
		anycastMac: ANYCAST_MAC,
		rd: `${ASN}:20`,
		rt: `${ASN}:20`,
		exposure: "private",
		description: "Private lab. Internal Caddy on Arch imports this RT."
	},
	{
		id: "iot",
		name: "iot",
		vlan: 30,
		l2vni: 10030,
		l3vni: 20030,
		prefix: "172.16.30.0/24",
		gw: "172.16.30.1",
		anycastMac: ANYCAST_MAC,
		rd: `${ASN}:30`,
		rt: `${ASN}:30`,
		exposure: "private",
		description: "Private IoT. Pi Zero participates. Not on WAN Caddy."
	},
	{
		id: "pub",
		name: "pub",
		vlan: 40,
		l2vni: 10040,
		l3vni: 20040,
		prefix: "172.16.40.0/24",
		gw: "172.16.40.1",
		anycastMac: ANYCAST_MAC,
		rd: `${ASN}:40`,
		rt: `${ASN}:40`,
		exposure: "public",
		description: "DMZ. WAN Caddy on vps-core imports RT 64512:40 only."
	}
];
var lo = (ip) => ({
	name: "lo",
	kind: "loopback",
	addr: `${ip}/32`,
	mtu: 65536
});
var NODES = [
	{
		id: "isp",
		hostname: "isp-modem",
		label: "ISP modem",
		role: "isp",
		os: "alpine",
		osLabel: "Alpine (nftables NAT)",
		site: "edge",
		asn: 0,
		routerId: "10.0.0.1",
		isVtep: false,
		isRr: false,
		vxlan: false,
		location: "House — modem LAN",
		summary: "Only ER4 sits on the modem LAN. Modem NATs 10.0.0.0/24 to public 203.0.113.2. IPsec uses NAT-T.",
		interfaces: [{
			name: "eth0",
			kind: "lan",
			addr: "10.0.0.1/24",
			mtu: 1500,
			note: "modem LAN"
		}, {
			name: "eth1",
			kind: "wan",
			addr: "203.0.113.2/24",
			mtu: 1500,
			note: "public / WAN"
		}],
		workloads: [],
		vnis: [],
		x: 600,
		y: 210
	},
	{
		id: "er4",
		hostname: "er4",
		label: "ER4 / VyOS 1.3",
		role: "edge",
		os: "vyos13",
		osLabel: "VyOS 1.3 image (vyos/image:1.3)",
		site: "home",
		asn: ASN,
		routerId: "10.254.0.1",
		isVtep: false,
		isRr: false,
		vxlan: false,
		location: "House — only host on the modem LAN",
		summary: "Cavium EdgeRouter 4 personality. BGP + OSPF + GRE + IPsec VTI. No VXLAN, no SVD, no L2VPN EVPN. Underlay only.",
		interfaces: [
			lo("10.254.0.1"),
			{
				name: "eth0",
				kind: "wan",
				addr: "10.0.0.2/24",
				mtu: 1500,
				note: "modem LAN"
			},
			{
				name: "eth1",
				kind: "lan",
				addr: "192.168.100.1/24",
				mtu: 1500,
				note: "home LAN"
			},
			{
				name: "gre0",
				kind: "gre",
				addr: "10.255.0.1/30",
				peer: "192.168.100.10",
				mtu: 1476
			},
			{
				name: "gre1",
				kind: "gre",
				addr: "10.255.0.5/30",
				peer: "192.168.100.20",
				mtu: 1476
			},
			{
				name: "gre2",
				kind: "gre",
				addr: "10.255.0.9/30",
				peer: "192.168.100.30",
				mtu: 1400,
				note: "Wi-Fi path"
			},
			{
				name: "vti0",
				kind: "vti",
				addr: "10.255.1.1/30",
				peer: "203.0.113.11",
				mtu: 1400
			},
			{
				name: "vti1",
				kind: "vti",
				addr: "10.255.1.5/30",
				peer: "203.0.113.12",
				mtu: 1400
			},
			{
				name: "vti2",
				kind: "vti",
				addr: "10.255.1.9/30",
				peer: "203.0.113.13",
				mtu: 1400
			}
		],
		workloads: [],
		vnis: [],
		x: 600,
		y: 345
	},
	{
		id: "arch",
		hostname: "arch-minipc",
		label: "Arch miniPC",
		role: "vtep-rr",
		os: "arch",
		osLabel: "Arch Linux · systemd-networkd",
		site: "home",
		asn: ASN,
		routerId: "10.254.0.10",
		vtepIp: "10.254.0.10",
		routerMac: "02:00:00:00:00:0a",
		isVtep: true,
		isRr: true,
		vxlan: true,
		location: "Lab LAN 192.168.100.10 — hypervisor is on house 192.168.1.10",
		summary: "EVPN route-reflector and VTEP. systemd-networkd owns lo, GRE, vlan-aware br0, SVD vxlan0 (External+VNIFilter), VRFs and IRB VLANs. The miniPC also runs this rootless Podman lab.",
		interfaces: [
			lo("10.254.0.10"),
			{
				name: "eth0",
				kind: "lan",
				addr: "192.168.100.10/24",
				mtu: 1500,
				note: "networkd Unmanaged= (lab veth)"
			},
			{
				name: "gre0",
				kind: "gre",
				addr: "10.255.0.2/30",
				peer: "192.168.100.1",
				mtu: 1476,
				note: "networkd Independent="
			},
			{
				name: "vxlan0",
				kind: "svd",
				addr: void 0,
				mtu: 1350,
				note: "networkd External= VNIFilter="
			},
			{
				name: "br0",
				kind: "bridge",
				mtu: 1350,
				note: "VLANFiltering=yes"
			},
			{
				name: "vrf-svc",
				kind: "vrf",
				mtu: 65536,
				note: "table 1100"
			},
			{
				name: "vrf-lab",
				kind: "vrf",
				mtu: 65536,
				note: "table 1101"
			},
			{
				name: "vrf-iot",
				kind: "vrf",
				mtu: 65536,
				note: "table 1102"
			},
			{
				name: "svc-irb",
				kind: "svi",
				addr: "172.16.10.1/24",
				vrf: "vrf-svc",
				mtu: 1350,
				note: "vlan 10"
			},
			{
				name: "lab-irb",
				kind: "svi",
				addr: "172.16.20.1/24",
				vrf: "vrf-lab",
				mtu: 1350,
				note: "vlan 20"
			},
			{
				name: "iot-irb",
				kind: "svi",
				addr: "172.16.30.1/24",
				vrf: "vrf-iot",
				mtu: 1350,
				note: "vlan 30"
			}
		],
		workloads: [{
			name: "ce-svc",
			tenant: "svc",
			ip: "172.16.10.10",
			mac: "02:10:00:00:00:0a"
		}, {
			name: "ce-lab",
			tenant: "lab",
			ip: "172.16.20.10",
			mac: "02:20:00:00:00:0a"
		}],
		vnis: [
			10010,
			10020,
			10030,
			10040,
			20010,
			20020,
			20030,
			20040
		],
		x: 220,
		y: 530
	},
	{
		id: "pi5",
		hostname: "pi5-alma",
		label: "Pi 5",
		role: "vtep",
		os: "alma10",
		osLabel: "AlmaLinux 10",
		site: "home",
		asn: ASN,
		routerId: "10.254.0.20",
		vtepIp: "10.254.0.20",
		routerMac: "02:00:00:00:00:14",
		isVtep: true,
		isRr: false,
		vxlan: true,
		location: "Lab LAN 192.168.100.20",
		summary: "Full VTEP on Alma 10. All three tenants. FRR + systemd + SVD.",
		interfaces: [
			lo("10.254.0.20"),
			{
				name: "eth0",
				kind: "lan",
				addr: "192.168.100.20/24",
				mtu: 1500
			},
			{
				name: "gre0",
				kind: "gre",
				addr: "10.255.0.6/30",
				peer: "192.168.100.1",
				mtu: 1476
			},
			{
				name: "vxlan0",
				kind: "svd",
				mtu: 1350,
				note: "type vxlan external vnifilter"
			},
			{
				name: "br0",
				kind: "bridge",
				mtu: 1350
			}
		],
		workloads: [
			{
				name: "ce-svc",
				tenant: "svc",
				ip: "172.16.10.20",
				mac: "02:10:00:00:00:14"
			},
			{
				name: "ce-lab",
				tenant: "lab",
				ip: "172.16.20.20",
				mac: "02:20:00:00:00:14"
			},
			{
				name: "ce-iot",
				tenant: "iot",
				ip: "172.16.30.20",
				mac: "02:30:00:00:00:14"
			}
		],
		vnis: [
			10010,
			10020,
			10030,
			10040,
			20010,
			20020,
			20030,
			20040
		],
		x: 600,
		y: 555
	},
	{
		id: "zero",
		hostname: "pizero2",
		label: "Pi Zero 2",
		role: "vtep-lite",
		os: "pios",
		osLabel: "Raspberry Pi OS (Wi-Fi)",
		site: "home",
		asn: ASN,
		routerId: "10.254.0.30",
		vtepIp: "10.254.0.30",
		routerMac: "02:00:00:00:00:1e",
		isVtep: true,
		isRr: false,
		vxlan: true,
		location: "Lab Wi-Fi 192.168.100.30",
		summary: "512 MB, Wi-Fi-only. VTEP for iot VNI. OSPF cost 100. Type-5 preferred so BUM does not ride the radio.",
		interfaces: [
			lo("10.254.0.30"),
			{
				name: "wlan0",
				kind: "wifi",
				addr: "192.168.100.30/24",
				mtu: 1500,
				note: "official Pi OS Wi-Fi"
			},
			{
				name: "gre0",
				kind: "gre",
				addr: "10.255.0.10/30",
				peer: "192.168.100.1",
				mtu: 1400
			},
			{
				name: "vxlan0",
				kind: "svd",
				mtu: 1300,
				note: "iot VNI only"
			},
			{
				name: "br0",
				kind: "bridge",
				mtu: 1300
			}
		],
		workloads: [{
			name: "ce-iot",
			tenant: "iot",
			ip: "172.16.30.30",
			mac: "02:30:00:00:00:1e"
		}],
		vnis: [10030, 20030],
		x: 980,
		y: 530
	},
	{
		id: "east",
		hostname: "vps-east",
		label: "VPS east",
		role: "vtep",
		os: "ubuntu2404",
		osLabel: "Ubuntu 24.04 LTS",
		site: "wan",
		asn: ASN,
		routerId: "10.254.0.11",
		vtepIp: "10.254.0.11",
		routerMac: "02:00:00:00:00:0b",
		isVtep: true,
		isRr: false,
		vxlan: true,
		location: "Remote VPS · 203.0.113.11",
		summary: "Remote leaf. IPsec VTI to ER4. Full VTEP for svc + lab.",
		interfaces: [
			lo("10.254.0.11"),
			{
				name: "eth0",
				kind: "wan",
				addr: "203.0.113.11/24",
				mtu: 1500
			},
			{
				name: "vti0",
				kind: "vti",
				addr: "10.255.1.2/30",
				peer: "203.0.113.2",
				mtu: 1400
			},
			{
				name: "vxlan0",
				kind: "svd",
				mtu: 1350
			},
			{
				name: "br0",
				kind: "bridge",
				mtu: 1350
			}
		],
		workloads: [{
			name: "ce-svc",
			tenant: "svc",
			ip: "172.16.10.11",
			mac: "02:10:00:00:00:0b"
		}, {
			name: "ce-lab",
			tenant: "lab",
			ip: "172.16.20.11",
			mac: "02:20:00:00:00:0b"
		}],
		vnis: [
			10010,
			10020,
			10040,
			20010,
			20020,
			20040
		],
		x: 170,
		y: 105
	},
	{
		id: "west",
		hostname: "vps-west",
		label: "VPS west",
		role: "vtep",
		os: "ubuntu2404",
		osLabel: "Ubuntu 24.04 LTS",
		site: "wan",
		asn: ASN,
		routerId: "10.254.0.12",
		vtepIp: "10.254.0.12",
		routerMac: "02:00:00:00:00:0c",
		isVtep: true,
		isRr: false,
		vxlan: true,
		location: "Remote VPS · 203.0.113.12",
		summary: "Remote leaf. svc tenant only — a thin spoke.",
		interfaces: [
			lo("10.254.0.12"),
			{
				name: "eth0",
				kind: "wan",
				addr: "203.0.113.12/24",
				mtu: 1500
			},
			{
				name: "vti0",
				kind: "vti",
				addr: "10.255.1.6/30",
				peer: "203.0.113.2",
				mtu: 1400
			},
			{
				name: "vxlan0",
				kind: "svd",
				mtu: 1350
			},
			{
				name: "br0",
				kind: "bridge",
				mtu: 1350
			}
		],
		workloads: [{
			name: "ce-svc",
			tenant: "svc",
			ip: "172.16.10.12",
			mac: "02:10:00:00:00:0c"
		}],
		vnis: [
			10010,
			10040,
			20010,
			20040
		],
		x: 1030,
		y: 105
	},
	{
		id: "core",
		hostname: "vps-core",
		label: "VPS core",
		role: "vtep",
		os: "ubuntu2604",
		osLabel: "Ubuntu 26.04 LTS",
		site: "wan",
		asn: ASN,
		routerId: "10.254.0.13",
		vtepIp: "10.254.0.13",
		routerMac: "02:00:00:00:00:0d",
		isVtep: true,
		isRr: false,
		vxlan: true,
		location: "Remote VPS · 203.0.113.13",
		summary: "Newest remote. Ubuntu 26.04. All three tenants — the cloud dual-homed leaf.",
		interfaces: [
			lo("10.254.0.13"),
			{
				name: "eth0",
				kind: "wan",
				addr: "203.0.113.13/24",
				mtu: 1500
			},
			{
				name: "vti0",
				kind: "vti",
				addr: "10.255.1.10/30",
				peer: "203.0.113.2",
				mtu: 1400
			},
			{
				name: "vxlan0",
				kind: "svd",
				mtu: 1350
			},
			{
				name: "br0",
				kind: "bridge",
				mtu: 1350
			}
		],
		workloads: [
			{
				name: "ce-svc",
				tenant: "svc",
				ip: "172.16.10.13",
				mac: "02:10:00:00:00:0d"
			},
			{
				name: "ce-lab",
				tenant: "lab",
				ip: "172.16.20.13",
				mac: "02:20:00:00:00:0d"
			},
			{
				name: "ce-iot",
				tenant: "iot",
				ip: "172.16.30.13",
				mac: "02:30:00:00:00:0d"
			}
		],
		vnis: [
			10010,
			10020,
			10030,
			10040,
			20010,
			20020,
			20030,
			20040
		],
		x: 600,
		y: 95
	}
];
Object.fromEntries(NODES.map((n) => [n.id, n]));
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-dvh bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "border-b border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs uppercase tracking-widest text-muted",
						children: "AS 64512"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-xl font-semibold tracking-tight",
						children: "SVD Fabric"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-xl text-sm text-muted",
						children: "Rootless Podman lab of a homelab BGP-EVPN fabric. Download labctl; run it on the Arch miniPC."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: downloadLabctl,
					"aria-label": "Download labctl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Download labctl"]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-5xl flex-col gap-12 px-4 py-10 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "max-w-prose space-y-3 text-sm leading-relaxed text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The house sits behind an ISP modem. The only thing on the modem LAN is an EdgeRouter 4 running a real VyOS 1.3 image (EdgeOS 3.0.1 personality). That box speaks BGP, OSPF, GRE, and IPsec VTI. It does not speak VXLAN, so it is underlay only." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Home devices — Arch miniPC, Pi 5 (Alma 10), Pi Zero 2 (Pi OS on Wi-Fi) — sit on the house LAN 192.168.1.0/24. The lab uses 192.168.100.0/24 so those two never share a subnet. GRE tunnels on the lab LAN addresses are the sanctioned underlay. Change the home subnet later and only the GRE endpoints move; EVPN does not care." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Three remote VPS (Ubuntu 24.04, 24.04, 26.04) come in over VTI. Every VTEP except the router runs FRR and a Single VXLAN Device. Arch owns the dataplane with systemd-networkd and is the iBGP route-reflector." })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold",
						children: "Sites"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhysicalDiagram, {})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold",
						children: "Underlay"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnderlayDiagram, {})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold",
						children: "Overlay"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverlayDiagram, {})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-semibold",
							children: "Tenants"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "max-w-prose text-sm text-muted",
							children: "One SVD maps VLAN to VNI. L2VNI = 10000+VLAN, L3VNI = 20000+VLAN. Private RTs stay on the Arch Caddy; public RT 64512:40 is the only thing vps-core WAN Caddy imports."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-x-auto rounded-lg border border-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-left text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-border bg-surface text-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3 font-medium",
											children: "VRF"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3 font-medium",
											children: "VLAN"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3 font-medium",
											children: "L2VNI"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3 font-medium",
											children: "L3VNI"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3 font-medium",
											children: "Prefix"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3 font-medium",
											children: "GW"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3 font-medium",
											children: "RT"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: TENANTS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-border/60 last:border-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-mono text-fg",
											children: t.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-mono",
											children: t.vlan
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-mono",
											children: t.l2vni
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-mono",
											children: t.l3vni
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-mono",
											children: t.prefix
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-mono",
											children: t.gw
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-4 py-3 font-mono",
											children: [
												t.exposure,
												" ",
												t.rt
											]
										})
									]
								}, t.id)) })]
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-semibold",
							children: "Hosts, FRR, firewall"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "max-w-prose text-sm text-muted",
							children: [
								"One Containerfile per OS, built with buildah. FRR is in every VTEP image. Firewall is a oneshot after GRE/SVD exists: trust those interfaces, keep the pasta veth in public. Overlay isolation is VRF + VNI, not host filter.",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-fg",
									children: " bridge-nf-call-iptables=0"
								}),
								" so firewalld/ufw cannot eat bridged VXLAN."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "space-y-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "rounded-md border border-border bg-surface px-4 py-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium text-fg",
										children: "arch-minipc"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-muted",
										children: "Arch · systemd-networkd · FRR · firewalld (trusted: gre0, vxlan0, br0, VRFs)"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "rounded-md border border-border bg-surface px-4 py-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium text-fg",
										children: "pi5-alma"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-muted",
										children: "AlmaLinux 10 · FRR · firewalld · same trusted-zone model"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "rounded-md border border-border bg-surface px-4 py-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium text-fg",
										children: "pizero2"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-muted",
										children: "Pi OS userspace (Debian 12) · FRR · ufw allow in on gre0/vxlan0/br0"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "rounded-md border border-border bg-surface px-4 py-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium text-fg",
										children: "FRR"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-muted",
										children: [
											"Every VTEP (Arch, Alma, Pi Zero, three VPS). Not the ISP. ER4 is VyOS — its own OSPF/BGP, no EVPN. Arch and Alma are Podman servers ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "and" }),
											" VTEPs."
										]
									})]
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-semibold",
							children: "Per-host podman subnets"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "max-w-prose text-sm text-muted",
							children: [
								"Nested podman is skipped. Each VTEP gets a linux bridge in the tenant VRF (",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-fg",
									children: "pn-svc"
								}),
								" …) plus a netns standing in for a local container. FRR redistributes those prefixes as EVPN Type-5. IRB 172.16.x.1 stays the stretched L2 anycast."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-x-auto rounded-lg border border-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-left text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-border bg-surface text-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3 font-medium",
											children: "Host"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3 font-medium",
											children: "Tenant"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3 font-medium",
											children: "Subnet"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3 font-medium",
											children: "GW"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3 font-medium",
											children: "CE"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3 font-medium",
											children: "Side"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: HOST_PODMAN_NETS.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-border/60 last:border-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-mono text-fg",
											children: n.node
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-mono",
											children: n.tenant
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-mono",
											children: n.subnet
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-mono",
											children: n.gw
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-mono",
											children: n.ce
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-mono",
											children: n.exposure
										})
									]
								}, `${n.node}-${n.tenant}`)) })]
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold",
						children: "Podman networks"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2 text-sm",
						children: PODMAN_NETS.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-md border border-border bg-surface px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-fg",
								children: n.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-muted",
								children: [
									n.subnet,
									" — ",
									n.role
								]
							})]
						}, n.name))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-semibold",
							children: "labctl"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "max-w-prose text-sm text-muted",
							children: [
								"Single script. Rootful Podman + netavark L2 bridges on 192.168.100.0/24 (not the house 192.168.1.0/24). Host IPs stripped from the lab bridges. Inner workloads are rootless as user ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-fg",
									children: "pod"
								}),
								". Arch dataplane is systemd-networkd. ER4 is VyOS 1.3."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "overflow-x-auto rounded-md border border-border bg-surface p-4 font-mono text-sm leading-relaxed text-fg",
							children: `chmod +x labctl
./labctl up
./labctl status
./labctl check
./labctl vtysh arch-minipc show bgp l2vpn evpn
./labctl down`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							onClick: downloadLabctl,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Download labctl"]
						})
					]
				})
			]
		})]
	});
}
//#endregion
export { Home as component };
