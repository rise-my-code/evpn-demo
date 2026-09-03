import { create } from "zustand";
import { computePlane, packetTrace, type Plane } from "@/lib/fabric/control-plane";
import { STAGES } from "@/lib/fabric/topology";
import type { FailureId, LabEvent, LabStatus, Layer } from "@/lib/fabric/types";

const TICK_MS = 420;

interface FabricState {
  status: LabStatus;
  stage: number;
  events: LabEvent[];
  selected: string;
  layers: Record<Layer, boolean>;
  failures: FailureId[];
  plane: Plane;
  clock: number;
  traceSrc: string;
  traceDst: string;
  trace: ReturnType<typeof packetTrace>;
  bringUp: () => void;
  tearDown: () => void;
  select: (id: string) => void;
  toggleLayer: (l: Layer) => void;
  toggleFailure: (id: FailureId) => void;
  push: (e: Omit<LabEvent, "t">) => void;
  setTrace: (src: string, dst: string) => void;
  rerunTrace: () => void;
}

let timer: number | null = null;

function emptyPlane(): Plane {
  return computePlane(new Set(), -1);
}

function recompute(failures: FailureId[], stage: number): Plane {
  return computePlane(new Set(failures), stage);
}

export const useFabric = create<FabricState>((set, get) => ({
  status: "down",
  stage: -1,
  events: [
    {
      t: 0,
      level: "info",
      message: "Download labctl and run it rootless on the Arch miniPC. Preview stages is a map, not the lab.",
    },
  ],
  selected: "arch",
  layers: { physical: true, underlay: true, overlay: false },
  failures: [],
  plane: emptyPlane(),
  clock: 0,
  traceSrc: "arch:ce-svc",
  traceDst: "east:ce-svc",
  trace: [],

  push: (e) =>
    set((s) => ({
      events: [...s.events, { ...e, t: Date.now() }].slice(-80),
    })),

  select: (id) => set({ selected: id }),

  toggleLayer: (l) =>
    set((s) => ({ layers: { ...s.layers, [l]: !s.layers[l] } })),

  toggleFailure: (id) => {
    const failures = get().failures.includes(id)
      ? get().failures.filter((f) => f !== id)
      : [...get().failures, id];
    const fabricUp = get().status === "up" || get().status === "degraded";
    const plane = recompute(failures, get().stage);
    set({
      failures,
      plane,
      status: failures.length && fabricUp ? "degraded" : fabricUp ? "up" : get().status,
    });
    get().push({
      level: failures.includes(id) ? "warn" : "ok",
      message: failures.includes(id) ? `Injected ${id}` : `Cleared ${id}`,
    });
    get().rerunTrace();
  },

  setTrace: (src, dst) => {
    set({ traceSrc: src, traceDst: dst });
    const { plane, failures } = get();
    set({ trace: packetTrace(src, dst, plane, new Set(failures)) });
  },

  rerunTrace: () => {
    const { traceSrc, traceDst, plane, failures } = get();
    set({ trace: packetTrace(traceSrc, traceDst, plane, new Set(failures)) });
  },

  bringUp: () => {
    const { status } = get();
    if (status === "bringing-up" || status === "tearing-down") return;
    if (timer) window.clearInterval(timer);
    set({
      status: "bringing-up",
      stage: -1,
      failures: [],
      plane: emptyPlane(),
    });
    get().push({ level: "info", message: "labctl up — rootless Podman 6.1, pasta networks first." });
    timer = window.setInterval(() => {
      const next = get().stage + 1;
      if (next >= STAGES.length) {
        if (timer) window.clearInterval(timer);
        timer = null;
        const plane = recompute([], STAGES.length - 1);
        set({ status: "up", stage: STAGES.length - 1, plane, clock: Date.now() });
        get().push({ level: "ok", message: "Fabric ready. EVPN Type-2/3/5 in RIB. SVD dataplane up." });
        get().rerunTrace();
        return;
      }
      const st = STAGES[next];
      set({
        stage: next,
        plane: recompute([], next),
      });
      get().push({ level: "info", node: st.id, message: `${st.title} — ${st.detail}` });
    }, TICK_MS);
  },

  tearDown: () => {
    if (timer) window.clearInterval(timer);
    const { status } = get();
    if (status === "down") return;
    set({ status: "tearing-down" });
    get().push({ level: "warn", message: "labctl down — withdrawing EVPN, then SVD, then tunnels." });
    timer = window.setInterval(() => {
      const next = get().stage - 1;
      if (next < 0) {
        if (timer) window.clearInterval(timer);
        timer = null;
        set({ status: "down", stage: -1, plane: emptyPlane(), failures: [], trace: [] });
        get().push({ level: "ok", message: "All containers and networks removed." });
        return;
      }
      set({
        stage: next,
        plane: recompute(get().failures, next),
      });
      get().push({
        level: "info",
        message: `Tore down ${STAGES[next + 1]?.title ?? "stage"}.`,
      });
    }, 280);
  },
}));
