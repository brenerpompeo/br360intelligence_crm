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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  const { user, workspaceId } = useAuth();
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

  const [showServiceForm, setShowServiceForm] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState({
    service_name: "", description: "", monthly_value: 0, status: "active" as "active" | "completed" | "cancelled"
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
        const { error } = await supabase.from("clients").insert({ ...data, user_id: user!.id, workspace_id: workspaceId });
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

  const addService = useMutation({
    mutationFn: async ({ clientId, data }: { clientId: string; data: typeof serviceForm }) => {
      const { error } = await supabase.from("client_services").insert({
        ...data, client_id: clientId, user_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setShowServiceForm(null);
      setServiceForm({ service_name: "", description: "", monthly_value: 0, status: "active" });
      toast({ title: "Serviço adicionado!" });
    },
  });

  const deleteInteraction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("client_interactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interactions"] });
      toast({ title: "Interação removida." });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("client_services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({ title: "Serviço removido." });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
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

  const activeClientObj = clients.find((c: any) => c.id === expandedClient);

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

        {/* Clients List - High Density */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {clients.length === 0 ? "Nenhum cliente cadastrado ainda." : "Nenhum resultado encontrado."}
          </div>
        ) : (
          <div className="rounded-md border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((client: any) => (
                  <TableRow
                    key={client.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedClient(client.id)}
                  >
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.company_name || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{client.email || client.phone || "-"}</TableCell>
                    <TableCell>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-mono", statusColors[client.status as ClientStatus])}>
                        {statusLabels[client.status as ClientStatus]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={(e) => { e.stopPropagation(); startEdit(client); }} className="p-2 rounded-md hover:bg-muted transition-colors">
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(client.id); }} className="p-2 rounded-md hover:bg-destructive/10 transition-colors">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Client OS Slide-over */}
        <Sheet open={!!expandedClient} onOpenChange={(open) => !open && setExpandedClient(null)}>
          <SheetContent className="w-[90vw] sm:max-w-xl overflow-y-auto sm:border-l sm:border-border">
            {activeClientObj && (
              <>
                <SheetHeader className="pb-6 border-b border-border mb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                        {activeClientObj.name}
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-mono inline-block align-middle", statusColors[activeClientObj.status as ClientStatus])}>
                          {statusLabels[activeClientObj.status as ClientStatus]}
                        </span>
                      </SheetTitle>
                      <SheetDescription className="mt-1">
                        {[activeClientObj.company_name, activeClientObj.cnpj_cpf].filter(Boolean).join(" • ")}
                      </SheetDescription>
                    </div>
                  </div>
                </SheetHeader>

                <Tabs defaultValue="empresa" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="empresa">Empresa</TabsTrigger>
                    <TabsTrigger value="servicos">Serviços</TabsTrigger>
                    <TabsTrigger value="interacoes">Interações</TabsTrigger>
                  </TabsList>

                  {/* TAB 1: EMPRESA */}
                  <TabsContent value="empresa" className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">E-mail</span>
                        <p className="text-sm">{activeClientObj.email || "Não informado"}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Telefone</span>
                        <p className="text-sm">{activeClientObj.phone || "Não informado"}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Localização</span>
                        <p className="text-sm">
                          {[activeClientObj.city, activeClientObj.state].filter(Boolean).join(" / ") || "Não informada"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Endereço</span>
                        <p className="text-sm">{activeClientObj.address || "Não informado"}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Anotações Internas</span>
                      <div className="p-3 bg-muted/30 rounded-md border border-border/50 min-h-[100px] text-sm whitespace-pre-wrap">
                        {activeClientObj.notes || "Nenhuma anotação."}
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 2: SERVIÇOS */}
                  <TabsContent value="servicos" className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-sm font-semibold">Serviços Ativos</h4>
                          <p className="text-xs text-muted-foreground">Assinaturas e escopos vinculados.</p>
                        </div>
                        <button onClick={() => setShowServiceForm(showServiceForm === activeClientObj.id ? null : activeClientObj.id)}
                          className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md font-medium flex items-center gap-1 hover:bg-primary/90">
                          <Plus className="h-3.5 w-3.5" /> Novo
                        </button>
                      </div>

                      {showServiceForm === activeClientObj.id && (
                        <div className="rounded-md border border-border bg-muted/20 p-4 space-y-3 mb-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input placeholder="Nome do Serviço" value={serviceForm.service_name} onChange={(e) => setServiceForm({ ...serviceForm, service_name: e.target.value })}
                              className="px-3 py-2 rounded-md border border-border bg-background text-sm" />
                            <div className="flex gap-2">
                              <input placeholder="R$ Valor Mensal" type="number" step="0.01" value={serviceForm.monthly_value || ""} onChange={(e) => setServiceForm({ ...serviceForm, monthly_value: parseFloat(e.target.value) || 0 })}
                                className="w-1/2 px-3 py-2 rounded-md border border-border bg-background text-sm" />
                              <select value={serviceForm.status} onChange={(e) => setServiceForm({ ...serviceForm, status: e.target.value as any })}
                                className="w-1/2 px-3 py-2 rounded-md border border-border bg-background text-sm">
                                <option value="active">Ativo</option>
                                <option value="completed">Concluído</option>
                                <option value="cancelled">Cancelado</option>
                              </select>
                            </div>
                          </div>
                          <textarea placeholder="Descrição ou Links (Ex: Vercel, Repo)" value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[60px]" />
                          <button onClick={() => addService.mutate({ clientId: activeClientObj.id, data: serviceForm })}
                            disabled={addService.isPending || !serviceForm.service_name}
                            className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
                            Adicionar Serviço
                          </button>
                        </div>
                      )}

                      {services.length > 0 ? (
                        <div className="space-y-2">
                          {services.map((s: any) => (
                            <div key={s.id} className="p-3 rounded-lg border border-border bg-card">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-semibold text-sm">{s.service_name}</h5>
                                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-mono",
                                      s.status === "active" ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"
                                    )}>{s.status === "active" ? "Ativo" : s.status === "completed" ? "Concluído" : "Cancelado"}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">{s.description || "Sem descrição"}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="block font-mono font-medium text-accent text-sm mb-2">
                                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(s.monthly_value || 0)}
                                  </span>
                                  <button onClick={() => deleteService.mutate(s.id)} className="text-xs text-destructive hover:underline p-1">
                                    Remover
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 border border-dashed border-border rounded-lg bg-muted/10">
                          <p className="text-sm text-muted-foreground">Nenhum serviço registrado.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* TAB 3: INTERAÇÕES */}
                  <TabsContent value="interacoes" className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-sm font-semibold">Histórico de Contato</h4>
                          <p className="text-xs text-muted-foreground">Registro de reuniões, e-mails e ligações.</p>
                        </div>
                        <button onClick={() => setShowInteractionForm(showInteractionForm === activeClientObj.id ? null : activeClientObj.id)}
                          className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md font-medium flex items-center gap-1 hover:bg-secondary/80">
                          <Plus className="h-3.5 w-3.5" /> Registrar
                        </button>
                      </div>

                      {showInteractionForm === activeClientObj.id && (
                        <div className="rounded-md border border-border bg-muted/20 p-4 space-y-3 mb-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <select value={interactionForm.type} onChange={(e) => setInteractionForm({ ...interactionForm, type: e.target.value as InteractionType })}
                              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm">
                              <option value="call">Ligação</option>
                              <option value="email">E-mail</option>
                              <option value="meeting">Reunião</option>
                              <option value="whatsapp">WhatsApp</option>
                              <option value="other">Outro</option>
                            </select>
                            <input placeholder="Assunto curto" value={interactionForm.subject} onChange={(e) => setInteractionForm({ ...interactionForm, subject: e.target.value })}
                              className="w-full sm:col-span-2 px-3 py-2 rounded-md border border-border bg-background text-sm" />
                          </div>
                          <textarea placeholder="Resumo da interação..." value={interactionForm.notes} onChange={(e) => setInteractionForm({ ...interactionForm, notes: e.target.value })}
                            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[80px]" />
                          <button onClick={() => addInteraction.mutate({ clientId: activeClientObj.id, data: interactionForm })}
                            disabled={addInteraction.isPending || !interactionForm.subject}
                            className="w-full px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/90">
                            Salvar Log
                          </button>
                        </div>
                      )}

                      {interactions.length > 0 ? (
                        <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                          {interactions.map((i: any) => (
                            <div key={i.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-lg border border-border bg-card shadow-sm">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="font-semibold text-sm">{interactionLabels[i.type as InteractionType]}</span>
                                  <span className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                                    {new Date(i.interaction_date).toLocaleDateString("pt-BR")}
                                  </span>
                                </div>
                                {i.subject && <p className="text-sm font-medium mb-1">{i.subject}</p>}
                                {i.notes && <p className="text-xs text-muted-foreground leading-relaxed">{i.notes}</p>}
                                <div className="mt-2 text-right">
                                  <button onClick={() => deleteInteraction.mutate(i.id)} className="text-[10px] text-destructive hover:underline uppercase tracking-wider font-semibold">
                                    Apagar
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 border border-dashed border-border rounded-lg bg-muted/10">
                          <p className="text-sm text-muted-foreground">Nenhum histórico registrado.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
};

export default CRM;
