import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Mail, Lock, User, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Show success modal
        setShowLoginSuccess(true);

        // Auto redirect after 2.5s
        setTimeout(() => {
          navigate("/");
        }, 2500);

      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;

        // Show success modal
        setShowSignupSuccess(true);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualRedirect = () => {
    navigate("/");
  };

  const handleSignupModalClose = () => {
    setShowSignupSuccess(false);
    setIsLogin(true); // Switch to login view so they can log in
  };

  return (
    <div className="min-h-screen bg-background bg-grid flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            BR360 <span className="text-gradient">House</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLogin ? "Acesse sua conta para continuar" : "Crie sua conta na plataforma"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                required
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              placeholder="E-mail profissional"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLogin ? "Entrar na Plataforma" : "Criar minha conta"}
          </button>

          {isLogin && (
            <button
              type="button"
              onClick={() => {
                localStorage.setItem("demoMode", "true");
                window.location.href = "/";
              }}
              disabled={loading}
              className="w-full py-3 rounded-lg border-2 border-primary/20 bg-primary/5 text-primary font-semibold text-sm hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 mt-2"
            >
              Acesso Demo Direto (Ignorar Senha)
            </button>
          )}
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "Ainda não tem conta?" : "Já possui uma conta?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-medium hover:underline focus:outline-none"
            type="button"
          >
            {isLogin ? "Criar conta agora" : "Fazer login"}
          </button>
        </p>
      </div>

      {/* Login Success Modal */}
      <AlertDialog open={showLoginSuccess} onOpenChange={setShowLoginSuccess}>
        <AlertDialogContent className="max-w-md bg-card border-border">
          <AlertDialogHeader className="flex flex-col items-center justify-center text-center space-y-4 sm:space-y-4 pb-4">
            <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-500 animate-in zoom-in duration-500 delay-100" />
            </div>
            <AlertDialogTitle className="text-2xl">Login realizado!</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              Bem-vindo de volta ao BR360 House.
              <br />
              Aguarde enquanto preparamos seu painel...
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction onClick={handleManualRedirect} className="w-full sm:w-auto flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Entrar Agora
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Signup Success Modal */}
      <AlertDialog open={showSignupSuccess} onOpenChange={setShowSignupSuccess}>
        <AlertDialogContent className="max-w-md bg-card border-border">
          <AlertDialogHeader className="flex flex-col items-center justify-center text-center space-y-4 sm:space-y-4 pb-4">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary animate-in zoom-in duration-500 delay-100" />
            </div>
            <AlertDialogTitle className="text-2xl">Conta Criada com Sucesso!</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              Sua conta foi gerada e já está pronta para uso na plataforma.
              Você já pode fazer o seu primeiro acesso usando o e-mail e a senha que acabou de cadastrar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction onClick={handleSignupModalClose} className="w-full">
              Fazer Login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Auth;

