import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  TrendingUp, DollarSign, Users, Palette, Camera,
  PenTool, ArrowUpRight, AlertCircle, Package, Plus, Trash2, Edit2
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Minimal mapping to icon dynamically if wanted, or fallback
const iconMap: Record<string, React.ElementType> = {
  Palette, Camera, PenTool, Package
};
// Removed static array and interface

const summaryMetrics = [
  { label: "Receita média/upsell", value: "R$ 533", icon: DollarSign },
  { label: "Custo médio", value: "R$ 150", icon: Package },
  { label: "Lucro médio", value: "R$ 383", icon: TrendingUp },
  { label: "Margem média", value: "77%", icon: ArrowUpRight },
];

const Upsells = () => {
  const { user, workspaceId } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [form, setForm] = useState({
    service: "", sell_price: "", cost: "", supplier: "",
    delivery_time: "", when_to_offer: "", script: "", tips: ""
  });

  const { data: upsells = [] } = useQuery({
    queryKey: ["upsells"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("upsell_catalog")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const saveUpsell = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const profit = Number(data.sell_price) - Number(data.cost);

      const { error } = await supabase.from("upsell_catalog").insert({
        user_id: user!.id,
        workspace_id: workspaceId,
        service: data.service,
        sell_price: Number(data.sell_price),
        cost: Number(data.cost),
        supplier: data.supplier,
        delivery_time: data.delivery_time,
        when_to_offer: data.when_to_offer,
        script: data.script,
        // split by lines to generate JSON array
        tips: data.tips ? data.tips.split("\n").filter((t: string) => t.trim() !== "") : []
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["upsells"] });
      toast({ title: "Upsell adicionado com sucesso!" });
      setIsAdding(false);
      setForm({
        service: "", sell_price: "", cost: "", supplier: "",
        delivery_time: "", when_to_offer: "", script: "", tips: ""
      });
    },
    onError: (e: Error) => toast({ title: "Erro ao salvar Upsell", description: e.message, variant: "destructive" })
  });

  const deleteUpsell = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("upsell_catalog").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["upsells"] });
      toast({ title: "Upsell removido com sucesso!" });
    },
    onError: (e: Error) => toast({ title: "Erro ao remover Upsell", description: e.message, variant: "destructive" })
  });

  // Derived metrics dynamically
  const metrics = (() => {
    if (upsells.length === 0) return summaryMetrics;
    const avgSell = upsells.reduce((acc, u) => acc + Number(u.sell_price), 0) / upsells.length;
    const avgCost = upsells.reduce((acc, u) => acc + Number(u.cost), 0) / upsells.length;
    const profit = avgSell - avgCost;
    const margin = avgSell > 0 ? (profit / avgSell) * 100 : 0;

    return [
      { label: "Receita média/upsell", value: `R$ ${avgSell.toFixed(0)}`, icon: DollarSign },
      { label: "Custo médio", value: `R$ ${avgCost.toFixed(0)}`, icon: Package },
      { label: "Lucro médio", value: `R$ ${profit.toFixed(0)}`, icon: TrendingUp },
      { label: "Margem média", value: `${margin.toFixed(0)}%`, icon: ArrowUpRight },
    ];
  })();

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-1">Esteira de Upsells</h2>
            <p className="text-sm text-muted-foreground">
              Catálogo dinâmico de serviços adicionais. Arbitragem pura — gerencie seus pacotes.
            </p>
          </div>
          <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
            {isAdding ? "Cancelar" : <><Plus className="h-4 w-4" /> Novo Upsell</>}
          </Button>
        </div>

        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-lg border bg-card p-5"
          >
            <h3 className="text-lg font-semibold mb-4 text-primary">Cadastrar Novo Upsell</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Nome do Serviço *</label>
                <Input value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} placeholder="Ex: Redesign de Logo" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Fornecedor / Executor</label>
                <Input value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} placeholder="Ex: Freelancer Workana" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Preço de Venda (R$) *</label>
                <Input type="number" value={form.sell_price} onChange={e => setForm({ ...form, sell_price: e.target.value })} placeholder="Ex: 500" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Custo (R$) *</label>
                <Input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} placeholder="Ex: 150" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Tempo de Entrega</label>
                <Input value={form.delivery_time} onChange={e => setForm({ ...form, delivery_time: e.target.value })} placeholder="Ex: 3-5 dias úteis" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Quando Oferecer</label>
                <Input value={form.when_to_offer} onChange={e => setForm({ ...form, when_to_offer: e.target.value })} placeholder="Ex: Quando o cliente não tem logo" />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-xs font-medium">Script de Vendas</label>
                <Textarea value={form.script} onChange={e => setForm({ ...form, script: e.target.value })} placeholder="Ex: Percebi que sua logo atual..." />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-xs font-medium">Dicas Operacionais (uma por linha)</label>
                <Textarea value={form.tips} onChange={e => setForm({ ...form, tips: e.target.value })} placeholder="- Exija arquivos PDF&#10;- Faça o pagamento" />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => saveUpsell.mutate(form)} disabled={!form.service || !form.sell_price || !form.cost || saveUpsell.isPending}>
                {saveUpsell.isPending ? "Salvando..." : "Salvar Upsell"}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Summary metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg border border-accent/20 bg-card/50 p-4"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <m.icon className="h-3.5 w-3.5 text-accent" />
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{m.label}</p>
              </div>
              <p className="text-2xl font-bold text-accent">{m.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Upsell cards */}
        <div className="space-y-4">
          {upsells.length === 0 && !isAdding && (
            <div className="text-center p-12 border border-dashed rounded-lg bg-card/50">
              <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="text-muted-foreground">Nenhum Upsell cadastrado no seu catálogo.</p>
              <Button onClick={() => setIsAdding(true)} variant="outline" className="mt-4">Cadastrar Primeiro Upsell</Button>
            </div>
          )}

          {upsells.map((u, i) => {
            const margin = u.sell_price > 0 ? (u.profit / u.sell_price) * 100 : 0;
            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-lg border border-border bg-card p-5 relative group"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button onClick={() => deleteUpsell.mutate(u.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Header with financials */}
                <div className="flex flex-col xl:flex-row xl:items-center gap-4 mb-4 pr-10">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Package className="h-5 w-5 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold truncate">{u.service}</h3>
                      <p className="text-xs text-muted-foreground truncate">{u.supplier || 'Fornecedor Interno'} • {u.delivery_time || 'Prazo Indefinido'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 shrink-0">
                    <div className="text-left md:text-center">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase">Venda</p>
                      <p className="text-lg font-bold text-foreground">{formatCurrency(u.sell_price)}</p>
                    </div>
                    <div className="text-left md:text-center">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase">Custo</p>
                      <p className="text-lg font-bold text-destructive">{formatCurrency(u.cost)}</p>
                    </div>
                    <div className="text-left md:text-center">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase">Lucro</p>
                      <p className="text-lg font-bold text-accent">{formatCurrency(u.profit)}</p>
                    </div>
                    <div className="text-left md:text-center">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase">Margem</p>
                      <p className="text-lg font-bold text-primary">{margin.toFixed(0)}%</p>
                    </div>
                  </div>
                </div>

                {/* When to offer */}
                {u.when_to_offer && (
                  <div className="rounded-md bg-primary/5 border border-primary/10 p-3 mb-3">
                    <p className="text-xs text-muted-foreground">
                      <span className="text-primary font-semibold">Quando oferecer:</span> {u.when_to_offer}
                    </p>
                  </div>
                )}

                {/* Script */}
                {u.script && (
                  <div className="rounded-md bg-muted/50 border border-border p-3 mb-3">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1 font-bold">📋 Script de venda</p>
                    <p className="text-sm italic text-foreground/80">{u.script}</p>
                  </div>
                )}

                {/* Tips */}
                {u.tips && (u.tips as string[]).length > 0 && (
                  <div className="rounded-md bg-accent/5 border border-accent/10 p-3">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-accent mb-2 font-bold">💡 Dicas operacionais</p>
                    <ul className="space-y-1">
                      {(u.tips as string[]).map((tip: string, ti: number) => (
                        <li key={ti} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="text-accent mt-0.5">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Upsells;
