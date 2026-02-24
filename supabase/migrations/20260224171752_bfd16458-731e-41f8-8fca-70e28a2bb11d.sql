
-- ========================
-- CRM: Clients
-- ========================
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  cnpj_cpf TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('lead','active','inactive','churned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own clients" ON public.clients
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ========================
-- CRM: Interactions
-- ========================
CREATE TABLE public.client_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('call','email','meeting','whatsapp','other')),
  subject TEXT,
  notes TEXT,
  interaction_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.client_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own interactions" ON public.client_interactions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ========================
-- CRM: Services History
-- ========================
CREATE TABLE public.client_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  monthly_value NUMERIC(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.client_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own services" ON public.client_services
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ========================
-- Chart of Accounts
-- ========================
CREATE TABLE public.chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('revenue','cost','expense','investment','other')),
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own accounts" ON public.chart_of_accounts
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ========================
-- Transactions
-- ========================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own transactions" ON public.transactions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ========================
-- Proposals
-- ========================
CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Proposta Comercial',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','accepted','rejected','expired')),
  setup_fee NUMERIC(10,2) NOT NULL DEFAULT 1490.00,
  monthly_fee NUMERIC(10,2) NOT NULL DEFAULT 274.90,
  additional_notes TEXT,
  valid_until DATE,
  sent_at TIMESTAMPTZ,
  contract_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own proposals" ON public.proposals
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ========================
-- Proposal Items (extras)
-- ========================
CREATE TABLE public.proposal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0
);

ALTER TABLE public.proposal_items ENABLE ROW LEVEL SECURITY;

-- RLS via security definer to avoid recursion
CREATE OR REPLACE FUNCTION public.get_proposal_user_id(p_proposal_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM public.proposals WHERE id = p_proposal_id
$$;

CREATE POLICY "Users manage own proposal items" ON public.proposal_items
  FOR ALL USING (public.get_proposal_user_id(proposal_id) = auth.uid())
  WITH CHECK (public.get_proposal_user_id(proposal_id) = auth.uid());

-- ========================
-- Updated_at triggers
-- ========================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================
-- Default Chart of Accounts (seeded per user via trigger)
-- ========================
CREATE OR REPLACE FUNCTION public.seed_default_accounts()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.chart_of_accounts (user_id, name, type, is_default) VALUES
    (NEW.id, 'Receita de Setup', 'revenue', true),
    (NEW.id, 'Receita de Assinatura', 'revenue', true),
    (NEW.id, 'Receita de Upsells', 'revenue', true),
    (NEW.id, 'Custos Operacionais', 'cost', true),
    (NEW.id, 'Despesas Administrativas', 'expense', true),
    (NEW.id, 'Investimentos', 'investment', true),
    (NEW.id, 'Outros', 'other', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created_seed_accounts
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.seed_default_accounts();

-- ========================
-- Indexes
-- ========================
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_client_interactions_client_id ON public.client_interactions(client_id);
CREATE INDEX idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX idx_proposals_client_id ON public.proposals(client_id);
CREATE INDEX idx_proposals_status ON public.proposals(status);
