import { motion } from "framer-motion";
import {
  CheckCircle2, Circle, Clock, Layers, ArrowRight
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import {
  BarChart3, Users, FolderKanban, Settings2,
  DollarSign, TrendingUp
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
    status: "done",
    quarter: "Concluído",
    modules: [
      {
        icon: Users,
        name: "Gestão de Vendas & Clientes",
        status: "done",
        features: [
          "Pipeline visual: Lead → Proposta → Setup → Ativo",
          "Critérios de entrada por etapa",
          "Ações obrigatórias por etapa",
          "Dicas de conversão",
          "Métricas de funil",
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Gestão de Projetos & Setup",
    status: "done",
    quarter: "Concluído",
    modules: [
      {
        icon: FolderKanban,
        name: "Gestão de Projetos/Setup",
        status: "done",
        features: [
          "Checklist interativo dos 5 passos de setup",
          "Barra de progresso visual por passo",
          "Dicas operacionais por etapa",
          "Instruções detalhadas com sub-tarefas",
        ],
      },
      {
        icon: Settings2,
        name: "Operações",
        status: "done",
        features: [
          "Checklist de setup reutilizável",
          "Guia de manutenção via Payload CMS",
          "Regras de domínio (Cenários A e B)",
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Financeiro & Upsells",
    status: "done",
    quarter: "Concluído",
    modules: [
      {
        icon: DollarSign,
        name: "Financeiro",
        status: "done",
        features: [
          "Simulação de MRR por número de clientes",
          "Estrutura de custos detalhada",
          "Regras de fluxo de caixa",
          "KPIs financeiros (break-even, margem)",
        ],
      },
      {
        icon: TrendingUp,
        name: "Gestão de Upsells",
        status: "done",
        features: [
          "Catálogo de serviços com preços e margens",
          "Scripts de venda prontos",
          "Controle de fornecedores e custos",
          "Dicas operacionais por upsell",
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
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-1">Roadmap de <span className="text-gradient">Evolução</span></h2>
          <p className="text-sm text-muted-foreground">
            Visão geral de todas as áreas da ferramenta. O Payload CMS gerencia os dados dos sites dos clientes.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
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
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-10 w-10 rounded-full border flex items-center justify-center shrink-0 ${statusConfig[phase.status].bg}`}>
                      <PhaseIcon className={`h-4 w-4 ${statusConfig[phase.status].color}`} />
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold">{phase.title}</h3>
                      <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border ${statusConfig[phase.status].bg} ${statusConfig[phase.status].color}`}>
                        {phase.quarter}
                      </span>
                    </div>
                  </div>

                  <div className="sm:ml-[52px] space-y-3">
                    {phase.modules.map((mod, mi) => {
                      const ModIcon = mod.icon;
                      const modStatus = statusConfig[mod.status];
                      return (
                        <div key={mi} className={`rounded-lg border p-4 ${modStatus.bg}`}>
                          <div className="flex items-center gap-2 mb-3">
                            <ModIcon className={`h-4 w-4 ${modStatus.color}`} />
                            <h4 className="text-sm font-semibold">{mod.name}</h4>
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
      </div>
    </AppLayout>
  );
};

export default Roadmap;
