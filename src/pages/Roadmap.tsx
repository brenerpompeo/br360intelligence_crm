import { motion } from "framer-motion";
import {
  CheckCircle2, Circle, Clock, Layers, ArrowRight, ArrowDown,
  ShoppingCart, Settings, Rocket, Globe, Repeat,
  AlertTriangle, Zap, CreditCard, FileText, Users,
  Database, Image, MessageSquare, ExternalLink,
  ChevronRight, Shield, Banknote, Target, Send
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import {
  BarChart3, FolderKanban, Settings2,
  DollarSign, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

/* ═══════════════════════════════════════════
   SECTION 1: TECH STACK
   ═══════════════════════════════════════════ */
const techStack = [
  { category: "Cérebro da Agência", tool: "BR360 CRM", fn: "Gestão de Leads, Propostas, MRR e Tarefas.", cost: "R$ 0", icon: Database, color: "text-primary" },
  { category: "Checkout/Cobrança", tool: "Stripe", fn: "Cobrar Taxa de Setup e gerir Assinatura Recorrente.", cost: "% por tx", icon: CreditCard, color: "text-amber-400" },
  { category: "Onboarding", tool: "Tally.so", fn: "Coletar textos, cores e logo do cliente de forma assíncrona.", cost: "R$ 0", icon: FileText, color: "text-accent" },
  { category: "Cérebro do Cliente", tool: "Payload CMS", fn: "Armazenar textos e fotos do cliente (self-hosted).", cost: "R$ 0", icon: Settings, color: "text-primary" },
  { category: "Infraestrutura", tool: "Vercel", fn: "Hospedagem de alta velocidade dos sites dos clientes.", cost: "R$ 0*", icon: Rocket, color: "text-foreground" },
  { category: "Mídia (Prevenção)", tool: "Cloudinary", fn: "Otimização automática de imagens (.webp obrigatório).", cost: "R$ 0–50", icon: Image, color: "text-amber-400" },
  { category: "Domínios", tool: "Hostinger", fn: "Compra de .com.br usando parte da verba do Setup.", cost: "~R$ 40/ano", icon: Globe, color: "text-accent" },
  { category: "Copy & Suporte", tool: "ChatGPT Plus", fn: "Geração de copy premium e suporte técnico.", cost: "R$ 100/mês", icon: MessageSquare, color: "text-primary" },
];

/* ═══════════════════════════════════════════
   SECTION 2: SALES FLOW
   ═══════════════════════════════════════════ */
const salesSteps = [
  {
    step: "2.1", title: "Triage e Qualificação", icon: Users, color: "text-blue-400",
    content: "O Lead entra no CRM (status lead). Verificação rápida: encaixa nos blocos pré-construídos (Negócio Local ou Criativo)?",
    rules: [
      "Se pedir funções complexas → recuse ou cobre R$ 5.000",
      "Responder em <2h com mensagem padrão",
      "Qualificar: tem orçamento? Tem urgência?",
    ],
  },
  {
    step: "2.2", title: "Geração da Proposta", icon: FileText, color: "text-amber-400",
    content: "No BR360 CRM, crie a proposta vinculada ao cliente.",
    rules: [
      "Condição inegociável: R$ 1.490 Setup + R$ 274,90/mês Assinatura",
      "Inserir Upsells se aplicável (Fotos +R$ 800, Copy Premium +R$ 300)",
      "Cliente lê e aceita o Contrato WaaS digitalmente",
    ],
  },
  {
    step: "2.3", title: "Gatilho de Pagamento (Assíncrono)", icon: CreditCard, color: "text-accent",
    content: "O cliente recebe o link de checkout (Stripe). Assim que o pagamento cai, o Stripe redireciona automaticamente para o formulário do Tally.so.",
    rules: [
      "⚠️ REGRA DE OURO: Setup SEMPRE pago ANTES de começar",
      "Onboarding acontece sem você gastar saliva",
      "O Stripe pode avisar o CRM via Webhook (futuro: Edge Function)",
    ],
  },
];

/* ═══════════════════════════════════════════
   SECTION 3: EXECUTION FLOW
   ═══════════════════════════════════════════ */
const executionSteps = [
  {
    step: "3.1", title: "Injeção de Dados (Payload CMS)", icon: Database, color: "text-primary", duration: "~5 min",
    tasks: [
      "Acessar Payload CMS → 'Novo Cliente'",
      "Colar textos que vieram do Tally.so",
      "Enviar fotos pelo plugin Cloudinary (formato .webp estrito)",
      "Selecionar layout: Criativo ou Local Business",
      "Copiar a API_KEY gerada pelo Payload",
    ],
  },
  {
    step: "3.2", title: "O Deploy de 3 Minutos (Vercel)", icon: Rocket, color: "text-accent", duration: "~3 min",
    tasks: [
      "Vercel → 'New Project' → Repositório Master",
      "Colar API_KEY na variável de ambiente (CLIENT_ID)",
      "Clicar Deploy → site nasce em 60 segundos",
    ],
  },
  {
    step: "3.3", title: "Ramificação de Domínio", icon: Globe, color: "text-amber-400", duration: "Variável",
    tasks: [
      "Cenário A: Comprar na Hostinger → CNAME para cname.vercel-dns.com",
      "Cenário B: Cliente já tem → Enviar instrução padrão de DNS",
      "Verificar propagação DNS (pode levar até 48h)",
      "Nunca peça senha do domínio! Envie a instrução pronta.",
    ],
  },
];

/* ═══════════════════════════════════════════
   SECTION 4: MAINTENANCE LOOP
   ═══════════════════════════════════════════ */
const maintenanceFlow = [
  { label: "Cliente pede alteração", sub: "Via WhatsApp ou CRM", icon: MessageSquare },
  { label: "Editar no Payload CMS", sub: "Trocar texto ou foto → Salvar", icon: Settings },
  { label: "Webhook para Vercel", sub: "Disparo automático de rebuild", icon: Send },
  { label: "Site atualiza em ~1 min", sub: "Sem risco de quebrar o layout", icon: CheckCircle2 },
];

const gaps = [
  { gap: "Estouro de servidor por imagens pesadas", solution: "Regra inquebrável: NENHUMA foto entra crua. Cloudinary/Squoosh → .webp obrigatório.", icon: Image },
  { gap: "Fatura surpresa (AWS S3)", solution: "PROIBIDO usar AWS nesta fase. Custos de egress podem quebrar o negócio. Cloudinary + Vercel APENAS.", icon: AlertTriangle },
  { gap: "Cliente exigindo funções exclusivas", solution: "Dizer NÃO. Fora dos blocos pré-construídos = R$ 5.000 ou cliente demitido.", icon: Shield },
  { gap: "O 'Paciente Zero'", solution: "O site BR360 = Tenant ID 000 no seu próprio sistema. Se o sistema for ruim, SEU site cai primeiro.", icon: Target },
];

/* ═══════════════════════════════════════════
   ROADMAP PHASES
   ═══════════════════════════════════════════ */
interface Phase { id: number; title: string; status: "done" | "current" | "upcoming"; quarter: string; modules: Module[]; }
interface Module { icon: React.ElementType; name: string; features: string[]; status: "done" | "building" | "planned"; }

const phases: Phase[] = [
  {
    id: 1, title: "Fundação Operacional", status: "done", quarter: "Concluído", modules: [
      { icon: BarChart3, name: "Command Center Dashboard", status: "done", features: ["Métricas tempo real (MRR, Caixa, Clientes)", "Setups pendentes e atividades recentes", "Sidebar vertical + perfil de usuário"] },
    ]
  },
  {
    id: 2, title: "Gestão de Vendas & Pipeline", status: "done", quarter: "Concluído", modules: [
      { icon: Users, name: "Pipeline Kanban + Client OS", status: "done", features: ["Kanban drag-and-drop com CRUD inline", "Client OS com tabs (Empresa, Serviços, Interações)", "Filtros por status"] },
    ]
  },
  {
    id: 3, title: "Gestão Financeira", status: "done", quarter: "Concluído", modules: [
      { icon: DollarSign, name: "Financeiro Analytics", status: "done", features: ["Gráficos Recharts (Área + Donut)", "KPIs (Receita, Despesas, Lucro Líquido)", "Plano de Contas + Ledger CRUD"] },
    ]
  },
  {
    id: 4, title: "Automação & Integrações", status: "upcoming", quarter: "Próximo", modules: [
      { icon: CreditCard, name: "Stripe → CRM Webhook", status: "planned", features: ["Edge Function no Supabase que escuta pagamento", "Cria cliente automaticamente no CRM", "Move para 'Setup' e envia notificação"] },
      { icon: Settings2, name: "Payload CMS ↔ CRM Sync", status: "planned", features: ["Sincronizar status de setup entre Payload e CRM", "Marcar cliente como 'Ativo' após deploy"] },
    ]
  },
];

const statusConfig: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  done: { icon: CheckCircle2, label: "Concluído", color: "text-accent", bg: "bg-accent/10 border-accent/20" },
  building: { icon: Clock, label: "Em construção", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  planned: { icon: Circle, label: "Planejado", color: "text-muted-foreground", bg: "bg-muted/50 border-border" },
  current: { icon: Clock, label: "Em progresso", color: "text-primary", bg: "border-primary/30 bg-primary/5" },
  upcoming: { icon: Circle, label: "Futuro", color: "text-muted-foreground", bg: "border-border bg-card/50" },
};

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */
const Roadmap = () => {
  const [activeTab, setActiveTab] = useState<"playbook" | "roadmap">("playbook");

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Playbook & Roadmap</h1>
            <p className="text-sm text-muted-foreground mt-1">Manual de operações WaaS de ponta a ponta · Visão da evolução da plataforma</p>
          </div>
          <div className="flex items-center bg-muted/50 border border-border rounded-lg p-0.5">
            <button onClick={() => setActiveTab("playbook")}
              className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", activeTab === "playbook" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              <Zap className="h-3.5 w-3.5 inline mr-1.5" /> Playbook
            </button>
            <button onClick={() => setActiveTab("roadmap")}
              className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", activeTab === "roadmap" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              <Layers className="h-3.5 w-3.5 inline mr-1.5" /> Roadmap
            </button>
          </div>
        </div>

        {/* ═══ PLAYBOOK TAB ═══ */}
        {activeTab === "playbook" && (
          <div className="space-y-10">

            {/* Thesis */}
            <div className="rounded-xl border border-primary/20 bg-card p-5 glow-primary relative overflow-hidden">
              <div className="absolute -right-6 -top-6 opacity-[0.04]"><Zap className="h-32 w-32" /></div>
              <p className="text-sm text-muted-foreground leading-relaxed relative z-10">
                <span className="text-primary font-bold text-base block mb-1">A Regra de Ouro</span>
                Você <span className="text-foreground font-semibold">NÃO</span> vende horas de design ou código. Você vende{" "}
                <span className="text-accent font-semibold">Velocidade</span>,{" "}
                <span className="text-primary font-semibold">Conversão</span> e{" "}
                <span className="text-amber-400 font-semibold">Paz de Espírito</span>{" "}
                por meio de assinatura. <span className="text-foreground font-medium">100 clientes, 1 banco de dados, 1 repositório.</span> Atrito zero.
              </p>
            </div>

            {/* ── SECTION 1: TECH STACK ── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-mono bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">01</span>
                <h2 className="text-lg font-bold">O Stack Tecnológico</h2>
              </div>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">Categoria</th>
                        <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">Ferramenta</th>
                        <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground hidden md:table-cell">Função no Funil</th>
                        <th className="text-right px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">Custo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {techStack.map((item, i) => (
                        <tr key={i} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 text-xs text-muted-foreground">{item.category}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <item.icon className={cn("h-3.5 w-3.5 shrink-0", item.color)} />
                              <span className="font-semibold text-sm">{item.tool}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell max-w-[300px]">{item.fn}</td>
                          <td className="px-4 py-3 text-right font-mono text-xs text-accent">{item.cost}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ── SECTION 2: SALES FLOW ── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-mono bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full">02</span>
                <h2 className="text-lg font-bold">O Fluxo de Venda <span className="text-muted-foreground font-normal text-sm ml-1">(Do Lead ao Caixa)</span></h2>
              </div>
              <div className="space-y-4">
                {salesSteps.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-muted/20">
                      <div className={cn("h-8 w-8 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0")}>
                        <s.icon className={cn("h-4 w-4", s.color)} />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground">PASSO {s.step}</span>
                        <h3 className="font-bold text-sm">{s.title}</h3>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground mb-3">{s.content}</p>
                      <div className="space-y-2">
                        {s.rules.map((r, ri) => (
                          <div key={ri} className="flex items-start gap-2 text-xs">
                            <ChevronRight className={cn("h-3 w-3 mt-0.5 shrink-0", s.color)} />
                            <span className={r.startsWith("⚠") ? "text-destructive font-semibold" : "text-muted-foreground"}>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── SECTION 3: EXECUTION FLOW ── */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-full">03</span>
                <h2 className="text-lg font-bold">O Fluxo de Execução <span className="text-muted-foreground font-normal text-sm ml-1">(A Máquina de Setup)</span></h2>
              </div>
              <p className="text-xs text-destructive font-medium mb-4 ml-8">O relógio começa a contar. Objetivo: site publicado em ~5 minutos de trabalho braçal.</p>

              <div className="relative">
                {/* Vertical line connecting steps */}
                <div className="absolute left-[19px] top-10 bottom-10 w-px bg-border hidden md:block" />

                <div className="space-y-4">
                  {executionSteps.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="flex gap-4">
                      {/* Step number */}
                      <div className="hidden md:flex flex-col items-center shrink-0">
                        <div className="h-10 w-10 rounded-full bg-card border-2 border-border flex items-center justify-center z-10">
                          <span className="text-xs font-bold">{s.step}</span>
                        </div>
                      </div>

                      <div className="flex-1 rounded-xl border border-border bg-card overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
                          <div className="flex items-center gap-2">
                            <s.icon className={cn("h-4 w-4", s.color)} />
                            <h3 className="font-bold text-sm">{s.title}</h3>
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {s.duration}
                          </span>
                        </div>
                        <div className="p-4 space-y-2">
                          {s.tasks.map((task, ti) => (
                            <div key={ti} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground/40" />
                              {task}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── SECTION 4: MAINTENANCE LOOP ── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-mono bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-full">04</span>
                <h2 className="text-lg font-bold">Loop de Manutenção Contínua <span className="text-muted-foreground font-normal text-sm ml-1">(O MRR)</span></h2>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground mb-4">
                  A alavancagem infinita vive aqui. Quando o cliente pedir alteração, você <span className="text-destructive font-bold">NÃO mexe no código</span>.
                </p>

                {/* Visual flow */}
                <div className="flex flex-col md:flex-row items-stretch justify-between gap-3">
                  {maintenanceFlow.map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="rounded-xl border border-border bg-muted/30 p-4 text-center w-full flex-1 flex flex-col items-center justify-center">
                        <item.icon className="h-5 w-5 text-primary mb-2" />
                        <p className="text-xs font-semibold">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</p>
                      </div>
                      {i < maintenanceFlow.length - 1 && (
                        <div className="py-2 md:hidden"><ArrowDown className="h-4 w-4 text-muted-foreground/40" /></div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-lg bg-accent/5 border border-accent/10 p-3 flex items-start gap-2">
                  <Repeat className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <span className="text-accent font-semibold">Resultado:</span> Webhook avisa Vercel → site reconstrói páginas estáticas em background → atualiza em ~1 min, sem risco de quebrar layout. Isso é o que gera R$ 274,90/mês/cliente para sempre.
                  </p>
                </div>
              </div>
            </div>

            {/* ── GAPS (PREVENÇÃO DE FALHAS) ── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <h2 className="text-sm font-mono uppercase tracking-wider text-destructive">Prevenção de Falhas (Gaps)</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {gaps.map((g, i) => (
                  <div key={i} className="rounded-xl border border-destructive/10 bg-card p-4 hover:border-destructive/20 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <g.icon className="h-4 w-4 text-destructive" />
                      <p className="text-sm font-semibold text-destructive">{g.gap}</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{g.solution}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ═══ ROADMAP TAB ═══ */}
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
