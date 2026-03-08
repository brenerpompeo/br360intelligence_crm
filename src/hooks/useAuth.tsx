import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  workspaceId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  workspaceId: null,
  loading: true,
  signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo Mode Bypass
    const isDemo = localStorage.getItem("demoMode") === "true";
    if (isDemo) {
      const mockUser = { id: "11111111-1111-1111-1111-111111111111", email: "demo@br360.com.br", role: "authenticated" } as User;
      setUser(mockUser);
      setSession({ user: mockUser, access_token: "demo-token-123", token_type: "bearer" } as Session);
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      if (!isDemo) subscription?.unsubscribe();
    };
  }, []);

  // Fetch Workspace ID immediately after we get a valid user
  useEffect(() => {
    async function fetchWorkspace() {
      if (!user) {
        setWorkspaceId(null);
        return;
      }

      // Demo bypass safety
      if (user.id === "11111111-1111-1111-1111-111111111111") {
        setWorkspaceId("demo-workspace-123");
        return;
      }

      // Call the stored function we created in the migration
      const { data, error } = await supabase.rpc("get_user_workspaces");

      if (!error && data && data.length > 0) {
        setWorkspaceId(data[0]);
      }
    }

    fetchWorkspace();
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, workspaceId, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
