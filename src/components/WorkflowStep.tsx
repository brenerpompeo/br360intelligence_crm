import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStepProps {
  step: number;
  title: string;
  duration: string;
  icon: LucideIcon;
  tasks: string[];
  variant?: "default" | "critical";
}

export const WorkflowStep = ({ step, title, duration, icon: Icon, tasks, variant = "default" }: WorkflowStepProps) => {
  const [expanded, setExpanded] = useState(false);
  const [checked, setChecked] = useState<boolean[]>(new Array(tasks.length).fill(false));

  const allDone = checked.every(Boolean) && checked.length > 0;
  const progress = checked.filter(Boolean).length;

  const toggleTask = (i: number) => {
    const next = [...checked];
    next[i] = !next[i];
    setChecked(next);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: step * 0.1 }}
      className={cn(
        "rounded-lg border bg-card overflow-hidden transition-colors",
        allDone && "border-success/40",
        variant === "critical" && !allDone && "border-warning/40"
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-4 w-full p-4 text-left hover:bg-secondary/50 transition-colors"
      >
        <div className={cn(
          "flex items-center justify-center h-8 w-8 rounded-full text-xs font-mono font-bold shrink-0",
          allDone ? "bg-success/20 text-success" : "bg-primary/15 text-primary"
        )}>
          {allDone ? <Check className="h-4 w-4" /> : step}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">{title}</span>
            {variant === "critical" && (
              <span className="text-[10px] font-mono uppercase bg-warning/15 text-warning px-1.5 py-0.5 rounded">crítico</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground font-mono">{duration}</span>
            <span className="text-xs text-muted-foreground">{progress}/{tasks.length} tarefas</span>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          className="border-t border-border px-4 py-3 space-y-2"
        >
          {tasks.map((task, i) => (
            <button
              key={i}
              onClick={() => toggleTask(i)}
              className="flex items-center gap-3 w-full text-left group py-1"
            >
              {checked[i] ? (
                <Check className="h-4 w-4 text-success shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
              )}
              <span className={cn("text-sm", checked[i] && "line-through text-muted-foreground")}>{task}</span>
            </button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};
