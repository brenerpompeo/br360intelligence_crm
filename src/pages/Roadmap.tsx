import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Users, FolderKanban, TrendingUp,
  DollarSign, Settings2, BarChart3, CheckCircle2,
  Circle, Clock, Layers, ArrowRight
} from "lucide-react";

interface Phase {
  id: number;
  title: string;
  status: "done" | "current" | "upcoming";
  quarter: string;
  modules: Module[];
}

interface Module {
  icon: React.ElementType;
  name: string;
  features: string[];
  status: "done" | "building" | "planned";
}

const phases: Phase[] = [
  {
    id: 1,
    title: "Fundação Operacional",
    status: "done",
    quarter: "Concluído",
    modules: [
      {
        icon: BarChart3,
        name: "Analytics — Dashboard KPIs",
        status: "done",
        features: [
          "Métricas-chave (Meta clientes, MRR, Avatares, Custo Infra)",
          "Tabela de arquitetura técnica",
          "Loop de execução — Workflow diário com checklist",
          "Prevenção de falhas (Gaps) com soluções",
          "Esteira de upsells com margens",
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Gestão de Vendas & Pipeline",
    status: "upcoming",
    quarter: "Fase 2",
    modules: [
      {
        icon: Users,
        name: "Gestão de Vendas & Clientes",
        status: "planned",
        features: [
          "Pipeline visual (Kanban): Lead → Contato → Proposta → Setup → Ativo",
          "Ficha do cliente com dados do formulário Tally",
          "Status de pagamento (Setup pago / Assinatura ativa)",
          "Histórico de interações e notas",
          "Acompanhamento de conversão por etapa",
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Gestão de Projetos & Setup",
    status: "upcoming",
    quarter: "Fase 3",
    modules: [
      {
        icon: FolderKanban,
        name: "Gestão de Projetos/Setup",
        status: "planned",
        features: [
          "Rastreamento dos 5 passos de setup por cliente",
          "Barra de progresso visual por projeto",
          "Prazos e SLAs por etapa",
          "Atribuição de responsáveis",
          "Alertas de atraso automáticos",
        ],
      },
      {
        icon: Settings2,
        name: "Operações",
        status: "planned",
        features: [
          "Checklist de setup reutilizável",
          "Tarefas operacionais recorrentes",
          "Automações (webhook Payload → atualização de status)",
          "Log de alterações por cliente",
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Financeiro & Upsells",
    status: "upcoming",
    quarter: "Fase 4",
    modules: [
      {
        icon: DollarSign,
        name: "Financeiro",
        status: "planned",
        features: [
          "Dashboard de MRR real vs. meta",
          "Receita de setup acumulada",
          "Fluxo de caixa mensal (entradas vs. custos)",
          "Margem de lucro por cliente",
          "Previsão de receita (forecast)",
        ],
      },
      {
        icon: TrendingUp,
        name: "Gestão de Upsells",
        status: "planned",
        features: [
          "Catálogo de serviços adicionais com preços",
          "Controle de fornecedores e custos",
          "Margem por upsell vendido",
          "Pipeline de upsell por cliente",
          "Relatório de receita extra mensal",
        ],
      },
    ],
  },
];

const statusConfig = {
  done: { icon: CheckCircle2, label: "Concluído", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  building: { icon: Clock, label: "Em construção", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  planned: { icon: Circle, label: "Planejado", color: "text-muted-foreground", bg: "bg-muted/50 border-border" },
  current: { icon: Clock, label: "Em progresso", color: "text-primary", bg: "border-primary/30 bg-primary/5" },
  upcoming: { icon: Circle, label: "Futuro", color: "text-muted-foreground", bg: "border-border bg-card/50" },
};

const Roadmap = () => {
  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <span className="text-border">/</span>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <h1 className="text-sm font-bold tracking-tight">
                Roadmap de <span className="text-gradient">Evolução</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Intro */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-primary/20 bg-card/50 p-5 glow-primary">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="text-primary font-semibold">Escopo:</span> Esta ferramenta gerencia{" "}
            <span className="text-foreground font-medium">vendas, projetos, financeiro e operações</span> do negócio BR360.
            O <span className="text-foreground font-medium">Payload CMS</span> continua gerenciando os dados dos sites dos clientes (textos, cores, imagens).
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-px bg-border hidden sm:block" />

          <div className="space-y-8">
            {phases.map((phase, pi) => {
              const PhaseIcon = statusConfig[phase.status].icon;
              return (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: pi * 0.1 }}
                >
                  {/* Phase header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-10 w-10 rounded-full border flex items-center justify-center shrink-0 ${statusConfig[phase.status].bg}`}>
                      <PhaseIcon className={`h-4 w-4 ${statusConfig[phase.status].color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold">{phase.title}</h2>
                        <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border ${statusConfig[phase.status].bg} ${statusConfig[phase.status].color}`}>
                          {phase.quarter}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Modules */}
                  <div className="sm:ml-[52px] space-y-3">
                    {phase.modules.map((mod, mi) => {
                      const ModIcon = mod.icon;
                      const modStatus = statusConfig[mod.status];
                      return (
                        <div key={mi} className={`rounded-lg border p-4 ${modStatus.bg}`}>
                          <div className="flex items-center gap-2 mb-3">
                            <ModIcon className={`h-4 w-4 ${modStatus.color}`} />
                            <h3 className="text-sm font-semibold">{mod.name}</h3>
                            <span className={`ml-auto text-[10px] font-mono uppercase ${modStatus.color}`}>
                              {modStatus.label}
                            </span>
                          </div>
                          <ul className="space-y-1.5">
                            {mod.features.map((f, fi) => (
                              <li key={fi} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <ArrowRight className={`h-3 w-3 mt-0.5 shrink-0 ${modStatus.color}`} />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <footer className="border-t pt-6 pb-8 text-center">
          <p className="text-xs text-muted-foreground font-mono">
            BR360 Intelligence — Roadmap de Evolução — Ferramenta de Gestão Interna
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Roadmap;
