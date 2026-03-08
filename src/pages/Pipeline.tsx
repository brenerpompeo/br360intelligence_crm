import { motion } from "framer-motion";
import {
  Users, UserCheck, FileText, Settings, CheckCircle2,
  ArrowRight, Clock, AlertCircle
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface PipelineStage {
  id: string;
  db_id: string; // The pipeline_stage value in DB
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
    db_id: "lead",
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
    db_id: "proposta",
    title: "Proposta",
    icon: FileText,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10 border-amber-400/20",
    description: "Proposta enviada — aguardando decisão do cliente.",
    criteria: [
      "Lead qualificado e interessado",
      "Proposta enviada com valores claros",
      "Setup R$ 1.490 + Assinatura R$ 274,90/mês",
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
    db_id: "setup",
    title: "Em Setup",
    icon: Settings,
    color: "text-primary",
    bgColor: "bg-primary/10 border-primary/20",
    description: "Cliente pagou! Agora está no processo dos 5 passos de setup.",
    criteria: [
      "Taxa de Setup (R$ 1.490) paga",
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
    db_id: "ativo",
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
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [draggedClient, setDraggedClient] = useState<string | null>(null);

  const { data: clients = [] } = useQuery({
    queryKey: ["kanban-clients"],
    queryFn: async () => {
      // Notice: Only user! in non-demo, but this works.
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, pipeline_stage, company_name")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateStage = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const { error } = await supabase.from("clients").update({ pipeline_stage: stage }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kanban-clients"] });
    },
    onError: (e: Error) => {
      toast({ title: "Erro ao mover cliente", description: e.message, variant: "destructive" });
    }
  });

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("clientId", id);
    setDraggedClient(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, stageDbId: string) => {
    e.preventDefault();
    const clientId = e.dataTransfer.getData("clientId");
    setDraggedClient(null);
    if (!clientId) return;

    const client = clients.find((c: any) => c.id === clientId);
    if (client && client.pipeline_stage !== stageDbId) {
      updateStage.mutate({ id: clientId, stage: stageDbId });
    }
  };

  // Safe checks if pipeline_stage doesn't exist yet (for demo/legacy data)
  const getClientsInStage = (stageId: string) => {
    return clients.filter((c: any) => c.pipeline_stage === stageId || (stageId === 'lead' && !c.pipeline_stage));
  };

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

        {/* Functional Kanban Board */}
        <div className="flex items-start gap-4 overflow-x-auto pb-4 h-[500px]">
          {stages.map((stage) => {
            const stageClients = getClientsInStage(stage.db_id);
            return (
              <div
                key={stage.id}
                className={cn("flex flex-col min-w-[280px] w-[280px] h-full rounded-xl border bg-card/40 p-3 transition-colors",
                  stage.bgColor,
                  draggedClient ? "hover:border-primary/50 hover:bg-card/60" : ""
                )}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.db_id)}
              >
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <stage.icon className={cn("h-4 w-4", stage.color)} />
                    <h3 className="font-bold text-sm">{stage.title}</h3>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground bg-background px-2 py-0.5 rounded-full border">{stageClients.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pb-2 pr-1 custom-scrollbar min-h-[100px]">
                  {stageClients.map((client: any) => {
                    const isDragging = draggedClient === client.id;
                    return (
                      <div
                        key={client.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, client.id)}
                        onDragEnd={() => setDraggedClient(null)}
                        className={cn(
                          "cursor-grab active:cursor-grabbing rounded-lg border bg-card p-3 shadow-sm hover:border-primary/50 transition-colors relative z-10",
                          isDragging && "opacity-50 border-dashed border-primary"
                        )}
                      >
                        <p className="font-semibold text-sm truncate">{client.name}</p>
                        {client.company_name && (
                          <p className="text-xs text-muted-foreground truncate">{client.company_name}</p>
                        )}
                      </div>
                    );
                  })}

                  {stageClients.length === 0 && (
                    <div className="h-full min-h-[100px] w-full rounded-lg border border-dashed border-border flex items-center justify-center opacity-50 relative pointer-events-none">
                      <p className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">Soltar aqui</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
