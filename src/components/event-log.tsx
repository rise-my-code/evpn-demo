import { useFabric } from "@/stores/fabric";
import { cn } from "@/lib/utils";

export function EventLog() {
  const events = useFabric((s) => s.events);
  const tail = events.slice(-12).reverse();
  return (
    <div className="rounded-[20px] border border-border bg-surface p-3">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Journal</p>
      <ul className="space-y-1.5">
        {tail.map((e, i) => (
          <li key={e.t + "-" + i} className="flex gap-2 font-mono text-[11px] leading-snug">
            <span
              className={cn(
                "mt-1 size-1.5 shrink-0 rounded-full",
                e.level === "ok" && "bg-up",
                e.level === "info" && "bg-faint",
                e.level === "warn" && "bg-warn",
                e.level === "err" && "bg-down",
              )}
            />
            <span className="text-muted">{e.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
