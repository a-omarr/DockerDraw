import { Terminal, ArrowRight, FileCheck, ExternalLink } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function DownloadSuccessModal() {
    const { showSuccessModal, setModalVisibility, projectName } = useAppStore();

    const steps = [
        { step: 1, text: 'Move the file to your project directory', code: null },
        { step: 2, text: 'Create a .env file for secrets (optional)', code: 'POSTGRES_PASSWORD=your_secure_password' },
        { step: 3, text: 'Start your stack', code: 'docker compose up -d' },
    ];

    return (
        <Dialog open={showSuccessModal} onOpenChange={(show) => setModalVisibility('showSuccessModal', show)}>
            <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="px-6 py-5 border-b bg-emerald-50/50">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                            <FileCheck size={18} />
                        </div>
                        <DialogTitle className="text-xl font-bold tracking-tight text-emerald-900">Success!</DialogTitle>
                    </div>
                    <DialogDescription className="text-xs text-emerald-700/70">
                        Your <span className="font-bold">{projectName}</span> configuration has been downloaded.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                            Recommended Next Steps
                        </h3>

                        <div className="space-y-3">
                            {steps.map(({ step, text, code }) => (
                                <div key={step} className="flex gap-4 group">
                                    <div className="flex flex-col items-center">
                                        <div className="w-6 h-6 rounded-full bg-muted border flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300">
                                            {step}
                                        </div>
                                        {step < steps.length && <div className="w-px h-full bg-border mt-1" />}
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <p className="text-[13px] font-medium text-foreground leading-tight mb-2">{text}</p>
                                        {code && (
                                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border/40 font-mono text-[11px] text-emerald-700 group-hover:bg-muted/60 transition-colors">
                                                <Terminal size={12} className="text-muted-foreground" />
                                                {code}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50/30 border border-blue-100/50">
                        <div className="flex items-center gap-2 text-blue-700">
                            <ExternalLink size={14} />
                            <span className="text-xs font-semibold">Need help?</span>
                        </div>
                        <a href="https://docs.docker.com/compose/" target="_blank" rel="noreferrer" className="text-[10px] font-bold uppercase text-blue-600 hover:text-blue-800 transition-colors">
                            View Docker Docs
                        </a>
                    </div>
                </div>

                <div className="p-6 pt-0">
                    <Button
                        onClick={() => setModalVisibility('showSuccessModal', false)}
                        className="w-full h-11 text-sm font-bold shadow-sm"
                    >
                        Awesome, let's go!
                        <ArrowRight size={16} className="ml-2" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
