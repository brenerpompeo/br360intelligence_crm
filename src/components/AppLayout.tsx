import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ListChecks, Users, TrendingUp,
  DollarSign, Map, Zap, FileText, Calculator, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/crm", icon: Users, label: "CRM" },
  { to: "/propostas", icon: FileText, label: "Propostas" },
  { to: "/plano-contas", icon: Calculator, label: "Financeiro" },
  { to: "/setup", icon: ListChecks, label: "Setup" },
  { to: "/pipeline", icon: TrendingUp, label: "Pipeline" },
  { to: "/upsells", icon: DollarSign, label: "Upsells" },
  { to: "/financeiro", icon: DollarSign, label: "Ref. Financeira" },
  { to: "/roadmap", icon: Map, label: "Roadmap" },
];

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Top Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                BR360 <span className="text-gradient">House</span>
              </h1>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                ops command center
              </p>
            </div>
          </Link>
          <button onClick={signOut} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>

        {/* Nav tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-1 overflow-x-auto pb-0 -mb-px scrollbar-none">
            {navItems.map((item) => {
              const isActive =
                item.to === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      <footer className="border-t py-6 text-center">
        <p className="text-xs text-muted-foreground font-mono">
          BR360 House — One-Person Venture Studio — Ferramenta de Gestão Interna
        </p>
      </footer>
    </div>
  );
};
