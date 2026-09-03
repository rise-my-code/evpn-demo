import { STAGES } from "@/lib/fabric/topology";
import { useFabric } from "@/stores/fabric";
import { cn } from "@/lib/utils";

export function StageRail() {
  const stage = useFabric((s) => s.stage);
  const status = useFabric((s) => s.status);
  return (
    <ol className="flex gap-2 overflow-x-auto pb-1">
      {STAGES.map((s, i) => {
        const done = stage > i || status === "up" || status === "degraded";
        const current = stage === i && (status === "bringing-up" || status === "tearing-down");
        return (
          <li
            key={s.id}
            className={cn(
              "min-w-[9.5rem] rounded-md border px-3 py-2",
              current ? "border-accent/40 bg-accent/10" : "border-border bg-surface",
              !done && !current && "opacity-40",
            )}
          >
            <p className="font-mono text-[10px] tabular-nums text-faint">
              {String(i + 1).padStart(2, "0")} · {s.layer}
            </p>
            <p className="mt-1 text-xs font-medium text-fg">{s.title}</p>
          </li>
        );
      })}
    </ol>
  );
}
