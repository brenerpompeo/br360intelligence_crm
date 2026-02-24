import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart, Settings, Rocket, Globe, Repeat,
  CheckCircle2, Circle, Clock, AlertTriangle, ChevronDown,
  Copy, ExternalLink
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { cn } from "@/lib/utils";

interface SetupStep {
  id: number;
  title: string;
  duration: string;
  icon: React.ElementType;
  variant: "default" | "critical";
  description: string;
  tasks: TaskItem[];
  tips: string[];
  links?: { label: string; url: string }[];
}

interface TaskItem {
  text: string;
  detail?: string;
}

const setupSteps: SetupStep[] = [
  {
    id: 1,
    title: "Venda & Triage",
    duration: "Assíncrono",
    icon: ShoppingCart,
    variant: "default",
    description:
      "O cliente acabou de pagar a Taxa de Setup (R$ 1.490). Agora ele precisa preencher o formulário com todas as informações do site.",
    tasks: [
      { text: "Confirmar pagamento da Taxa de Setup (R$ 1.490)", detail: "Verificar no gateway de pagamento ou Pix" },
      { text: "Enviar link do formulário ao cliente", detail: "Tally.so ou Typeform — usar template padrão BR360" },
      { text: "Aguardar respostas: cores, textos, domínio, logo/fotos", detail: "Se demorar >48h, enviar lembrete" },
      { text: "Validar se fotos têm qualidade mínima aceitável", detail: "Resolução mínima 800×600, sem blur" },
      { text: "Classificar avatar: Criativo ou Negócio Local" },
    ],
    tips: [
      "Nunca comece o setup sem o formulário 100% preenchido",
      "Se o cliente não tem logo, ofereça o upsell de Redesign de Logo (R$ 500)",
      "Se as fotos são ruins, ofereça o upsell de Sessão de Fotos (R$ 800)",
    ],
  },
  {
    id: 2,
    title: "Setup no Cérebro (Payload CMS)",
    duration: "~5 min",
    icon: Settings,
    variant: "default",
    description:
      "Com o formulário preenchido, crie o tenant do cliente no Payload CMS e configure todos os conteúdos.",
    tasks: [
      { text: "Acessar Payload CMS → 'Novo Cliente'", detail: "URL: seu-domínio.com/admin" },
      { text: "Preencher dados básicos: nome, telefone, endereço" },
      { text: "Colar textos do formulário nos campos correspondentes" },
      { text: "Upload de fotos via plugin Cloudinary", detail: "Otimização automática: WebP, resize, lazy loading" },
      { text: "Selecionar layout do template", detail: "Opções: 'criativo' ou 'local_business'" },
      { text: "Copiar API_KEY gerada para o próximo passo" },
    ],
    tips: [
      "REGRA INQUEBRÁVEL: nenhuma foto entra crua — sempre via Cloudinary",
      "Se o Cloudinary falhar, use Squoosh para converter para .webp antes",
      "O Payload gera a API_KEY automaticamente ao salvar o tenant",
    ],
  },
  {
    id: 3,
    title: "Deploy na Vercel",
    duration: "~3 min",
    icon: Rocket,
    variant: "default",
    description:
      "Deploy do site do cliente usando o repositório master. Cada cliente é um deploy separado com sua API_KEY.",
    tasks: [
      { text: "Vercel → 'New Project'", detail: "Usar o repositório Master do template" },
      { text: "Configurar variável de ambiente: CLIENT_ID", detail: "Colar a API_KEY copiada do Payload CMS" },
      { text: "Clicar Deploy", detail: "Site nasce em ~60 segundos" },
      { text: "Verificar se o site carregou corretamente" },
      { text: "Testar responsividade no mobile" },
    ],
    tips: [
      "Sempre verifique o site no mobile antes de informar o cliente",
      "Se der erro 500, provavelmente a API_KEY está errada",
      "Custo: R$ 0 — Vercel hobby plan cobre centenas de sites",
    ],
  },
  {
    id: 4,
    title: "Domínio (Ramificação)",
    duration: "Variável",
    icon: Globe,
    variant: "critical",
    description:
      "Configurar o domínio do cliente. Existem dois cenários possíveis.",
    tasks: [
      { text: "Cenário A: Comprar domínio na Hostinger", detail: "Usar parte do valor do Setup para cobrir (~R$ 40/ano)" },
      { text: "Cenário A: Criar CNAME → cname.vercel-dns.com" },
      { text: "Cenário B: Cliente já tem domínio próprio", detail: "Enviar instrução padrão ao cliente" },
      { text: "NUNCA pedir senha do registrador do cliente" },
      { text: "Verificar propagação DNS", detail: "Pode levar até 48h, normalmente <2h" },
      { text: "Adicionar domínio customizado na Vercel" },
    ],
    tips: [
      "Cenário B: envie um PDF/print-screen com as instruções de CNAME",
      "Se a propagação demorar >4h, verifique se o CNAME está correto",
      "Hostinger é a opção mais barata para domínios .com.br",
    ],
  },
  {
    id: 5,
    title: "Loop de Manutenção",
    duration: "Contínuo",
    icon: Repeat,
    variant: "default",
    description:
      "Cliente ativo! A manutenção é feita 100% pelo Payload CMS sem tocar em código.",
    tasks: [
      { text: "Alteração pedida? → Editar no Payload CMS → Salvar" },
      { text: "Webhook avisa Vercel → site atualiza em ~1 min" },
      { text: "NÃO mexer no código para manutenção", detail: "Se precisar de código, é feature nova (cobrar extra)" },
      { text: "Registrar a alteração no log do cliente" },
    ],
    tips: [
      "Manutenção está inclusa na assinatura de R$ 274,90/mês",
      "Se o cliente pedir algo fora dos blocos pré-construídos → R$ 5.000 ou cliente demitido",
      "Use o webhook do Payload para rebuild automático na Vercel",
    ],
  },
];

const SetupChecklist = () => {
  const [openStep, setOpenStep] = useState<number | null>(1);
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  const toggleTask = (stepId: number, taskIdx: number) => {
    const key = `${stepId}-${taskIdx}`;
    setCheckedTasks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getStepProgress = (step: SetupStep) => {
    const total = step.tasks.length;
    const done = step.tasks.filter((_, i) => checkedTasks[`${step.id}-${i}`]).length;
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-1">Checklist de Setup</h2>
          <p className="text-sm text-muted-foreground">
            Guia passo-a-passo para onboarding de cada cliente. Marque as tarefas conforme avança.
          </p>
        </div>

        {/* Progress overview */}
        <div className="grid grid-cols-5 gap-2">
          {setupSteps.map((step) => {
            const prog = getStepProgress(step);
            return (
              <button
                key={step.id}
                onClick={() => setOpenStep(openStep === step.id ? null : step.id)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-all",
                  openStep === step.id ? "border-primary/40 bg-primary/5" : "border-border bg-card/50 hover:bg-card"
                )}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <step.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-mono font-bold text-muted-foreground">PASSO {step.id}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-1">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${prog.pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">{prog.done}/{prog.total}</span>
              </button>
            );
          })}
        </div>

        {/* Steps detail */}
        <div className="space-y-3">
          {setupSteps.map((step, si) => {
            const isOpen = openStep === step.id;
            const prog = getStepProgress(step);
            const StepIcon = step.icon;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: si * 0.05 }}
                className={cn(
                  "rounded-lg border overflow-hidden transition-colors",
                  step.variant === "critical" ? "border-destructive/30" : "border-border",
                  isOpen ? "bg-card" : "bg-card/50"
                )}
              >
                {/* Header */}
                <button
                  onClick={() => setOpenStep(isOpen ? null : step.id)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold font-mono",
                    prog.pct === 100
                      ? "bg-accent/15 text-accent"
                      : step.variant === "critical"
                      ? "bg-destructive/15 text-destructive"
                      : "bg-primary/15 text-primary"
                  )}>
                    {prog.pct === 100 ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold truncate">{step.title}</h3>
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {step.duration}
                      </span>
                      {step.variant === "critical" && (
                        <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-muted-foreground">{prog.done}/{prog.total}</span>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </div>
                </button>

                {/* Content */}
                {isOpen && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                    {/* Tasks */}
                    <div className="space-y-2">
                      {step.tasks.map((task, ti) => {
                        const key = `${step.id}-${ti}`;
                        const checked = checkedTasks[key];
                        return (
                          <label
                            key={ti}
                            className={cn(
                              "flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all",
                              checked
                                ? "bg-accent/5 border-accent/20"
                                : "bg-muted/30 border-border hover:bg-muted/50"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={!!checked}
                              onChange={() => toggleTask(step.id, ti)}
                              className="mt-0.5 accent-primary"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-sm", checked && "line-through text-muted-foreground")}>
                                {task.text}
                              </p>
                              {task.detail && (
                                <p className="text-xs text-muted-foreground mt-0.5">{task.detail}</p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {/* Tips */}
                    <div className="rounded-md bg-primary/5 border border-primary/10 p-3">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-primary mb-2 font-bold">💡 Dicas</p>
                      <ul className="space-y-1">
                        {step.tips.map((tip, ti) => (
                          <li key={ti} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
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

export default SetupChecklist;
