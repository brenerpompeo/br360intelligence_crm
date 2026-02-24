import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Plus, Search, Phone, Mail, Building2,
  FileText, MessageSquare, X, ChevronDown, ChevronRight,
  Edit2, Trash2, Calendar, Loader2
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ClientStatus = "lead" | "active" | "inactive" | "churned";
type InteractionType = "call" | "email" | "meeting" | "whatsapp" | "other";

const statusColors: Record<ClientStatus, string> = {
  lead: "bg-blue-400/15 text-blue-400",
  active: "bg-accent/15 text-accent",
  inactive: "bg-muted text-muted-foreground",
  churned: "bg-destructive/15 text-destructive",
};

const statusLabels: Record<ClientStatus, string> = {
  lead: "Lead",
  active: "Ativo",
  inactive: "Inativo",
  churned: "Churned",
};

const interactionLabels: Record<InteractionType, string> = {
  call: "Ligação",
  email: "E-mail",
  meeting: "Reunião",
  whatsapp: "WhatsApp",
  other: "Outro",
};

const CRM = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ClientStatus | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [showInteractionForm, setShowInteractionForm] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "", company_name: "", email: "", phone: "",
    cnpj_cpf: "", address: "", city: "", state: "", notes: "", status: "lead" as ClientStatus,
  });

  const [interactionForm, setInteractionForm] = useState({
    type: "call" as InteractionType, subject: "", notes: "",
  });

  // Queries
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ["interactions", expandedClient],
    queryFn: async () => {
      if (!expandedClient) return [];
      const { data, error } = await supabase
        .from("client_interactions")
        .select("*")
        .eq("client_id", expandedClient)
        .order("interaction_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!expandedClient,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services", expandedClient],
    queryFn: async () => {
      if (!expandedClient) return [];
      const { data, error } = await supabase
        .from("client_services")
        .select("*")
        .eq("client_id", expandedClient)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!expandedClient,
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (editingClient) {
        const { error } = await supabase.from("clients").update(data).eq("id", editingClient.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("clients").insert({ ...data, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      resetForm();
      toast({ title: editingClient ? "Cliente atualizado!" : "Cliente cadastrado!" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Cliente removido." });
    },
  });

  const addInteraction = useMutation({
    mutationFn: async ({ clientId, data }: { clientId: string; data: typeof interactionForm }) => {
      const { error } = await supabase.from("client_interactions").insert({
        ...data, client_id: clientId, user_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interactions"] });
      setShowInteractionForm(null);
      setInteractionForm({ type: "call", subject: "", notes: "" });
      toast({ title: "Interação registrada!" });
    },
  });

  const resetForm = () => {
    setForm({ name: "", company_name: "", email: "", phone: "", cnpj_cpf: "", address: "", city: "", state: "", notes: "", status: "lead" });
    setEditingClient(null);
    setShowForm(false);
  };

  const startEdit = (client: any) => {
    setForm({
      name: client.name, company_name: client.company_name || "", email: client.email || "",
      phone: client.phone || "", cnpj_cpf: client.cnpj_cpf || "", address: client.address || "",
      city: client.city || "", state: client.state || "", notes: client.notes || "", status: client.status,
    });
    setEditingClient(client);
    setShowForm(true);
  };

  const filtered = clients.filter((c: any) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.cnpj_cpf?.includes(search);
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-1">CRM — Clientes</h2>
            <p className="text-sm text-muted-foreground">
              Cadastro, interações e histórico de serviços.
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Novo Cliente
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome, empresa, e-mail ou CPF/CNPJ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-1">
            {(["all", "lead", "active", "inactive", "churned"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                  filterStatus === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {s === "all" ? "Todos" : statusLabels[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Client Form Modal */}
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-primary/20 bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">{editingClient ? "Editar Cliente" : "Novo Cliente"}</h3>
              <button onClick={resetForm}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="Nome *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm" required />
              <input placeholder="Empresa" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
              <input placeholder="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
              <input placeholder="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
              <input placeholder="CPF/CNPJ" value={form.cnpj_cpf} onChange={(e) => setForm({ ...form, cnpj_cpf: e.target.value })} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ClientStatus })} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm">
                <option value="lead">Lead</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="churned">Churned</option>
              </select>
              <input placeholder="Endereço" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
              <div className="flex gap-2">
                <input placeholder="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
                <input placeholder="UF" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-20 px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
              </div>
            </div>
            <textarea placeholder="Observações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm min-h-[60px]" />
            <button
              onClick={() => saveMutation.mutate(form)}
              disabled={!form.name || saveMutation.isPending}
              className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingClient ? "Salvar alterações" : "Cadastrar cliente"}
            </button>
          </motion.div>
        )}

        {/* Clients List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {clients.length === 0 ? "Nenhum cliente cadastrado ainda." : "Nenhum resultado encontrado."}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((client: any) => {
              const isExpanded = expandedClient === client.id;
              return (
                <motion.div key={client.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-lg border border-border bg-card overflow-hidden"
                >
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedClient(isExpanded ? null : client.id)}
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{client.name}</p>
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-mono", statusColors[client.status as ClientStatus])}>
                          {statusLabels[client.status as ClientStatus]}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {[client.company_name, client.email, client.phone].filter(Boolean).join(" • ")}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); startEdit(client); }} className="p-2 rounded-md hover:bg-muted transition-colors">
                        <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(client.id); }} className="p-2 rounded-md hover:bg-destructive/10 transition-colors">
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border p-4 space-y-4 bg-muted/10">
                      {/* Client details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        {client.cnpj_cpf && <div><span className="text-muted-foreground">CPF/CNPJ:</span> <span className="font-medium">{client.cnpj_cpf}</span></div>}
                        {client.address && <div><span className="text-muted-foreground">Endereço:</span> <span className="font-medium">{client.address}</span></div>}
                        {client.city && <div><span className="text-muted-foreground">Cidade:</span> <span className="font-medium">{client.city}{client.state ? `/${client.state}` : ""}</span></div>}
                        {client.notes && <div className="col-span-2"><span className="text-muted-foreground">Notas:</span> <span className="font-medium">{client.notes}</span></div>}
                      </div>

                      {/* Interactions */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">Interações</p>
                          <button onClick={() => setShowInteractionForm(showInteractionForm === client.id ? null : client.id)}
                            className="text-[10px] text-primary font-medium hover:underline flex items-center gap-1">
                            <Plus className="h-3 w-3" /> Nova interação
                          </button>
                        </div>

                        {showInteractionForm === client.id && (
                          <div className="rounded-md border border-border bg-background p-3 space-y-2 mb-2">
                            <div className="flex gap-2">
                              <select value={interactionForm.type} onChange={(e) => setInteractionForm({ ...interactionForm, type: e.target.value as InteractionType })}
                                className="px-2 py-1.5 rounded border border-border bg-card text-xs">
                                <option value="call">Ligação</option>
                                <option value="email">E-mail</option>
                                <option value="meeting">Reunião</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="other">Outro</option>
                              </select>
                              <input placeholder="Assunto" value={interactionForm.subject} onChange={(e) => setInteractionForm({ ...interactionForm, subject: e.target.value })}
                                className="flex-1 px-2 py-1.5 rounded border border-border bg-card text-xs" />
                            </div>
                            <textarea placeholder="Notas" value={interactionForm.notes} onChange={(e) => setInteractionForm({ ...interactionForm, notes: e.target.value })}
                              className="w-full px-2 py-1.5 rounded border border-border bg-card text-xs min-h-[40px]" />
                            <button onClick={() => addInteraction.mutate({ clientId: client.id, data: interactionForm })}
                              disabled={addInteraction.isPending}
                              className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-medium">
                              Salvar
                            </button>
                          </div>
                        )}

                        {interactions.length > 0 ? (
                          <div className="space-y-1">
                            {interactions.map((i: any) => (
                              <div key={i.id} className="flex items-start gap-2 text-xs p-2 rounded-md bg-background border border-border/50">
                                <MessageSquare className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                                <div className="flex-1">
                                  <span className="font-medium">{interactionLabels[i.type as InteractionType]}</span>
                                  {i.subject && <span className="text-muted-foreground"> — {i.subject}</span>}
                                  {i.notes && <p className="text-muted-foreground mt-0.5">{i.notes}</p>}
                                </div>
                                <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                                  {new Date(i.interaction_date).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Nenhuma interação registrada.</p>
                        )}
                      </div>

                      {/* Services */}
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold mb-2">Serviços</p>
                        {services.length > 0 ? (
                          <div className="space-y-1">
                            {services.map((s: any) => (
                              <div key={s.id} className="flex items-center justify-between text-xs p-2 rounded-md bg-background border border-border/50">
                                <span className="font-medium">{s.service_name}</span>
                                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-mono",
                                  s.status === "active" ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"
                                )}>{s.status === "active" ? "Ativo" : s.status === "completed" ? "Concluído" : "Cancelado"}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Nenhum serviço registrado.</p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CRM;
