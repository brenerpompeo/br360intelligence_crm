import { motion } from "framer-motion";
import {
  TrendingUp, DollarSign, Users, Palette, Camera,
  PenTool, ArrowUpRight, AlertCircle, Package
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { cn } from "@/lib/utils";

interface Upsell {
  service: string;
  icon: React.ElementType;
  sellPrice: string;
  cost: string;
  profit: string;
  margin: string;
  supplier: string;
  deliveryTime: string;
  whenToOffer: string;
  script: string;
  tips: string[];
}

const upsells: Upsell[] = [
  {
    service: "Redesign de Logo",
    icon: Palette,
    sellPrice: "R$ 500",
    cost: "R$ 150",
    profit: "R$ 350",
    margin: "70%",
    supplier: "Freelancer via Workana ou Fiverr",
    deliveryTime: "3-5 dias úteis",
    whenToOffer: "Quando o cliente não tem logo ou tem logo amador/pixelado",
    script: "\"Percebi que sua logo atual pode prejudicar a imagem do seu negócio. Posso incluir um redesign profissional por R$ 500 — fica pronto em 5 dias.\"",
    tips: [
      "Sempre peça 3 opções ao freelancer",
      "Entregue os arquivos em PNG, SVG e PDF",
      "Custo real: R$ 100-200 dependendo do freelancer",
      "Margem mínima: R$ 300",
    ],
  },
  {
    service: "Sessão de Fotos Profissional",
    icon: Camera,
    sellPrice: "R$ 800",
    cost: "R$ 300",
    profit: "R$ 500",
    margin: "62%",
    supplier: "Fotógrafo local iniciante com boa câmera",
    deliveryTime: "5-7 dias úteis",
    whenToOffer: "Quando as fotos do formulário são ruins ou o cliente não tem fotos",
    script: "\"Sites com fotos profissionais convertem 2x mais. Posso organizar uma sessão de fotos do seu espaço/produtos por R$ 800, com entrega editada em 7 dias.\"",
    tips: [
      "Encontre 2-3 fotógrafos locais e negocie pacotes fixos",
      "Peça mínimo 20 fotos editadas por sessão",
      "Fotos devem ser entregues em alta resolução + otimizadas para web",
      "Sempre passe as fotos pelo Cloudinary antes de usar no site",
    ],
  },
  {
    service: "Copywriting Premium",
    icon: PenTool,
    sellPrice: "R$ 300",
    cost: "R$ 0",
    profit: "R$ 300",
    margin: "100%",
    supplier: "ChatGPT Plus + prompt validado",
    deliveryTime: "1-2 dias úteis",
    whenToOffer: "Quando os textos do formulário são genéricos ou mal escritos",
    script: "\"Textos bem escritos são o que vendem no site. Posso criar toda a copy do seu site com foco em conversão por R$ 300.\"",
    tips: [
      "Use o prompt validado BR360 para gerar copy",
      "Tempo real de trabalho: ~15 minutos",
      "Entregue 3 versões de headline para o cliente escolher",
      "Inclua meta description otimizada para SEO",
      "Margem de 100% — só custa seu tempo",
    ],
  },
];

const summaryMetrics = [
  { label: "Receita média/upsell", value: "R$ 533", icon: DollarSign },
  { label: "Custo médio", value: "R$ 150", icon: Package },
  { label: "Lucro médio", value: "R$ 383", icon: TrendingUp },
  { label: "Margem média", value: "77%", icon: ArrowUpRight },
];

const Upsells = () => {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-1">Esteira de Upsells</h2>
          <p className="text-sm text-muted-foreground">
            Serviços adicionais para aumentar o ticket médio. Arbitragem pura — compre barato, venda caro.
          </p>
        </div>

        {/* Summary metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {summaryMetrics.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg border border-accent/20 bg-card/50 p-4"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <m.icon className="h-3.5 w-3.5 text-accent" />
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{m.label}</p>
              </div>
              <p className="text-2xl font-bold text-accent">{m.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Upsell cards */}
        <div className="space-y-4">
          {upsells.map((u, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-lg border border-border bg-card p-5"
            >
              {/* Header with financials */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <u.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">{u.service}</h3>
                    <p className="text-xs text-muted-foreground">{u.supplier} • {u.deliveryTime}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase">Venda</p>
                    <p className="text-lg font-bold text-foreground">{u.sellPrice}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase">Custo</p>
                    <p className="text-lg font-bold text-destructive">{u.cost}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase">Lucro</p>
                    <p className="text-lg font-bold text-accent">{u.profit}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase">Margem</p>
                    <p className="text-lg font-bold text-primary">{u.margin}</p>
                  </div>
                </div>
              </div>

              {/* When to offer */}
              <div className="rounded-md bg-primary/5 border border-primary/10 p-3 mb-3">
                <p className="text-xs text-muted-foreground">
                  <span className="text-primary font-semibold">Quando oferecer:</span> {u.whenToOffer}
                </p>
              </div>

              {/* Script */}
              <div className="rounded-md bg-muted/50 border border-border p-3 mb-3">
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1 font-bold">📋 Script de venda</p>
                <p className="text-sm italic text-foreground/80">{u.script}</p>
              </div>

              {/* Tips */}
              <div className="rounded-md bg-accent/5 border border-accent/10 p-3">
                <p className="text-[10px] font-mono uppercase tracking-wider text-accent mb-2 font-bold">💡 Dicas operacionais</p>
                <ul className="space-y-1">
                  {u.tips.map((tip, ti) => (
                    <li key={ti} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="text-accent mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Upsells;
