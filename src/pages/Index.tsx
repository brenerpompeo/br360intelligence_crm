import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { MetricCard } from "@/components/MetricCard";
import {
  Users, DollarSign, Activity, Settings,
  ArrowUpRight, Clock, MessageSquare, Briefcase, Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ClientStatus = "lead" | "active" | "inactive" | "churned";

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

const Index = () => {
  const { workspaceId } = useAuth();
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["dashboard-metrics", workspaceId],
    queryFn: async () => {
      // Clientes
      const { data: clients } = await supabase
        .from("clients")
        .select("id, status, pipeline_stage, name")
        .eq("workspace_id", workspaceId);

      const activeClientsCount = clients?.filter(c => c.status === "active").length || 0;
      const setupsPending = clients?.filter(c => c.pipeline_stage === "setup") || [];

      // MRR (Serviços Ativos)
      const { data: services } = await supabase
        .from("client_services")
        .select("monthly_value")
        .eq("status", "active")
        .eq("workspace_id", workspaceId);

      const mrr = services?.reduce((acc, curr) => acc + (Number(curr.monthly_value) || 0), 0) || 0;

      // Setup Revenue Estimate (Transactions with amount > 1000 could be setups, but let's just calc total revenue for this month)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: txs } = await supabase
        .from("transactions")
        .select("amount")
        .eq("workspace_id", workspaceId)
        .gte("transaction_date", startOfMonth.toISOString());

      const monthlyRevenue = txs?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;

      return {
        activeClientsCount,
        setupsPending,
        mrr,
        monthlyRevenue
      };
    },
    enabled: !!workspaceId,
  });

  const { data: recentActivity = [] } = useQuery({
    queryKey: ["recent-activity", workspaceId],
    queryFn: async () => {
      const { data } = await supabase
        .from("client_interactions")
        .select("*, clients(name)")
        .eq("workspace_id", workspaceId)
        .order("interaction_date", { ascending: false })
        .limit(6);
      return data || [];
    },
    enabled: !!workspaceId,
  });

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header Options */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
            <p className="text-sm text-muted-foreground mt-1 capitalize">{today}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/crm" className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm shadow-primary/20">
              <Users className="h-4 w-4" /> Client OS
            </Link>
            <Link to="/pipeline" className="bg-card border border-border text-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-muted transition-colors flex items-center gap-2 shadow-sm">
              <Briefcase className="h-4 w-4" /> Pipeline
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={DollarSign}
            label="MRR (Ativos)"
            value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(metrics?.mrr || 0)}
            subtitle="Receita Recorrente"
            accentColor="accent"
          />
          <MetricCard
            icon={Activity}
            label="Caixa do Mês"
            value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(metrics?.monthlyRevenue || 0)}
            subtitle="Entradas liquidadas"
            accentColor="primary"
          />
          <MetricCard
            icon={Users}
            label="Clientes Ativos"
            value={metrics?.activeClientsCount || 0}
            subtitle="Assinaturas vigentes"
            accentColor="primary"
          />
          <MetricCard
            icon={Settings}
            label="Setups em Vôo"
            value={metrics?.setupsPending?.length || 0}
            subtitle="Projetos em onboarding"
            accentColor="warning"
          />
        </div>

        {/* Split Section: Action Required & Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Action Required: Pending Setups */}
          <div className="rounded-xl border border-border bg-card shadow-sm flex flex-col">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-warning" /> Ação Necessária
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Setups pausados ou em andamento.</p>
              </div>
              <Link to="/setup" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                Ver todos <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-5 flex-1">
              {!metrics?.setupsPending || metrics.setupsPending.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-6">
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                    <Settings className="h-5 w-5 text-accent" />
                  </div>
                  <p className="text-sm font-medium">Balanço zerado</p>
                  <p className="text-xs text-muted-foreground mt-1">Nenhum setup atrasado ou pendente.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {metrics.setupsPending.map((client: any) => (
                    <div key={client.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-warning/15 flex items-center justify-center shrink-0">
                          <Settings className="h-4 w-4 text-warning" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{client.name}</p>
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-mono mt-0.5 inline-block", statusColors[client.status as ClientStatus])}>
                            {statusLabels[client.status as ClientStatus]}
                          </span>
                        </div>
                      </div>
                      <Link to="/setup" className="p-2 rounded-md bg-background border border-border shadow-sm hover:bg-muted transition-colors text-muted-foreground">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="rounded-xl border border-border bg-card shadow-sm flex flex-col">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> Atividades Recentes
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Últimas interações de CRM.</p>
              </div>
              <Link to="/crm" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                Client OS <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-5 flex-1">
              {recentActivity.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-6">
                  <p className="text-sm text-muted-foreground">O radar está limpo.</p>
                </div>
              ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[15px] before:h-full before:w-px before:bg-border">
                  {recentActivity.map((log: any) => (
                    <div key={log.id} className="relative flex items-start gap-4 z-10">
                      <div className="h-8 w-8 rounded-full bg-card border border-border shadow-sm flex items-center justify-center shrink-0">
                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 bg-muted/20 border border-border/50 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold">{log.clients?.name || "Cliente"}</p>
                          <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                            {new Date(log.interaction_date).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        {log.subject && <p className="text-xs font-medium mb-1">{log.subject}</p>}
                        <p className="text-xs text-muted-foreground line-clamp-2">{log.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
