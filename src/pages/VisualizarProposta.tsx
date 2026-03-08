import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FileText, CheckCircle2, Loader2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function VisualizarProposta() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [proposal, setProposal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchProposal() {
            if (!id) return;
            try {
                const { data, error } = await supabase
                    .from("proposals")
                    .select("*, clients(name, company_name)")
                    .eq("id", id)
                    .single();

                if (error || !data) throw error || new Error("Proposta não encontrada");
                setProposal(data);
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchProposal();
    }, [id]);

    const handleAccept = async () => {
        if (!proposal || proposal.status === 'accepted') return;
        setAccepting(true);
        try {
            const { error } = await supabase
                .from("proposals")
                .update({ status: 'accepted' })
                .eq("id", proposal.id);

            if (error) throw error;

            setProposal({ ...proposal, status: 'accepted' });
            toast({
                title: "Proposta Aceita",
                description: "Agradecemos a confiança! Em breve entraremos em contato.",
            });
        } catch (err: any) {
            toast({
                title: "Erro ao aceitar proposta",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setAccepting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    if (error || !proposal) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
                <FileText className="h-16 w-16 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-0">Proposta não encontrada</h2>
                <p className="text-muted-foreground text-center max-w-sm">
                    O link pode estar quebrado ou a proposta ter sido removida.
                </p>
            </div>
        );
    }

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

    return (
        <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{proposal.title}</h1>
                    <p className="text-muted-foreground">
                        Apresentada para: <strong className="text-foreground">{proposal.clients?.company_name || proposal.clients?.name}</strong>
                    </p>
                    {proposal.valid_until && (
                        <p className="text-sm text-amber-600 font-medium flex items-center justify-center gap-1.5">
                            <Calendar className="h-4 w-4" /> Válida até {new Date(proposal.valid_until).toLocaleDateString("pt-BR")}
                        </p>
                    )}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="p-6 border-b border-border bg-muted/10 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold mb-0">Resumo do Investimento</h2>
                            <p className="text-sm text-muted-foreground">Valores acordados para a execução do serviço</p>
                        </div>
                    </div>

                    <div className="p-6 grid gap-6 sm:grid-cols-2">
                        <div className="p-4 rounded-lg bg-background border border-border">
                            <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-mono">Setup Início</p>
                            <p className="text-3xl font-bold text-foreground mb-0">{formatCurrency(proposal.setup_fee)}</p>
                            <p className="text-xs text-muted-foreground mt-2">Pagamento único na assinatura</p>
                        </div>
                        <div className="p-4 rounded-lg bg-background border border-border">
                            <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-mono">Mensalidade</p>
                            <p className="text-3xl font-bold text-foreground mb-0">{formatCurrency(proposal.monthly_fee)}<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
                            <p className="text-xs text-muted-foreground mt-2">Valor recorrente pelo serviço</p>
                        </div>
                    </div>
                </motion.div>

                {proposal.contract_text && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border border-border p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 border-b border-border pb-2">Termos do Contrato</h3>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {proposal.contract_text}
                        </div>
                    </motion.div>
                )}

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pt-4 flex flex-col items-center">
                    {proposal.status === 'accepted' ? (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-6 py-4 rounded-lg border border-green-200">
                            <CheckCircle2 className="h-6 w-6" />
                            <span className="font-semibold text-lg">Proposta Aceita com Sucesso</span>
                        </div>
                    ) : (
                        <button
                            onClick={handleAccept}
                            disabled={accepting}
                            className="w-full sm:w-auto px-8 py-4 rounded-lg bg-primary text-primary-foreground text-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
                        >
                            {accepting ? <Loader2 className="h-6 w-6 animate-spin" /> : <CheckCircle2 className="h-6 w-6" />}
                            {accepting ? "Processando aceite..." : "Aceitar e Assinar Proposta"}
                        </button>
                    )}

                    {proposal.status !== 'accepted' && (
                        <p className="text-xs text-muted-foreground mt-4 text-center max-w-md">
                            Ao clicar em "Aceitar e Assinar", você concorda com os termos descritos acima e confirma o aceite das condições comerciais.
                        </p>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
