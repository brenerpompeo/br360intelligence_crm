import { AlertTriangle, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface GapCardProps {
  gap: string;
  solution: string;
  index: number;
}

export const GapCard = ({ gap, solution, index }: GapCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08 }}
    className="rounded-lg border border-destructive/20 bg-card p-4 space-y-3"
  >
    <div className="flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
      <p className="text-sm font-medium">{gap}</p>
    </div>
    <div className="flex items-start gap-2 pl-6">
      <Shield className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
      <p className="text-xs text-muted-foreground">{solution}</p>
    </div>
  </motion.div>
);
