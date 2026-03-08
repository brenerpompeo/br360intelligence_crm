import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ListChecks, Users, TrendingUp,
  DollarSign, Map, Zap, FileText, Calculator, LogOut,
  Menu, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Command Center" },
  { to: "/crm", icon: Users, label: "Client OS" },
  { to: "/propostas", icon: FileText, label: "Propostas" },
  { to: "/financeiro", icon: Calculator, label: "Financeiro Analytics" },
  { to: "/setup", icon: ListChecks, label: "Setup" },
  { to: "/pipeline", icon: TrendingUp, label: "Pipeline" },
  { to: "/upsells", icon: DollarSign, label: "Upsells" },
  { to: "/roadmap", icon: Map, label: "Roadmap" },
];

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const { signOut, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getInitials = (email?: string) => {
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Logo */}
      <div className="p-5 pb-4">
        <Link to="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <img src="/logo.png" alt="BR360 House" className="h-9 w-9 rounded-lg shrink-0" />
          <div>
            <h1 className="text-base font-extrabold tracking-tight leading-none">
              BR360 <span className="text-gradient">House</span>
            </h1>
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
              Agency OS
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-none">
        <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Modules</p>
        {navItems.map((item) => {
          const isActive =
            item.to === "/"
              ? pathname === "/"
              : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
          <Avatar className="h-9 w-9 border border-border/50">
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
              {getInitials(user?.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate group-hover:text-foreground transition-colors">
              {user?.email?.split('@')[0] || "Usuário"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Admin Workspace
            </p>
          </div>
          <button onClick={signOut} className="p-2 shrink-0 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background bg-grid flex">
      {/* Desktop Sidebar (Hidden on mobile) */}
      <aside className="hidden md:block w-64 fixed inset-y-0 left-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Header with Hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-card/80 backdrop-blur-sm z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="BR360 House" className="h-7 w-7 rounded-md shrink-0" />
          <h1 className="text-sm font-extrabold tracking-tight">BR360 <span className="text-gradient">House</span></h1>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button className="p-2 -mr-2 rounded-lg hover:bg-muted text-foreground">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
