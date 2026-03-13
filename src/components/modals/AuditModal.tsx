import {
    ShieldCheck,
    AlertTriangle,
    Info,
    Check,
    X,
    Loader2,
    Zap,
    ArrowRight,
    ShieldAlert,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { AuditFinding } from '@/types';

export function AuditModal() {
    const {
        showAuditModal,
        setModalVisibility,
        isAuditing,
        auditFindings,
        applyAuditFix,
        dismissAuditFinding,
        services,
    } = useAppStore();

    const getSeverityIcon = (severity: AuditFinding['severity']) => {
        switch (severity) {
            case 'critical': return <ShieldAlert size={18} className="text-red-500" />;
            case 'warning': return <AlertTriangle size={18} className="text-amber-500" />;
            case 'info': return <Info size={18} className="text-blue-500" />;
        }
    };

    const getCategoryStyles = (category: AuditFinding['category']) => {
        switch (category) {
            case 'Security': return 'bg-red-500/10 text-red-600 border-red-200';
            case 'Performance': return 'bg-amber-500/10 text-amber-600 border-amber-200';
            case 'Best Practice': return 'bg-blue-500/10 text-blue-600 border-blue-200';
        }
    };

    const getServiceName = (serviceId?: string) => {
        if (!serviceId) return null;
        return services.find(s => s.id === serviceId)?.name;
    };

    return (
        <Dialog open={showAuditModal} onOpenChange={(open) => setModalVisibility('showAuditModal', open)}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden sm:rounded-2xl border-border/40 shadow-2xl">
                <DialogHeader className="p-6 pb-4 border-b bg-muted/20">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <ShieldCheck className="text-primary" size={24} />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold">Smart Audit Scan</DialogTitle>
                            <DialogDescription className="text-xs">
                                AI-powered infrastructure analysis for Docker Compose.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="relative min-h-[400px] flex flex-col">
                    {isAuditing ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
                            <div className="relative">
                                <Loader2 size={48} className="text-primary animate-spin" />
                                <Zap size={20} className="text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-lg">Analyzing Infrastructure...</h3>
                                <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
                                    Our AI is scanning your services for security leaks, performance bottlenecks, and best practice violations.
                                </p>
                            </div>
                        </div>
                    ) : auditFindings.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <Check size={32} className="text-emerald-500" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-lg">Perfect Score!</h3>
                                <p className="text-sm text-muted-foreground">
                                    No issues found. Your Docker configuration follows all major best practices.
                                </p>
                            </div>
                            <Button variant="outline" onClick={() => setModalVisibility('showAuditModal', false)}>
                                Awesome, thanks!
                            </Button>
                        </div>
                    ) : (
                        <ScrollArea className="flex-1 max-h-[60vh] p-6 lg:p-8">
                            <div className="space-y-6">
                                {auditFindings.map((finding) => (
                                    <div 
                                        key={finding.id} 
                                        className={cn(
                                            "group relative flex gap-4 p-5 rounded-xl border border-border shadow-sm transition-all hover:shadow-md",
                                            finding.severity === 'critical' ? 'bg-red-500/[0.02] border-red-500/20' : 'bg-card'
                                        )}
                                    >
                                        <div className="shrink-0 mt-0.5">
                                            {getSeverityIcon(finding.severity)}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                                    getCategoryStyles(finding.category)
                                                )}>
                                                    {finding.category}
                                                </span>
                                                {finding.serviceId && (
                                                    <span className="text-[10px] font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-muted border border-border/50">
                                                        Service: {getServiceName(finding.serviceId)}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <h4 className="font-bold text-sm text-foreground mb-1 leading-tight">
                                                {finding.title}
                                            </h4>
                                            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                                                {finding.message}
                                            </p>

                                            {finding.fixAvailable && finding.fixDescription && (
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] font-bold text-primary uppercase tracking-tight mb-1">Recommended Fix</p>
                                                        <p className="text-[11px] text-primary/80 leading-snug line-clamp-2">
                                                            {finding.fixDescription}
                                                        </p>
                                                    </div>
                                                    <Button 
                                                        size="sm" 
                                                        className="h-8 gap-1.5 text-xs font-bold shadow-sm shrink-0 w-full sm:w-auto"
                                                        onClick={() => applyAuditFix(finding.id)}
                                                    >
                                                        Apply Fix
                                                        <ArrowRight size={12} />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <button 
                                            onClick={() => dismissAuditFinding(finding.id)}
                                            className="absolute top-4 right-4 text-muted-foreground/30 hover:text-muted-foreground transition-colors p-1"
                                            title="Dismiss"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <div className="p-4 border-t bg-muted/10 flex items-center justify-between gap-4">
                    <p className="text-[10px] text-muted-foreground/60 italic max-w-[280px]">
                        Note: Audit is performed using Llama 3.3. Always verify production configurations manually.
                    </p>
                    {!isAuditing && (
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setModalVisibility('showAuditModal', false)}>
                                Close
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2" onClick={() => useAppStore.getState().performAudit()}>
                                <Zap size={14} />
                                Rescan
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
