import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, Users, CreditCard,
  ArrowUpRight, ArrowDownRight, Calculator, Target,
  AlertTriangle, CheckCircle2
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";

const mrrSimulation = [
  { clients: 10, mrr: "R$ 1.500", setup: "R$ 5.000", annual: "R$ 23.000" },
  { clients: 25, mrr: "R$ 3.750", setup: "R$ 12.500", annual: "R$ 57.500" },
  { clients: 50, mrr: "R$ 7.500", setup: "R$ 25.000", annual: "R$ 115.000" },
  { clients: 75, mrr: "R$ 11.250", setup: "R$ 37.500", annual: "R$ 172.500" },
  { clients: 100, mrr: "R$ 15.000", setup: "R$ 50.000", annual: "R$ 230.000" },
];

const costs = [
  { item: "Vercel (Hosting)", cost: "R$ 0", note: "Hobby plan gratuito até escala massiva" },
  { item: "Payload CMS", cost: "R$ 0", note: "Self-hosted, sem custo de licença" },
  { item: "Cloudinary (Imagens)", cost: "R$ 0-50/mês", note: "Free tier generoso, escala sob demanda" },
  { item: "Domínios (Hostinger)", cost: "~R$ 40/ano cada", note: "Pago com parte do Setup do cliente" },
  { item: "ChatGPT Plus", cost: "R$ 100/mês", note: "Para copywriting e suporte" },
  { item: "Ferramentas (Tally, etc.)", cost: "R$ 0", note: "Free tiers suficientes" },
];

const cashFlowRules = [
  {
    icon: CheckCircle2,
    color: "text-accent",
    title: "Receitas",
    items: [
      "Taxa de Setup: R$ 500 por cliente (receita única)",
      "Assinatura: R$ 150/mês por cliente (receita recorrente)",
      "Upsells: R$ 300-800 por serviço (receita variável)",
    ],
  },
  {
    icon: ArrowDownRight,
    color: "text-destructive",
    title: "Custos fixos mensais",
    items: [
      "Infraestrutura: ~R$ 100-150/mês total",
      "ChatGPT Plus: R$ 100/mês",
      "Domínios: diluído no Setup",
    ],
  },
  {
    icon: AlertTriangle,
    color: "text-warning",
    title: "Regras de ouro",
    items: [
      "NUNCA usar AWS S3 — custos de egress podem quebrar o negócio",
      "Setup SEMPRE pago antes de começar o trabalho",
      "Margem mínima por cliente: R$ 120/mês (após custos rateados)",
      "Churn >5%/mês = sinal de alerta, investigar causas",
    ],
  },
];

const kpis = [
  { label: "MRR Meta", value: "R$ 15.000", sub: "100 clientes × R$ 150", icon: Target, color: "text-primary" },
  { label: "Custo Marginal", value: "~R$ 0", sub: "Por cliente adicional", icon: Calculator, color: "text-accent" },
  { label: "Setup Receita", value: "R$ 500", sub: "Por cliente (uma vez)", icon: CreditCard, color: "text-amber-400" },
  { label: "Break-even", value: "~15 clientes", sub: "Custos fixos cobertos", icon: TrendingUp, color: "text-accent" },
];

const Financeiro = () => {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-1">Painel Financeiro</h2>
          <p className="text-sm text-muted-foreground">
            Referência de receitas, custos, simulações de MRR e regras financeiras do negócio.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg border border-border bg-card/50 p-4"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <kpi.icon className={`h-3.5 w-3.5 ${kpi.color}`} />
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
              </div>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* MRR Simulation table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Simulação de Receita por Número de Clientes
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Clientes</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">MRR</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Setup Total</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Receita Anual*</th>
                </tr>
              </thead>
              <tbody>
                {mrrSimulation.map((row, i) => (
                  <tr key={i} className={`border-b border-border/50 ${row.clients === 100 ? "bg-primary/5" : ""}`}>
                    <td className="px-4 py-3 font-bold">
                      <span className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        {row.clients}
                        {row.clients === 100 && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-mono">META</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-primary font-semibold">{row.mrr}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.setup}</td>
                    <td className="px-4 py-3 text-accent font-semibold">{row.annual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 text-[10px] text-muted-foreground font-mono border-t border-border">
            *Receita Anual = (MRR × 12) + Setup Total. Não inclui upsells.
          </div>
        </motion.div>

        {/* Costs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-destructive" />
              Estrutura de Custos
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Item</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Custo</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Nota</th>
                </tr>
              </thead>
              <tbody>
                {costs.map((c, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="px-4 py-3 font-medium">{c.item}</td>
                    <td className="px-4 py-3 font-mono text-accent">{c.cost}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Cash flow rules */}
        <div className="grid md:grid-cols-3 gap-4">
          {cashFlowRules.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <section.icon className={`h-4 w-4 ${section.color}`} />
                <h3 className="text-sm font-bold">{section.title}</h3>
              </div>
              <ul className="space-y-2">
                {section.items.map((item, ii) => (
                  <li key={ii} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className={`${section.color} mt-0.5`}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Financeiro;
