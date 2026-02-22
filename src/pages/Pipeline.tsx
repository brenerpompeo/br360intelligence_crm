import { motion } from "framer-motion";
import {
  Users, UserCheck, FileText, Settings, CheckCircle2,
  ArrowRight, Clock, AlertCircle
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { cn } from "@/lib/utils";

interface PipelineStage {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  description: string;
  criteria: string[];
  actions: string[];
  avgTime: string;
  conversionTip: string;
}

const stages: PipelineStage[] = [
  {
    id: "lead",
    title: "Lead",
    icon: Users,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10 border-blue-400/20",
    description: "Contato inicial — potencial cliente demonstrou interesse.",
    criteria: [
      "Chegou via indicação, Instagram ou busca",
      "Demonstrou interesse em ter site profissional",
      "Tem um negócio ativo (físico ou digital)",
    ],
    actions: [
      "Responder em <2h com mensagem padrão",
      "Enviar portfólio de exemplos BR360",
      "Qualificar: tem orçamento? Tem urgência?",
      "Agendar conversa rápida (5 min max)",
    ],
    avgTime: "1-3 dias",
    conversionTip: "Leads que respondem em <24h convertem 3x mais. Priorize velocidade.",
  },
  {
    id: "proposta",
    title: "Proposta",
    icon: FileText,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10 border-amber-400/20",
    description: "Proposta enviada — aguardando decisão do cliente.",
    criteria: [
      "Lead qualificado e interessado",
      "Proposta enviada com valores claros",
      "Setup R$ 500 + Assinatura R$ 150/mês",
    ],
    actions: [
      "Enviar proposta padronizada (Google Docs/PDF)",
      "Explicar o que está incluso vs. extras",
      "Follow-up em 48h se não respondeu",
      "Máximo 2 follow-ups antes de descartar",
    ],
    avgTime: "2-7 dias",
    conversionTip: "Incluir 1 exemplo real de site similar ao negócio do lead aumenta conversão em 40%.",
  },
  {
    id: "setup",
    title: "Em Setup",
    icon: Settings,
    color: "text-primary",
    bgColor: "bg-primary/10 border-primary/20",
    description: "Cliente pagou! Agora está no processo dos 5 passos de setup.",
    criteria: [
      "Taxa de Setup (R$ 500) paga",
      "Formulário de informações enviado",
    ],
    actions: [
      "Seguir checklist dos 5 passos de setup",
      "Prazo meta: entrega em 48h após formulário preenchido",
      "Comunicar progresso ao cliente a cada etapa",
      "Não iniciar sem formulário 100% preenchido",
    ],
    avgTime: "1-3 dias",
    conversionTip: "Entregar antes do prazo prometido gera indicações espontâneas.",
  },
  {
    id: "ativo",
    title: "Ativo",
    icon: CheckCircle2,
    color: "text-accent",
    bgColor: "bg-accent/10 border-accent/20",
    description: "Site entregue e funcionando. Cliente pagando assinatura mensal.",
    criteria: [
      "Site publicado e acessível",
      "Domínio configurado",
      "Primeira mensalidade cobrada",
    ],
    actions: [
      "Monitorar se site está online (uptime)",
      "Atender pedidos de manutenção via Payload CMS",
      "Oferecer upsells quando oportuno",
      "Cobrar mensalidade pontualmente",
    ],
    avgTime: "Contínuo",
    conversionTip: "Clientes ativos há >3 meses são os melhores para pedir indicações.",
  },
];

const metrics = [
  { label: "Meta de Leads/mês", value: "20-30", sub: "Para converter ~10 clientes" },
  { label: "Taxa de Conversão Meta", value: "30-40%", sub: "Lead → Cliente ativo" },
  { label: "Tempo Médio do Ciclo", value: "7-14 dias", sub: "Lead → Site entregue" },
  { label: "Churn Aceitável", value: "<5%/mês", sub: "Perda de clientes ativos" },
];

const Pipeline = () => {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-1">Pipeline de Vendas</h2>
          <p className="text-sm text-muted-foreground">
            Funil de conversão e guia de ações para cada etapa do pipeline.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg border border-border bg-card/50 p-4"
            >
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">{m.label}</p>
              <p className="text-2xl font-bold">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Visual funnel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {stages.map((stage, i) => (
            <div key={stage.id} className="flex items-center gap-2">
              <div className={cn("rounded-lg border px-4 py-3 min-w-[140px] text-center", stage.bgColor)}>
                <stage.icon className={cn("h-5 w-5 mx-auto mb-1", stage.color)} />
                <p className="text-sm font-semibold">{stage.title}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{stage.avgTime}</p>
              </div>
              {i < stages.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Stage details */}
        <div className="space-y-4">
          {stages.map((stage, si) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: si * 0.08 }}
              className={cn("rounded-lg border p-5", stage.bgColor)}
            >
              <div className="flex items-center gap-3 mb-4">
                <stage.icon className={cn("h-5 w-5", stage.color)} />
                <div>
                  <h3 className="text-base font-bold">{stage.title}</h3>
                  <p className="text-xs text-muted-foreground">{stage.description}</p>
                </div>
                <span className="ml-auto text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {stage.avgTime}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Criteria */}
                <div className="rounded-md bg-background/50 border border-border p-3">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 font-bold">
                    ✅ Critérios de entrada
                  </p>
                  <ul className="space-y-1.5">
                    {stage.criteria.map((c, ci) => (
                      <li key={ci} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className={cn("h-3 w-3 mt-0.5 shrink-0", stage.color)} />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="rounded-md bg-background/50 border border-border p-3">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 font-bold">
                    🎯 Ações obrigatórias
                  </p>
                  <ul className="space-y-1.5">
                    {stage.actions.map((a, ai) => (
                      <li key={ai} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <ArrowRight className={cn("h-3 w-3 mt-0.5 shrink-0", stage.color)} />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Conversion tip */}
              <div className="mt-3 rounded-md bg-primary/5 border border-primary/10 p-3 flex items-start gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <span className="text-primary font-semibold">Dica de conversão:</span> {stage.conversionTip}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Pipeline;
