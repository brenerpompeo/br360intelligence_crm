import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, Plus, X, Loader2, Trash2, Edit2, Send,
  CheckCircle2, Clock, XCircle, Eye
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ProposalStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

const statusConfig: Record<ProposalStatus, { label: string; color: string; icon: any }> = {
  draft: { label: "Rascunho", color: "bg-muted text-muted-foreground", icon: Edit2 },
  sent: { label: "Enviada", color: "bg-blue-400/15 text-blue-400", icon: Send },
  accepted: { label: "Aceita", color: "bg-accent/15 text-accent", icon: CheckCircle2 },
  rejected: { label: "Rejeitada", color: "bg-destructive/15 text-destructive", icon: XCircle },
  expired: { label: "Expirada", color: "bg-amber-400/15 text-amber-400", icon: Clock },
};

const DEFAULT_CONTRACT = `**CONTRATO DE PRESTAÇÃO DE SERVIÇOS E LICENCIAMENTO DE SOFTWARE (WaaS)**

**CONTRATADA:** BR360 House, [Seu CNPJ], com sede em [Seu Endereço].
**CONTRATANTE:** [NOME_DO_CLIENTE], inscrito no CPF/CNPJ [DOCUMENTO], com sede em [ENDEREÇO_DO_CLIENTE].

**CLÁUSULA 1ª - DO OBJETO**
O presente contrato tem como objeto a criação, hospedagem, licenciamento de uso e manutenção contínua de um site profissional para o CONTRATANTE, operado através da infraestrutura tecnológica da CONTRATADA.

**CLÁUSULA 2ª - DO ESCOPO DE SERVIÇOS (O QUE ESTÁ INCLUSO)**
A CONTRATADA compromete-se a fornecer:
1. Setup Inicial: Desenvolvimento do site com base em estruturas otimizadas para alta conversão.
2. Hospedagem e Infraestrutura: Manutenção do site em servidores de alta performance com otimização automática de imagens (formato WebP).
3. Manutenção Mensal: Atualizações de segurança, correções de bugs e até [X] solicitações mensais de alterações simples de conteúdo.
4. Domínio: Configuração de apontamento de domínio (DNS).

**CLÁUSULA 3ª - DAS EXCLUSÕES (O QUE NÃO ESTÁ INCLUSO)**
Para manter a estabilidade do sistema, fica expressamente excluído do escopo padrão:
1. Desenvolvimento de funcionalidades exclusivas, sistemas complexos, ou integração com APIs não previstas na estrutura base. Solicitações desta natureza serão orçadas separadamente ou sumariamente recusadas.
2. Criação de identidade visual (Logos), sessões de fotos ou redação publicitária (Copywriting Premium), que poderão ser contratados via esteira de serviços adicionais (Upsells).

**CLÁUSULA 4ª - DOS PRAZOS**
O site será entregue em ambiente de produção em até 5 dias úteis, contados exclusivamente a partir do momento em que o CONTRATANTE fornecer 100% dos materiais necessários (formulário de onboarding, logo, fotos e textos base).

**CLÁUSULA 5ª - DOS VALORES E FORMA DE PAGAMENTO**
Pela prestação dos serviços, o CONTRATANTE pagará à CONTRATADA:
1. Taxa de Setup (Pagamento Único): R$ 1.490,00, pagos integralmente antes do início do desenvolvimento.
2. Assinatura (Mensalidade Recorrente): R$ 274,90 mensais, cobrados a cada ciclo de 30 dias a partir da entrega do site.
Parágrafo Único: O inadimplemento da assinatura mensal por prazo superior a 5 dias acarretará a suspensão temporária do site até a regularização.

**CLÁUSULA 6ª - DAS OBRIGAÇÕES DO CONTRATANTE**
1. Fornecer imagens, textos e informações verídicas de sua propriedade intelectual para inserção no site.
2. Não solicitar acesso direto ao código-fonte ou painel de infraestrutura em nuvem, sendo o acesso restrito aos técnicos da CONTRATADA para garantir a segurança da operação.

**CLÁUSULA 7ª - PROPRIEDADE INTELECTUAL E CANCELAMENTO**
1. Os dados de negócio, logotipos, textos e imagens inseridos no site são de propriedade exclusiva do CONTRATANTE.
2. A estrutura algorítmica, código-fonte (repositório) e arquitetura de dados são de propriedade intelectual exclusiva da CONTRATADA, caracterizando este contrato como um licenciamento de uso (SaaS) e não uma venda de software.
3. O cancelamento pode ser solicitado a qualquer momento pelo CONTRATANTE, sem multa de fidelidade, permanecendo o site ativo até o encerramento do ciclo mensal já pago. Após este prazo, o serviço será descontinuado e o site retirado do ar.

Por estarem justos e contratados, o ACEITE DIGITAL na plataforma tem força de assinatura.`;

const Propostas = () => {
  const { user, workspaceId } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [viewingProposal, setViewingProposal] = useState<any>(null);
  const [editingProposal, setEditingProposal] = useState<any>(null);

  const [form, setForm] = useState({
    client_id: "", title: "Proposta Comercial", setup_fee: "1490.00", monthly_fee: "274.90",
    additional_notes: "", valid_until: "", contract_text: DEFAULT_CONTRACT,
  });
  const [items, setItems] = useState<{ description: string; quantity: string; unit_price: string }[]>([]);

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ["proposals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proposals")
        .select("*, clients(name, email, company_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: proposalItems = [] } = useQuery({
    queryKey: ["proposal-items", viewingProposal?.id],
    queryFn: async () => {
      if (!viewingProposal) return [];
      const { data, error } = await supabase.from("proposal_items").select("*").eq("proposal_id", viewingProposal.id);
      if (error) throw error;
      return data;
    },
    enabled: !!viewingProposal,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-select"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("id, name, company_name").order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const saveProposal = useMutation({
    mutationFn: async () => {
      const payload = {
        user_id: user!.id,
        workspace_id: workspaceId,
        client_id: form.client_id,
        title: form.title,
        setup_fee: parseFloat(form.setup_fee),
        monthly_fee: parseFloat(form.monthly_fee),
        additional_notes: form.additional_notes || null,
        valid_until: form.valid_until || null,
        contract_text: form.contract_text || null,
      };

      let proposalId: string;

      if (editingProposal) {
        const { error } = await supabase.from("proposals").update(payload).eq("id", editingProposal.id);
        if (error) throw error;
        proposalId = editingProposal.id;
        // Delete old items
        await supabase.from("proposal_items").delete().eq("proposal_id", proposalId);
      } else {
        const { data, error } = await supabase.from("proposals").insert(payload).select("id").single();
        if (error) throw error;
        proposalId = data.id;
      }

      // Insert items
      if (items.length > 0) {
        const itemsPayload = items.filter(i => i.description).map(i => ({
          proposal_id: proposalId,
          description: i.description,
          quantity: parseInt(i.quantity) || 1,
          unit_price: parseFloat(i.unit_price) || 0,
        }));
        if (itemsPayload.length > 0) {
          const { error } = await supabase.from("proposal_items").insert(itemsPayload);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proposals"] });
      resetForm();
      toast({ title: editingProposal ? "Proposta atualizada!" : "Proposta criada!" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProposalStatus }) => {
      const update: any = { status };
      if (status === "sent") update.sent_at = new Date().toISOString();
      const { error } = await supabase.from("proposals").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proposals"] });
      toast({ title: "Status atualizado!" });
    },
  });

  const deleteProposal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("proposals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["proposals"] }); toast({ title: "Proposta removida." }); },
  });

  const resetForm = () => {
    setForm({ client_id: "", title: "Proposta Comercial", setup_fee: "1490.00", monthly_fee: "274.90", additional_notes: "", valid_until: "", contract_text: DEFAULT_CONTRACT });
    setItems([]);
    setEditingProposal(null);
    setShowForm(false);
  };

  const addItem = () => setItems([...items, { description: "", quantity: "1", unit_price: "0" }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: string, value: string) => setItems(items.map((it, i) => i === idx ? { ...it, [field]: value } : it));

  const totalExtras = items.reduce((s, i) => s + (parseInt(i.quantity) || 1) * (parseFloat(i.unit_price) || 0), 0);
  const totalSetup = parseFloat(form.setup_fee) || 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-1">Propostas Comerciais</h2>
            <p className="text-sm text-muted-foreground">Crie, envie e acompanhe propostas com contrato integrado.</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> Nova Proposta
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-primary/20 bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">{editingProposal ? "Editar Proposta" : "Nova Proposta"}</h3>
              <button onClick={resetForm}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm">
                <option value="">Cliente *</option>
                {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}{c.company_name ? ` (${c.company_name})` : ""}</option>)}
              </select>
              <input placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
              <input type="number" step="0.01" placeholder="Taxa de Setup" value={form.setup_fee} onChange={(e) => setForm({ ...form, setup_fee: e.target.value })} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
              <input type="number" step="0.01" placeholder="Manutenção/mês" value={form.monthly_fee} onChange={(e) => setForm({ ...form, monthly_fee: e.target.value })} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
            </div>
            <input type="date" placeholder="Válido até" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm w-auto" />

            {/* Extra items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-muted-foreground">Itens adicionais / Serviços extras</p>
                <button onClick={addItem} className="text-xs text-primary font-medium hover:underline flex items-center gap-1"><Plus className="h-3 w-3" /> Adicionar item</button>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input placeholder="Descrição" value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                  <input type="number" placeholder="Qtd" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} className="w-20 px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                  <input type="number" step="0.01" placeholder="Valor" value={item.unit_price} onChange={(e) => updateItem(idx, "unit_price", e.target.value)} className="w-28 px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                  <button onClick={() => removeItem(idx)}><X className="h-4 w-4 text-destructive" /></button>
                </div>
              ))}
              {items.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Total extras: <span className="font-bold text-foreground">R$ {totalExtras.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span> |
                  Total proposta: <span className="font-bold text-primary">R$ {(totalSetup + totalExtras).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span> + R$ {form.monthly_fee}/mês
                </p>
              )}
            </div>

            <textarea placeholder="Observações adicionais" value={form.additional_notes} onChange={(e) => setForm({ ...form, additional_notes: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm min-h-[50px]" />

            {/* Contract */}
            <details className="rounded-lg border border-border p-3">
              <summary className="text-xs font-bold text-muted-foreground cursor-pointer">📄 Modelo de Contrato (clique para editar)</summary>
              <textarea value={form.contract_text} onChange={(e) => setForm({ ...form, contract_text: e.target.value })}
                className="w-full mt-2 px-3 py-2.5 rounded-lg border border-border bg-background text-xs font-mono min-h-[200px]" />
            </details>

            <button onClick={() => saveProposal.mutate()} disabled={!form.client_id || saveProposal.isPending}
              className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 flex items-center gap-2">
              {saveProposal.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingProposal ? "Salvar alterações" : "Criar proposta"}
            </button>
          </motion.div>
        )}

        {/* View Proposal */}
        {viewingProposal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">{viewingProposal.title}</h3>
              <button onClick={() => setViewingProposal(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><span className="text-muted-foreground text-xs">Cliente:</span><p className="font-medium">{viewingProposal.clients?.name}</p></div>
              <div><span className="text-muted-foreground text-xs">Setup:</span><p className="font-bold text-primary">R$ {Number(viewingProposal.setup_fee).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p></div>
              <div><span className="text-muted-foreground text-xs">Mensal:</span><p className="font-bold text-accent">R$ {Number(viewingProposal.monthly_fee).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p></div>
              <div><span className="text-muted-foreground text-xs">Válido até:</span><p className="font-medium">{viewingProposal.valid_until ? new Date(viewingProposal.valid_until).toLocaleDateString("pt-BR") : "—"}</p></div>
            </div>
            {proposalItems.length > 0 && (
              <div>
                <p className="text-xs font-bold text-muted-foreground mb-2">Itens adicionais</p>
                {proposalItems.map((pi: any) => (
                  <div key={pi.id} className="flex justify-between text-xs p-2 border-b border-border/50">
                    <span>{pi.description}</span>
                    <span className="font-mono">{pi.quantity}× R$ {Number(pi.unit_price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            {viewingProposal.additional_notes && <p className="text-xs text-muted-foreground">{viewingProposal.additional_notes}</p>}
            {viewingProposal.contract_text && (
              <details className="rounded-lg border border-border p-3">
                <summary className="text-xs font-bold text-muted-foreground cursor-pointer">📄 Contrato</summary>
                <pre className="mt-2 text-xs font-mono whitespace-pre-wrap text-muted-foreground">{viewingProposal.contract_text}</pre>
              </details>
            )}
          </motion.div>
        )}

        {/* Proposals List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhuma proposta criada ainda.</div>
        ) : (
          <div className="space-y-2">
            {proposals.map((p: any) => {
              const sc = statusConfig[p.status as ProposalStatus];
              const StatusIcon = sc.icon;
              return (
                <div key={p.id} className="rounded-lg border border-border bg-card p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold truncate">{p.title}</p>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-mono flex items-center gap-1", sc.color)}>
                        <StatusIcon className="h-3 w-3" /> {sc.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {p.clients?.name} • Setup R$ {Number(p.setup_fee).toLocaleString("pt-BR")} + R$ {Number(p.monthly_fee).toLocaleString("pt-BR")}/mês
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setViewingProposal(p)} className="p-2 rounded-md hover:bg-muted"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    {p.status === "draft" && (
                      <>
                        <button onClick={() => updateStatus.mutate({ id: p.id, status: "sent" })} className="p-2 rounded-md hover:bg-blue-400/10"><Send className="h-3.5 w-3.5 text-blue-400" /></button>
                        <button onClick={() => {
                          setForm({
                            client_id: p.client_id, title: p.title, setup_fee: String(p.setup_fee), monthly_fee: String(p.monthly_fee),
                            additional_notes: p.additional_notes || "", valid_until: p.valid_until || "", contract_text: p.contract_text || DEFAULT_CONTRACT,
                          });
                          setEditingProposal(p);
                          setShowForm(true);
                        }} className="p-2 rounded-md hover:bg-muted"><Edit2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                      </>
                    )}
                    {p.status === "sent" && (
                      <>
                        <button onClick={() => updateStatus.mutate({ id: p.id, status: "accepted" })} className="p-2 rounded-md hover:bg-accent/10"><CheckCircle2 className="h-3.5 w-3.5 text-accent" /></button>
                        <button onClick={() => updateStatus.mutate({ id: p.id, status: "rejected" })} className="p-2 rounded-md hover:bg-destructive/10"><XCircle className="h-3.5 w-3.5 text-destructive" /></button>
                      </>
                    )}
                    <button onClick={() => deleteProposal.mutate(p.id)} className="p-2 rounded-md hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Propostas;
