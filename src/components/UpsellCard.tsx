import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

interface UpsellCardProps {
  service: string;
  sellPrice: string;
  cost: string;
  profit: string;
  note: string;
  index: number;
}

export const UpsellCard = ({ service, sellPrice, cost, profit, note, index }: UpsellCardProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1 }}
    className="rounded-lg border bg-card p-4 hover:border-primary/30 transition-colors"
  >
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-semibold text-sm">{service}</h4>
      <TrendingUp className="h-4 w-4 text-success" />
    </div>
    <div className="grid grid-cols-3 gap-2 mb-3">
      <div>
        <span className="text-[10px] font-mono uppercase text-muted-foreground block">Venda</span>
        <span className="text-sm font-bold text-foreground">{sellPrice}</span>
      </div>
      <div>
        <span className="text-[10px] font-mono uppercase text-muted-foreground block">Custo</span>
        <span className="text-sm font-medium text-destructive">{cost}</span>
      </div>
      <div>
        <span className="text-[10px] font-mono uppercase text-muted-foreground block">Lucro</span>
        <span className="text-sm font-bold text-success">{profit}</span>
      </div>
    </div>
    <p className="text-xs text-muted-foreground">{note}</p>
  </motion.div>
);
