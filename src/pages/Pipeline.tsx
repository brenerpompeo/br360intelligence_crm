import { motion } from "framer-motion";
import {
  Users, UserCheck, FileText, Settings, CheckCircle2,
  ArrowRight, Clock, AlertCircle, Plus, Trash2, X, Loader2
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
  db_id: string;
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
    id: "lead", db_id: "lead", title: "Lead", icon: Users,
    color: "text-blue-400", bgColor: "bg-blue-400/10 border-blue-400/20",
    description: "Contato inicial — potencial cliente demonstrou interesse.",
    criteria: ["Chegou via indicação, Instagram ou busca", "Demonstrou interesse em ter site profissional", "Tem um negócio ativo (físico ou digital)"],
    actions: ["Responder em <2h com mensagem padrão", "Enviar portfólio de exemplos BR360", "Qualificar: tem orçamento? Tem urgência?", "Agendar conversa rápida (5 min max)"],
    avgTime: "1-3 dias",
    conversionTip: "Leads que respondem em <24h convertem 3x mais. Priorize velocidade.",
  },
  {
    id: "proposta", db_id: "proposta", title: "Proposta", icon: FileText,
    color: "text-amber-400", bgColor: "bg-amber-400/10 border-amber-400/20",
    description: "Proposta enviada — aguardando decisão do cliente.",
    criteria: ["Lead qualificado e interessado", "Proposta enviada com valores claros", "Setup R$ 1.490 + Assinatura R$ 274,90/mês"],
    actions: ["Enviar proposta padronizada", "Explicar o que está incluso vs. extras", "Follow-up em 48h se não respondeu", "Máximo 2 follow-ups antes de descartar"],
    avgTime: "2-7 dias",
    conversionTip: "Incluir 1 exemplo real de site similar ao negócio do lead aumenta conversão em 40%.",
  },
  {
    id: "setup", db_id: "setup", title: "Em Setup", icon: Settings,
    color: "text-primary", bgColor: "bg-primary/10 border-primary/20",
    description: "Cliente pagou! Agora está no processo dos 5 passos de setup.",
    criteria: ["Taxa de Setup (R$ 1.490) paga", "Formulário de informações enviado"],
    actions: ["Seguir checklist dos 5 passos", "Prazo meta: entrega em 48h", "Comunicar progresso ao cliente", "Não iniciar sem formulário preenchido"],
    avgTime: "1-3 dias",
    conversionTip: "Entregar antes do prazo prometido gera indicações espontâneas.",
  },
  {
    id: "ativo", db_id: "ativo", title: "Ativo", icon: CheckCircle2,
    color: "text-accent", bgColor: "bg-accent/10 border-accent/20",
    description: "Site entregue e funcionando. Cliente pagando assinatura mensal.",
    criteria: ["Site publicado e acessível", "Domínio configurado", "Primeira mensalidade cobrada"],
    actions: ["Monitorar uptime", "Atender manutenção via Payload CMS", "Oferecer upsells oportunamente", "Cobrar mensalidade pontualmente"],
    avgTime: "Contínuo",
    conversionTip: "Clientes ativos há >3 meses são os melhores para pedir indicações.",
  },
];

const Pipeline = () => {
  const { user, workspaceId } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [draggedClient, setDraggedClient] = useState<string | null>(null);
  const [addingToStage, setAddingToStage] = useState<string | null>(null);
  const [newClientName, setNewClientName] = useState("");
  const [newClientCompany, setNewClientCompany] = useState("");
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  const { data: clients = [] } = useQuery({
    queryKey: ["kanban-clients", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, pipeline_stage, company_name, status, email, phone")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!workspaceId,
  });

  const updateStage = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const statusMap: Record<string, string> = { lead: "lead", proposta: "lead", setup: "active", ativo: "active" };
      const { error } = await supabase.from("clients").update({ pipeline_stage: stage, status: statusMap[stage] || "lead" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["kanban-clients"] }); },
    onError: (e: Error) => toast({ title: "Erro ao mover", description: e.message, variant: "destructive" }),
  });

  const addClient = useMutation({
    mutationFn: async ({ name, company, stage }: { name: string; company: string; stage: string }) => {
      const statusMap: Record<string, string> = { lead: "lead", proposta: "lead", setup: "active", ativo: "active" };
      const { error } = await supabase.from("clients").insert({
        name,
        company_name: company || null,
        pipeline_stage: stage,
        status: statusMap[stage] || "lead",
        user_id: user!.id,
        workspace_id: workspaceId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kanban-clients"] });
      setAddingToStage(null); setNewClientName(""); setNewClientCompany("");
      toast({ title: "Cliente adicionado!" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["kanban-clients"] }); toast({ title: "Cliente removido." }); },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const handleDragStart = (e: React.DragEvent, id: string) => { e.dataTransfer.setData("clientId", id); setDraggedClient(id); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
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

  const getClientsInStage = (stageId: string) => {
    return clients.filter((c: any) => c.pipeline_stage === stageId || (stageId === 'lead' && !c.pipeline_stage));
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pipeline de Vendas</h1>
            <p className="text-sm text-muted-foreground mt-1">Arraste os clientes entre as colunas. Clique "+" para adicionar direto no estágio.</p>
          </div>
        </div>

        {/* Functional Kanban Board */}
        <div className="flex items-start gap-4 overflow-x-auto pb-4 scrollbar-none" style={{ minHeight: "520px" }}>
          {stages.map((stage) => {
            const stageClients = getClientsInStage(stage.db_id);
            const isAdding = addingToStage === stage.db_id;

            return (
              <div
                key={stage.id}
                className={cn("flex flex-col min-w-[280px] w-[280px] rounded-xl border bg-card/40 p-3 transition-colors shrink-0",
                  stage.bgColor,
                  draggedClient ? "hover:border-primary/50 hover:bg-card/60" : ""
                )}
                style={{ minHeight: "480px" }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.db_id)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <stage.icon className={cn("h-4 w-4", stage.color)} />
                    <h3 className="font-bold text-sm">{stage.title}</h3>
                    <span className="text-xs font-mono text-muted-foreground bg-background px-2 py-0.5 rounded-full border">{stageClients.length}</span>
                  </div>
                  <button
                    onClick={() => { setAddingToStage(isAdding ? null : stage.db_id); setNewClientName(""); setNewClientCompany(""); }}
                    className={cn("p-1 rounded-md transition-colors", isAdding ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
                  >
                    {isAdding ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* Inline Add Form */}
                {isAdding && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    onSubmit={(e) => { e.preventDefault(); if (newClientName.trim()) addClient.mutate({ name: newClientName, company: newClientCompany, stage: stage.db_id }); }}
                    className="mb-3 rounded-lg border border-primary/30 bg-card p-3 space-y-2"
                  >
                    <input
                      autoFocus
                      required
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:border-primary"
                      placeholder="Nome do cliente..."
                    />
                    <input
                      value={newClientCompany}
                      onChange={(e) => setNewClientCompany(e.target.value)}
                      className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:border-primary"
                      placeholder="Empresa (opcional)"
                    />
                    <button type="submit" disabled={addClient.isPending} className="w-full bg-primary text-primary-foreground text-xs font-medium py-1.5 rounded-md hover:bg-primary/90 flex items-center justify-center gap-1">
                      {addClient.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Plus className="h-3 w-3" /> Adicionar</>}
                    </button>
                  </motion.form>
                )}

                {/* Cards */}
                <div className="flex-1 overflow-y-auto space-y-2 pb-2 pr-1 scrollbar-none">
                  {stageClients.map((client: any) => {
                    const isDragging = draggedClient === client.id;
                    return (
                      <div
                        key={client.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, client.id)}
                        onDragEnd={() => setDraggedClient(null)}
                        className={cn(
                          "cursor-grab active:cursor-grabbing rounded-lg border bg-card p-3 shadow-sm hover:border-primary/40 transition-all relative group",
                          isDragging && "opacity-40 border-dashed border-primary scale-95"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm truncate">{client.name}</p>
                            {client.company_name && <p className="text-xs text-muted-foreground truncate">{client.company_name}</p>}
                            {client.email && <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">{client.email}</p>}
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteClient.mutate(client.id); }}
                            className="p-1 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all shrink-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {stageClients.length === 0 && !isAdding && (
                    <div className="h-full min-h-[100px] w-full rounded-lg border border-dashed border-border flex items-center justify-center opacity-40">
                      <p className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">Soltar aqui</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stage Guide (collapsible) */}
        <div className="space-y-3">
          <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> Guia de Ações por Estágio
          </h2>
          {stages.map((stage, si) => (
            <div
              key={stage.id}
              className={cn("rounded-lg border overflow-hidden", stage.bgColor)}
            >
              <button
                onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-background/30 transition-colors"
              >
                <stage.icon className={cn("h-4 w-4 shrink-0", stage.color)} />
                <div className="flex-1">
                  <h3 className="text-sm font-bold">{stage.title}</h3>
                  <p className="text-xs text-muted-foreground">{stage.description}</p>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 shrink-0">
                  <Clock className="h-3 w-3" /> {stage.avgTime}
                </span>
              </button>

              {expandedStage === stage.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="px-4 pb-4"
                >
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-md bg-background/50 border border-border p-3">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 font-bold">✅ Critérios de entrada</p>
                      <ul className="space-y-1.5">
                        {stage.criteria.map((c, ci) => (
                          <li key={ci} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className={cn("h-3 w-3 mt-0.5 shrink-0", stage.color)} /> {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-md bg-background/50 border border-border p-3">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 font-bold">🎯 Ações obrigatórias</p>
                      <ul className="space-y-1.5">
                        {stage.actions.map((a, ai) => (
                          <li key={ai} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <ArrowRight className={cn("h-3 w-3 mt-0.5 shrink-0", stage.color)} /> {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-3 rounded-md bg-primary/5 border border-primary/10 p-3 flex items-start gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      <span className="text-primary font-semibold">Dica de conversão:</span> {stage.conversionTip}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Pipeline;
