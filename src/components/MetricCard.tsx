import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  accentColor?: "primary" | "accent" | "warning";
}

const accentMap = {
  primary: "text-primary glow-primary border-primary/20",
  accent: "text-accent glow-accent border-accent/20",
  warning: "text-warning border-warning/20",
};

export const MetricCard = ({ icon: Icon, label, value, subtitle, accentColor = "primary" }: MetricCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-lg border bg-card p-5 ${accentMap[accentColor]}`}
  >
    <div className="flex items-center gap-3 mb-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
    <p className="text-3xl font-bold tracking-tight">{value}</p>
    {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
  </motion.div>
);
