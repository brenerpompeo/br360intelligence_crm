import { motion } from "framer-motion";
import { Database, Brain, Image, Code, Globe } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface ArchRow {
  icon: LucideIcon;
  name: string;
  alias: string;
  tool: string;
  role: string;
  cost: string;
}

const rows: ArchRow[] = [
  { icon: Database, name: "O Fichário", alias: "Dados", tool: "Supabase (PostgreSQL)", role: "Textos, cores, configs (KB)", cost: "R$ 0 (até ~10k clientes)" },
  { icon: Brain, name: "O Cérebro", alias: "Painel", tool: "Payload CMS", role: "Login, cadastro, edição", cost: "R$ 0 (Vercel/Local)" },
  { icon: Image, name: "O Galpão", alias: "Mídia", tool: "Cloudinary", role: "Imagens → .webp otimizado", cost: "R$ 0 (até 25GB)" },
  { icon: Code, name: "O Molde", alias: "Código", tool: "Next.js + Tailwind", role: "Código Camaleão (API_KEY)", cost: "R$ 0 (tempo)" },
  { icon: Globe, name: "A Rua", alias: "Infra", tool: "Vercel + Hostinger", role: "Hospedagem + Domínio", cost: "R$ 40/ano" },
];

export const ArchitectureTable = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="rounded-lg border bg-card overflow-hidden"
  >
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-secondary/30">
            <th className="text-left p-3 font-mono text-xs uppercase text-muted-foreground">Componente</th>
            <th className="text-left p-3 font-mono text-xs uppercase text-muted-foreground">Ferramenta</th>
            <th className="text-left p-3 font-mono text-xs uppercase text-muted-foreground hidden md:table-cell">Função</th>
            <th className="text-left p-3 font-mono text-xs uppercase text-muted-foreground">Custo</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <r.icon className="h-4 w-4 text-primary" />
                  <div>
                    <span className="font-medium">{r.name}</span>
                    <span className="text-xs text-muted-foreground ml-1.5">({r.alias})</span>
                  </div>
                </div>
              </td>
              <td className="p-3 font-mono text-xs text-primary">{r.tool}</td>
              <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">{r.role}</td>
              <td className="p-3">
                <span className="text-xs font-mono text-success">{r.cost}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </motion.div>
);
