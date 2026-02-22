import { motion } from "framer-motion";
import {
  Users, DollarSign, Zap, BarChart3,
  ShoppingCart, Settings, Globe, FileText,
  Repeat, AlertTriangle, Layers, Rocket
} from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { WorkflowStep } from "@/components/WorkflowStep";
import { GapCard } from "@/components/GapCard";
import { UpsellCard } from "@/components/UpsellCard";
import { ArchitectureTable } from "@/components/ArchitectureTable";
import { AppLayout } from "@/components/AppLayout";

const workflowSteps = [
  {
    title: "Venda & Triage",
    duration: "Assíncrono",
    icon: ShoppingCart,
    tasks: [
      "Cliente pagou Taxa de Setup (R$ 500)?",
      "Redirecionado para formulário (Tally.so/Typeform)?",
      "Perguntas respondidas: cores, texto, domínio, logo/fotos?",
    ],
  },
  {
    title: "Setup no Cérebro (Payload CMS)",
    duration: "~5 min",
    icon: Settings,
    tasks: [
      "Acessar Payload CMS → 'Novo Cliente'",
      "Colar textos do formulário",
      "Enviar fotos via plugin Cloudinary (otimização automática)",
      "Selecionar layout: criativo ou local_business",
      "Copiar API_KEY gerada",
    ],
  },
  {
    title: "Deploy na Vercel",
    duration: "~3 min",
    icon: Rocket,
    tasks: [
      "Vercel → 'New Project' → Repositório Master",
      "Colar API_KEY na variável CLIENT_ID",
      "Clicar Deploy (site nasce em 60s)",
    ],
  },
  {
    title: "Domínio (Ramificação)",
    duration: "Variável",
    icon: Globe,
    variant: "critical" as const,
    tasks: [
      "Cenário A: Comprar domínio na Hostinger com parte do Setup",
      "Cenário A: Criar CNAME → cname.vercel-dns.com",
      "Cenário B: Enviar instrução padrão ao cliente (sem pedir senha!)",
      "Verificar propagação DNS",
    ],
  },
  {
    title: "Loop de Manutenção",
    duration: "Contínuo",
    icon: Repeat,
    tasks: [
      "Alteração pedida? Editar no Payload CMS → Salvar",
      "Webhook avisa Vercel → site atualiza em ~1 min",
      "NÃO mexer no código para manutenção",
    ],
  },
];

const gaps = [
  { gap: "Estouro de servidor por imagens", solution: "Regra inquebrável: nenhuma foto entra crua. Cloudinary/Squoosh → .webp obrigatório." },
  { gap: "Fatura surpresa (AWS S3)", solution: "Proibido usar AWS nesta fase. Custos de egress podem quebrar o negócio. Ficar com Cloudinary + Vercel." },
  { gap: "Cliente exigindo funções exclusivas complexas", solution: "Dizer NÃO. Fora dos blocos pré-construídos = R$ 5.000 ou cliente demitido." },
  { gap: "O 'Paciente Zero'", solution: "Site BR360 = Tenant ID 000 no próprio sistema. Se o sistema for ruim, seu site cai. Alinhamento total." },
];

const upsells = [
  { service: "Redesign de Logo", sellPrice: "R$ 500", cost: "R$ 150", profit: "R$ 350", note: "Freelancer via Workana/Fiverr" },
  { service: "Sessão de Fotos", sellPrice: "R$ 800", cost: "R$ 300", profit: "R$ 500", note: "Fotógrafo local iniciante com boa câmera" },
  { service: "Copywriting Premium", sellPrice: "R$ 300", cost: "R$ 0", profit: "R$ 300", note: "ChatGPT Plus + prompt validado (~15 min)" },
];

const Index = () => {
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <AppLayout>
      <div className="space-y-10">
        {/* Tese */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="rounded-lg border border-primary/20 bg-card/50 p-5 glow-primary">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="text-primary font-semibold">Lembrete:</span> Você não vende código ou horas de design.
              Você vende <span className="text-foreground font-medium">Velocidade, Conversão e Paz de Espírito</span> por
              meio de assinatura (Setup + R$ 150/mês). 100 clientes, 1 banco de dados, 1 repositório.
            </p>
          </div>
        </motion.section>

        {/* Metrics */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={Users} label="Meta: Clientes" value="100" subtitle="1 BD, 1 repo, custo marginal zero" accentColor="primary" />
          <MetricCard icon={DollarSign} label="MRR Meta" value="R$ 15k" subtitle="100 × R$ 150/mês" accentColor="accent" />
          <MetricCard icon={Layers} label="Avatares" value="2" subtitle="Criativos + Negócios Locais" accentColor="primary" />
          <MetricCard icon={BarChart3} label="Custo Infra" value="R$ 0" subtitle="Até escala massiva" accentColor="accent" />
        </section>

        {/* Architecture */}
        <section>
          <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4" /> Arquitetura Técnica
          </h2>
          <ArchitectureTable />
        </section>

        {/* Workflow */}
        <section>
          <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4" /> Loop de Execução — Workflow Diário
          </h2>
          <p className="text-xs text-destructive mb-4 font-medium">⚠ Se pular um passo, a alavancagem quebra.</p>
          <div className="space-y-3">
            {workflowSteps.map((step, i) => (
              <WorkflowStep
                key={i}
                step={i + 1}
                title={step.title}
                duration={step.duration}
                icon={step.icon}
                tasks={step.tasks}
                variant={step.variant || "default"}
              />
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upsells */}
          <section>
            <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Esteira de Arbitragem (Upsells)
            </h2>
            <div className="space-y-3">
              {upsells.map((u, i) => (
                <UpsellCard key={i} index={i} {...u} />
              ))}
            </div>
          </section>

          {/* Gaps */}
          <section>
            <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Prevenção de Falhas (Gaps)
            </h2>
            <div className="space-y-3">
              {gaps.map((g, i) => (
                <GapCard key={i} index={i} {...g} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
