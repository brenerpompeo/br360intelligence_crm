import { cn } from "@/lib/utils";

type Status = "pending" | "active" | "done" | "alert";

const statusStyles: Record<Status, string> = {
  pending: "bg-warning/15 text-warning border-warning/30",
  active: "bg-info/15 text-info border-info/30",
  done: "bg-success/15 text-success border-success/30",
  alert: "bg-destructive/15 text-destructive border-destructive/30",
};

export const StatusBadge = ({ status, label }: { status: Status; label: string }) => (
  <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-mono font-medium", statusStyles[status])}>
    <span className={cn("h-1.5 w-1.5 rounded-full", {
      "bg-warning": status === "pending",
      "bg-info": status === "active",
      "bg-success": status === "done",
      "bg-destructive": status === "alert",
    })} />
    {label}
  </span>
);
