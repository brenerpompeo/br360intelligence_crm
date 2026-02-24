import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Mail, Lock, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
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
        toast({
          title: "Conta criada!",
          description: "Verifique seu e-mail para confirmar o cadastro.",
        });
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

  return (
    <div className="min-h-screen bg-background bg-grid flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            BR360 <span className="text-gradient">Intelligence</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLogin ? "Acesse sua conta" : "Crie sua conta"}
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
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
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
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
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
            {isLogin ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-medium hover:underline"
          >
            {isLogin ? "Criar conta" : "Fazer login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
