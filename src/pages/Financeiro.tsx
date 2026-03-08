import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calculator, Plus, X, Loader2, Trash2, Edit2, Settings,
  ArrowUpRight, ArrowDownRight, TrendingUp, Wallet,
  PieChart, Activity
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell
} from "recharts";

type AccountType = "revenue" | "cost" | "expense" | "investment" | "other";

const typeLabels: Record<AccountType, string> = {
  revenue: "Receita", cost: "Custo", expense: "Despesa", investment: "Investimento", other: "Outro",
};
const typeColors: Record<AccountType, string> = {
  revenue: "text-accent", cost: "text-destructive", expense: "text-amber-400", investment: "text-primary", other: "text-muted-foreground",
};
const typeBgColors: Record<AccountType, string> = {
  revenue: "bg-accent", cost: "bg-destructive", expense: "bg-amber-400", investment: "bg-primary", other: "bg-muted-foreground",
};

const Financeiro = () => {
  const { user, workspaceId } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  // Ledger States
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [accountForm, setAccountForm] = useState({ name: "", type: "revenue" as AccountType, description: "" });
  const [txForm, setTxForm] = useState({ account_id: "", client_id: "", amount: "", description: "", transaction_date: new Date().toISOString().split("T")[0] });

  // Data Fetching
  const { data: accounts = [], isLoading: loadingAccounts } = useQuery({
    queryKey: ["accounts", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase.from("chart_of_accounts").select("*").eq("workspace_id", workspaceId).order("type").order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!workspaceId,
  });

  const { data: transactions = [], isLoading: loadingTx } = useQuery({
    queryKey: ["transactions", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase.from("transactions").select("*, chart_of_accounts(name, type), clients(name)").eq("workspace_id", workspaceId).order("transaction_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!workspaceId,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-select", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("id, name").eq("workspace_id", workspaceId).order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!workspaceId,
  });

  // Mutations
  const saveAccount = useMutation({
    mutationFn: async (data: typeof accountForm) => {
      const { error } = await supabase.from("chart_of_accounts").insert({ ...data, user_id: user!.id, workspace_id: workspaceId });
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

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transactions"] }); toast({ title: "Transação removida." }); },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const saveTransaction = useMutation({
    mutationFn: async (data: typeof txForm) => {
      const { error } = await supabase.from("transactions").insert({
        user_id: user!.id,
        workspace_id: workspaceId,
        account_id: data.account_id,
        client_id: data.client_id || null,
        amount: parseFloat(data.amount),
        description: data.description,
        transaction_date: data.transaction_date,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transactions"] }); setShowTransactionForm(false); setTxForm({ account_id: "", client_id: "", amount: "", description: "", transaction_date: new Date().toISOString().split("T")[0] }); toast({ title: "Transação registrada!" }); },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  // Analytics Calcs
  const currentMonthTransactions = transactions.filter(t => {
    const txDate = new Date(t.transaction_date);
    const now = new Date();
    return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
  });

  const monthlyRevenue = currentMonthTransactions
    .filter(t => t.chart_of_accounts?.type === "revenue")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const monthlyExpenses = currentMonthTransactions
    .filter(t => ["cost", "expense", "investment"].includes(t.chart_of_accounts?.type as string))
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const netProfit = monthlyRevenue - monthlyExpenses;

  // Chart Data: Expense Distribution (Donut)
  const expenseDistribution = currentMonthTransactions
    .filter(t => ["cost", "expense", "investment"].includes(t.chart_of_accounts?.type as string))
    .reduce((acc: any, curr) => {
      const type = curr.chart_of_accounts?.type;
      const typeLabel = typeLabels[type as AccountType];
      const existing = acc.find((itm: any) => itm.name === typeLabel);
      if (existing) {
        existing.value += Number(curr.amount);
      } else {
        const colors: any = { revenue: "#10b981", cost: "#ef4444", expense: "#fbbf24", investment: "#3b82f6", other: "#9ca3af" };
        acc.push({ name: typeLabel, value: Number(curr.amount), color: colors[type as AccountType] || colors.other });
      }
      return acc;
    }, []);

  // Chart Data: Monthly Cash Flow Trend (Area Chart)
  // Group all transactions by month
  const monthlyFlow = transactions.reduce((acc: any, curr) => {
    const date = new Date(curr.transaction_date);
    const monthYear = `${date.toLocaleString('pt-BR', { month: 'short' })} ${date.getFullYear()}`;

    if (!acc[monthYear]) {
      acc[monthYear] = { name: monthYear, Receitas: 0, Despesas: 0, sortKey: date.getTime() };
    }

    if (curr.chart_of_accounts?.type === "revenue") {
      acc[monthYear].Receitas += Number(curr.amount);
    } else if (["cost", "expense", "investment"].includes(curr.chart_of_accounts?.type as string)) {
      acc[monthYear].Despesas += Number(curr.amount);
    }
    return acc;
  }, {});

  const flowData = Object.values(monthlyFlow).sort((a: any, b: any) => a.sortKey - b.sortKey).slice(-6); // Last 6 months

  const formatBRL = (val: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header Options */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Financeiro Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestão de caixa, despesas e health check do negócio.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAccountForm(!showAccountForm)}
              className="bg-card border border-border text-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-muted transition-colors flex items-center gap-2 shadow-sm"
            >
              {showAccountForm ? "Cancelar" : <><Settings className="h-4 w-4" /> Plano de Contas</>}
            </button>
            <button
              onClick={() => setShowTransactionForm(!showTransactionForm)}
              className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm shadow-primary/20"
            >
              <Plus className="h-4 w-4" /> Nova Transação
            </button>
          </div>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              <p className="text-sm font-medium text-muted-foreground">Receita Bruta (Mês)</p>
            </div>
            <p className="text-3xl font-bold tracking-tight text-accent">{formatBRL(monthlyRevenue)}</p>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <ArrowDownRight className="h-4 w-4 text-destructive" />
              <p className="text-sm font-medium text-muted-foreground">Saídas (Mês)</p>
            </div>
            <p className="text-3xl font-bold tracking-tight text-destructive">{formatBRL(monthlyExpenses)}</p>
          </div>
          <div className="rounded-xl border bg-card p-5 border-primary/20 glow-primary relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-5">
              <Wallet className="h-24 w-24" />
            </div>
            <div className="flex items-center gap-3 mb-2">
              <Calculator className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-foreground">Lucro Líquido Real</p>
            </div>
            <p className={cn("text-3xl font-bold tracking-tight relative z-10", netProfit >= 0 ? "text-primary" : "text-destructive")}>
              {formatBRL(netProfit)}
            </p>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Trend Chart */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-sm flex flex-col p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-6">
              <Activity className="h-4 w-4 text-muted-foreground" /> Evolução de Caixa (Últimos 6 meses)
            </h3>
            <div className="h-[300px] w-full">
              {flowData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={flowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.4} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} tickFormatter={(val) => `R$${val / 1000}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', fontSize: '13px' }}
                      itemStyle={{ fontWeight: 500 }}
                      formatter={(value: number) => formatBRL(value)}
                    />
                    <Area type="monotone" dataKey="Despesas" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorDespesas)" />
                    <Area type="monotone" dataKey="Receitas" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorReceitas)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Sem dados suficientes para o gráfico.</div>
              )}
            </div>
          </div>

          {/* Donut Chart */}
          <div className="rounded-xl border border-border bg-card shadow-sm flex flex-col p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-6">
              <PieChart className="h-4 w-4 text-muted-foreground" /> Distribuição de Saídas (Mês)
            </h3>
            <div className="h-[250px] w-full flex-1">
              {expenseDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={expenseDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {expenseDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', fontSize: '13px' }}
                      formatter={(value: number) => formatBRL(value)}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Nenhuma saída registrada este mês.</div>
              )}
            </div>
            {/* Legend */}
            <div className="mt-4 space-y-2">
              {expenseDistribution.map((itm: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: itm.color }} />
                    <span className="text-muted-foreground">{itm.name}</span>
                  </div>
                  <span className="font-medium">{formatBRL(itm.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Forms (Slide down) */}
        {showAccountForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="rounded-xl border border-border bg-card p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">Configurar Plano de Contas</h3>
              <button onClick={() => setShowAccountForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); saveAccount.mutate(accountForm); }} className="grid md:grid-cols-4 gap-4 items-end">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Nome da Conta</label>
                <input required value={accountForm.name} onChange={e => setAccountForm({ ...accountForm, name: e.target.value })} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="Ex: Vercel, Hostinger, Pix Cliente" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Natureza</label>
                <select value={accountForm.type} onChange={e => setAccountForm({ ...accountForm, type: e.target.value as AccountType })} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                  {Object.entries(typeLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                </select>
              </div>
              <div className="space-y-1 md:col-span-2 flex gap-4">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Descrição Opcional</label>
                  <input value={accountForm.description} onChange={e => setAccountForm({ ...accountForm, description: e.target.value })} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="Detalhes de uso" />
                </div>
                <button disabled={saveAccount.isPending} type="submit" className="bg-primary text-primary-foreground text-sm font-medium px-6 rounded-lg hover:bg-primary/90 flex items-center justify-center shrink-0 min-w-[120px]">
                  {saveAccount.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Conta"}
                </button>
              </div>
            </form>

            <div className="mt-8">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">Contas Ativas</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {accounts.map((acc: any) => (
                  <div key={acc.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/50 transition-colors group">
                    <div>
                      <p className="text-sm font-medium">{acc.name}</p>
                      <span className={cn("text-[10px] uppercase font-mono tracking-wider", typeColors[acc.type as AccountType])}>{typeLabels[acc.type as AccountType]}</span>
                    </div>
                    <button onClick={() => deleteAccount.mutate(acc.id)} className="p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {showTransactionForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="rounded-xl border border-border bg-card p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">Registrar Transação</h3>
              <button onClick={() => setShowTransactionForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>

            {accounts.length === 0 ? (
              <div className="p-4 border rounded-lg bg-warning/10 border-warning/20 flex flex-col items-center justify-center text-center">
                <Calculator className="h-6 w-6 text-warning mb-2" />
                <p className="text-sm font-medium text-warning">Cadastre Planos de Conta primeiro</p>
                <p className="text-xs text-muted-foreground mt-1">Você precisa configurar a origem/destino do dinheiro nas configurações de contas anted de fazer lançamentos.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); saveTransaction.mutate(txForm); }} className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Conta (Classificação)</label>
                  <select required value={txForm.account_id} onChange={e => setTxForm({ ...txForm, account_id: e.target.value })} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                    <option value="">Selecione...</option>
                    {accounts.map((acc: any) => <option key={acc.id} value={acc.id}>{acc.name} ({typeLabels[acc.type as AccountType]})</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Valor (R$)</label>
                  <input required type="number" step="0.01" value={txForm.amount} onChange={e => setTxForm({ ...txForm, amount: e.target.value })} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="0.00" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Cliente (Opcional)</label>
                  <select value={txForm.client_id} onChange={e => setTxForm({ ...txForm, client_id: e.target.value })} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                    <option value="">Nenhum</option>
                    {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Data</label>
                  <input required type="date" value={txForm.transaction_date} onChange={e => setTxForm({ ...txForm, transaction_date: e.target.value })} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary [color-scheme:dark]" />
                </div>
                <div className="space-y-1 lg:col-span-1 flex flex-col gap-2">
                  <input value={txForm.description} onChange={e => setTxForm({ ...txForm, description: e.target.value })} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="Observação..." />
                  <button disabled={saveTransaction.isPending} type="submit" className="w-full bg-primary text-primary-foreground text-sm font-medium h-9 rounded-lg hover:bg-primary/90 flex items-center justify-center shrink-0">
                    {saveTransaction.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lançar"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}

        {/* Ledger Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20">
            <h3 className="font-semibold">Livro Razão (Ledger)</h3>
          </div>

          <div className="overflow-x-auto">
            {loadingTx ? (
              <div className="p-8 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando transações...
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                O caixa está limpo. Comece a lançar receitas e despesas.
              </div>
            ) : (
              <table className="w-full text-sm text-left relative">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-5 py-3 font-medium">Data</th>
                    <th className="px-5 py-3 font-medium">Classificação</th>
                    <th className="px-5 py-3 font-medium">Conta</th>
                    <th className="px-5 py-3 font-medium">Cliente / Nota</th>
                    <th className="px-5 py-3 font-medium text-right">Valor</th>
                    <th className="px-5 py-3 font-medium w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {transactions.map((t: any) => (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 font-mono text-muted-foreground whitespace-nowrap">
                        {new Date(t.transaction_date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                      </td>
                      <td className="px-5 py-3">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase",
                          typeColors[t.chart_of_accounts?.type as AccountType],
                          "bg-foreground/5 border border-border"
                        )}>
                          {typeLabels[t.chart_of_accounts?.type as AccountType] || "??"}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-medium">
                        {t.chart_of_accounts?.name || "--"}
                      </td>
                      <td className="px-5 py-3">
                        {t.clients?.name && (
                          <span className="block text-xs font-semibold">{t.clients.name}</span>
                        )}
                        {t.description && (
                          <span className="block text-xs text-muted-foreground max-w-[200px] truncate" title={t.description}>{t.description}</span>
                        )}
                        {!t.clients?.name && !t.description && <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className={cn(
                        "px-5 py-3 text-right font-mono font-medium whitespace-nowrap",
                        t.chart_of_accounts?.type === "revenue" ? "text-accent" : "text-foreground"
                      )}>
                        {t.chart_of_accounts?.type !== "revenue" && "- "}
                        {formatBRL(t.amount)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => deleteTransaction.mutate(t.id)} className="p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-all">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </AppLayout>
  );
};

export default Financeiro;
