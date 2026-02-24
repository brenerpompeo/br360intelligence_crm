import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calculator, Plus, X, Loader2, Trash2, Edit2,
  ArrowUpRight, ArrowDownRight, TrendingUp, Wallet
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type AccountType = "revenue" | "cost" | "expense" | "investment" | "other";

const typeLabels: Record<AccountType, string> = {
  revenue: "Receita", cost: "Custo", expense: "Despesa", investment: "Investimento", other: "Outro",
};
const typeColors: Record<AccountType, string> = {
  revenue: "text-accent", cost: "text-destructive", expense: "text-amber-400", investment: "text-primary", other: "text-muted-foreground",
};

const PlanoContas = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [accountForm, setAccountForm] = useState({ name: "", type: "revenue" as AccountType, description: "" });
  const [txForm, setTxForm] = useState({ account_id: "", client_id: "", amount: "", description: "", transaction_date: new Date().toISOString().split("T")[0] });

  const { data: accounts = [], isLoading: loadingAccounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("chart_of_accounts").select("*").order("type").order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("transactions").select("*, chart_of_accounts(name, type), clients(name)").order("transaction_date", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-select"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const saveAccount = useMutation({
    mutationFn: async (data: typeof accountForm) => {
      const { error } = await supabase.from("chart_of_accounts").insert({ ...data, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["accounts"] }); setShowAccountForm(false); setAccountForm({ name: "", type: "revenue", description: "" }); toast({ title: "Conta criada!" }); },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("chart_of_accounts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["accounts"] }); toast({ title: "Conta removida." }); },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const saveTransaction = useMutation({
    mutationFn: async (data: typeof txForm) => {
      const { error } = await supabase.from("transactions").insert({
        user_id: user!.id,
        account_id: data.account_id,
        client_id: data.client_id || null,
        amount: parseFloat(data.amount),
        description: data.description,
        transaction_date: data.transaction_date,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      setShowTransactionForm(false);
      setTxForm({ account_id: "", client_id: "", amount: "", description: "", transaction_date: new Date().toISOString().split("T")[0] });
      toast({ title: "Transação registrada!" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  // Summary
  const totalRevenue = transactions.filter((t: any) => t.chart_of_accounts?.type === "revenue").reduce((s: number, t: any) => s + Number(t.amount), 0);
  const totalCosts = transactions.filter((t: any) => ["cost", "expense"].includes(t.chart_of_accounts?.type)).reduce((s: number, t: any) => s + Number(t.amount), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-1">Plano de Contas</h2>
            <p className="text-sm text-muted-foreground">Categorias financeiras e registro de transações.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAccountForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors">
              <Plus className="h-4 w-4" /> Nova Conta
            </button>
            <button onClick={() => setShowTransactionForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4" /> Nova Transação
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <div className="flex items-center gap-1.5 mb-1"><ArrowUpRight className="h-3.5 w-3.5 text-accent" /><span className="text-[10px] font-mono uppercase text-muted-foreground">Receitas</span></div>
            <p className="text-xl font-bold text-accent">R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <div className="flex items-center gap-1.5 mb-1"><ArrowDownRight className="h-3.5 w-3.5 text-destructive" /><span className="text-[10px] font-mono uppercase text-muted-foreground">Custos/Desp.</span></div>
            <p className="text-xl font-bold text-destructive">R$ {totalCosts.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <div className="flex items-center gap-1.5 mb-1"><Wallet className="h-3.5 w-3.5 text-primary" /><span className="text-[10px] font-mono uppercase text-muted-foreground">Resultado</span></div>
            <p className={cn("text-xl font-bold", totalRevenue - totalCosts >= 0 ? "text-accent" : "text-destructive")}>
              R$ {(totalRevenue - totalCosts).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Forms */}
        {showAccountForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-primary/20 bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Nova Conta</h3>
              <button onClick={() => setShowAccountForm(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input placeholder="Nome da conta *" value={accountForm.name} onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
              <select value={accountForm.type} onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value as AccountType })} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm">
                {(Object.keys(typeLabels) as AccountType[]).map((t) => <option key={t} value={t}>{typeLabels[t]}</option>)}
              </select>
              <input placeholder="Descrição" value={accountForm.description} onChange={(e) => setAccountForm({ ...accountForm, description: e.target.value })} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
            </div>
            <button onClick={() => saveAccount.mutate(accountForm)} disabled={!accountForm.name || saveAccount.isPending}
              className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
              Criar conta
            </button>
          </motion.div>
        )}

        {showTransactionForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-primary/20 bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Nova Transação</h3>
              <button onClick={() => setShowTransactionForm(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              <select value={txForm.account_id} onChange={(e) => setTxForm({ ...txForm, account_id: e.target.value })} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm">
                <option value="">Conta *</option>
                {accounts.map((a: any) => <option key={a.id} value={a.id}>{typeLabels[a.type as AccountType]} — {a.name}</option>)}
              </select>
              <select value={txForm.client_id} onChange={(e) => setTxForm({ ...txForm, client_id: e.target.value })} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm">
                <option value="">Cliente (opcional)</option>
                {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="number" step="0.01" placeholder="Valor *" value={txForm.amount} onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
              <input placeholder="Descrição" value={txForm.description} onChange={(e) => setTxForm({ ...txForm, description: e.target.value })} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
              <input type="date" value={txForm.transaction_date} onChange={(e) => setTxForm({ ...txForm, transaction_date: e.target.value })} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
            </div>
            <button onClick={() => saveTransaction.mutate(txForm)} disabled={!txForm.account_id || !txForm.amount || saveTransaction.isPending}
              className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
              Registrar transação
            </button>
          </motion.div>
        )}

        {/* Accounts Table */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-bold flex items-center gap-2"><Calculator className="h-4 w-4 text-primary" /> Contas Cadastradas</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Nome</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Tipo</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Descrição</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a: any) => (
                  <tr key={a.id} className="border-b border-border/50">
                    <td className="px-4 py-3 font-medium">{a.name}</td>
                    <td className={cn("px-4 py-3 font-mono text-xs", typeColors[a.type as AccountType])}>{typeLabels[a.type as AccountType]}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{a.description || "—"}</td>
                    <td className="px-4 py-3">
                      {!a.is_default && (
                        <button onClick={() => deleteAccount.mutate(a.id)} className="p-1 rounded hover:bg-destructive/10">
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transactions */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-bold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-accent" /> Últimas Transações</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Data</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Conta</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Cliente</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Descrição</th>
                  <th className="px-4 py-3 text-right text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Valor</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground text-xs">Nenhuma transação registrada.</td></tr>
                ) : transactions.map((t: any) => (
                  <tr key={t.id} className="border-b border-border/50">
                    <td className="px-4 py-3 font-mono text-xs">{new Date(t.transaction_date).toLocaleDateString("pt-BR")}</td>
                    <td className={cn("px-4 py-3 text-xs font-medium", typeColors[t.chart_of_accounts?.type as AccountType])}>{t.chart_of_accounts?.name}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{t.clients?.name || "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{t.description || "—"}</td>
                    <td className={cn("px-4 py-3 text-right font-bold text-sm",
                      t.chart_of_accounts?.type === "revenue" ? "text-accent" : "text-destructive"
                    )}>R$ {Number(t.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PlanoContas;
