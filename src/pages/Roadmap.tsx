import { motion } from "framer-motion";
import {
  CheckCircle2, Circle, Clock, Layers, ArrowRight,
  ShoppingCart, Settings, Rocket, Globe, Repeat,
  AlertTriangle, Zap
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import {
  BarChart3, Users, FolderKanban, Settings2,
  DollarSign, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

/* ── Workflow Guide (the original 5-step execution loop) ── */
const workflowSteps = [
  {
    title: "Venda & Triage",
    duration: "Assíncrono",
    icon: ShoppingCart,
    color: "text-blue-400",
    tasks: [
      "Cliente pagou Taxa de Setup (R$ 1.490)?",
      "Redirecionado para formulário (Tally.so/Typeform)?",
      "Perguntas respondidas: cores, texto, domínio, logo/fotos?",
    ],
  },
  {
    title: "Setup no Cérebro (Payload CMS)",
    duration: "~5 min",
    icon: Settings,
    color: "text-primary",
    tasks: [
      "Acessar Payload CMS → 'Novo Cliente'",
      "Colar textos do formulário",
      "Enviar fotos via plugin Cloudinary (otimização automática)",
      "Selecionar layout: criativo ou local_business",
      "Copiar API_KEY gerada",
    ],
  },
  {
    title: "Deploy na Vercel",
    duration: "~3 min",
    icon: Rocket,
    color: "text-accent",
    tasks: [
      "Vercel → 'New Project' → Repositório Master",
      "Colar API_KEY na variável CLIENT_ID",
      "Clicar Deploy (site nasce em 60s)",
    ],
  },
  {
    title: "Domínio (Ramificação)",
    duration: "Variável",
    icon: Globe,
    color: "text-amber-400",
    tasks: [
      "Cenário A: Comprar domínio na Hostinger com parte do Setup",
      "Cenário A: Criar CNAME → cname.vercel-dns.com",
      "Cenário B: Enviar instrução padrão ao cliente (sem pedir senha!)",
      "Verificar propagação DNS",
    ],
  },
  {
    title: "Loop de Manutenção",
    duration: "Contínuo",
    icon: Repeat,
    color: "text-muted-foreground",
    tasks: [
      "Alteração pedida? Editar no Payload CMS → Salvar",
      "Webhook avisa Vercel → site atualiza em ~1 min",
      "NÃO mexer no código para manutenção",
    ],
  },
];

const gaps = [
  { gap: "Estouro de servidor por imagens", solution: "Regra inquebrável: nenhuma foto entra crua. Cloudinary/Squoosh → .webp obrigatório." },
  { gap: "Fatura surpresa (AWS S3)", solution: "Proibido usar AWS nesta fase. Custos de egress podem quebrar o negócio. Ficar com Cloudinary + Vercel." },
  { gap: "Cliente exigindo funções exclusivas", solution: "Dizer NÃO. Fora dos blocos pré-construídos = R$ 5.000 ou cliente demitido." },
  { gap: "O 'Paciente Zero'", solution: "Site BR360 = Tenant ID 000 no próprio sistema. Se o sistema for ruim, seu site cai." },
];

/* ── Roadmap Phases ── */
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
    id: 1, title: "Fundação Operacional", status: "done", quarter: "Concluído",
    modules: [{
      icon: BarChart3, name: "Command Center Dashboard", status: "done",
      features: ["Métricas em tempo real (MRR, Caixa, Clientes Ativos)", "Setups pendentes e atividades recentes", "Sidebar vertical com perfil de usuário"]
    }],
  },
  {
    id: 2, title: "Gestão de Vendas & Pipeline", status: "done", quarter: "Concluído",
    modules: [{
      icon: Users, name: "Pipeline Kanban + Client OS", status: "done",
      features: ["Kanban drag-and-drop com CRUD inline", "Client OS com tabs (Empresa, Serviços, Interações)", "Filtros por status (Lead, Ativo, Inativo, Churned)"]
    }],
  },
  {
    id: 3, title: "Gestão Financeira", status: "done", quarter: "Concluído",
    modules: [{
      icon: DollarSign, name: "Financeiro Analytics", status: "done",
      features: ["Gráficos Recharts (Área + Donut)", "KPIs (Receita, Despesas, Lucro Líquido)", "Plano de Contas + Ledger CRUD"]
    }],
  },
  {
    id: 4, title: "Automação & Escala", status: "upcoming", quarter: "Próximo",
    modules: [
      { icon: TrendingUp, name: "Contratos & Propostas", status: "done", features: ["Geração de propostas WaaS", "Contrato digital padronizado"] },
      { icon: FolderKanban, name: "Setup Checklist", status: "done", features: ["Checklist interativo dos 5 passos", "Progresso visual por cliente"] },
    ],
  },
];

const statusConfig = {
  done: { icon: CheckCircle2, label: "Concluído", color: "text-accent", bg: "bg-accent/10 border-accent/20" },
  building: { icon: Clock, label: "Em construção", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  planned: { icon: Circle, label: "Planejado", color: "text-muted-foreground", bg: "bg-muted/50 border-border" },
  current: { icon: Clock, label: "Em progresso", color: "text-primary", bg: "border-primary/30 bg-primary/5" },
  upcoming: { icon: Circle, label: "Futuro", color: "text-muted-foreground", bg: "border-border bg-card/50" },
};

const Roadmap = () => {
  const [activeTab, setActiveTab] = useState<"playbook" | "roadmap">("playbook");

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Playbook & Roadmap</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Guias operacionais e visão geral da evolução da plataforma.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-muted/50 border border-border rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab("playbook")}
              className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", activeTab === "playbook" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              <Zap className="h-3.5 w-3.5 inline mr-1.5" /> Playbook
            </button>
            <button
              onClick={() => setActiveTab("roadmap")}
              className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", activeTab === "roadmap" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              <Layers className="h-3.5 w-3.5 inline mr-1.5" /> Roadmap
            </button>
          </div>
        </div>

        {/* ── PLAYBOOK TAB ── */}
        {activeTab === "playbook" && (
          <div className="space-y-6">
            {/* Thesis Reminder */}
            <div className="rounded-xl border border-primary/20 bg-card p-5 glow-primary">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="text-primary font-semibold">Lembrete:</span> Você não vende código ou horas de design.
                Você vende <span className="text-foreground font-medium">Velocidade, Conversão e Paz de Espírito</span> por
                meio de assinatura (Setup + R$ 274,90/mês). 100 clientes, 1 banco de dados, 1 repositório.
              </p>
            </div>

            {/* Workflow Steps */}
            <div>
              <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4" /> Loop de Execução — Workflow Diário
              </h2>
              <p className="text-xs text-destructive mb-4 font-medium">⚠ Se pular um passo, a alavancagem quebra.</p>
              <div className="space-y-3">
                {workflowSteps.map((step, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="flex items-center gap-4 p-4">
                      <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0 bg-muted border border-border")}>
                        <step.icon className={cn("h-4 w-4", step.color)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-mono text-muted-foreground">PASSO {i + 1}</span>
                          <span className="text-[10px] font-mono text-muted-foreground/60">· {step.duration}</span>
                        </div>
                        <h3 className="font-bold text-sm">{step.title}</h3>
                      </div>
                    </div>
                    <div className="px-4 pb-4 pl-16">
                      <ul className="space-y-1.5">
                        {step.tasks.map((task, ti) => (
                          <li key={ti} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground/40" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gaps */}
            <div>
              <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Prevenção de Falhas (Gaps)
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {gaps.map((g, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-4">
                    <p className="text-sm font-semibold text-destructive mb-1.5 flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5" /> {g.gap}
                    </p>
                    <p className="text-xs text-muted-foreground">{g.solution}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ROADMAP TAB ── */}
        {activeTab === "roadmap" && (
          <div className="relative">
            <div className="absolute left-[19px] top-4 bottom-4 w-px bg-border hidden sm:block" />
            <div className="space-y-8">
              {phases.map((phase, pi) => {
                const PhaseIcon = statusConfig[phase.status].icon;
                return (
                  <motion.div key={phase.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: pi * 0.1 }}>
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
                        const modStatus = statusConfig[mod.status];
                        return (
                          <div key={mi} className={`rounded-lg border p-4 ${modStatus.bg}`}>
                            <div className="flex items-center gap-2 mb-3">
                              <mod.icon className={`h-4 w-4 ${modStatus.color}`} />
                              <h4 className="text-sm font-semibold">{mod.name}</h4>
                              <span className={`ml-auto text-[10px] font-mono uppercase ${modStatus.color}`}>{modStatus.label}</span>
                            </div>
                            <ul className="space-y-1.5">
                              {mod.features.map((f, fi) => (
                                <li key={fi} className="flex items-start gap-2 text-xs text-muted-foreground">
                                  <ArrowRight className={`h-3 w-3 mt-0.5 shrink-0 ${modStatus.color}`} /> {f}
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
        )}
      </div>
    </AppLayout>
  );
};

export default Roadmap;
