import { AlertTriangle, Lightbulb, ChevronRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ValidationWarning } from '../types';

interface WarningsPanelProps {
    warnings: ValidationWarning[];
    className?: string;
}

export function WarningsPanel({ warnings, className }: WarningsPanelProps) {
    if (warnings.length === 0) return null;

    return (
        <div className={cn(
            "flex-shrink-0 w-full md:w-80 h-40 md:h-auto border-t md:border-t-0 md:border-l bg-muted/10 backdrop-blur-sm animate-in slide-in-from-bottom-2 md:slide-in-from-right-1 duration-300 z-10",
            className
        )}>
            <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                    {warnings.map((w) => (
                        <div
                            key={w.id}
                            className={cn(
                                "p-3 rounded-lg border text-[11px] leading-relaxed relative overflow-hidden group transition-all hover:shadow-sm",
                                w.type === 'tip'
                                    ? 'bg-emerald-50/30 border-emerald-100 text-emerald-900/80'
                                    : w.type === 'error'
                                        ? 'bg-red-50/30 border-red-100 text-red-900/80'
                                        : 'bg-amber-50/30 border-amber-100 text-amber-900/80'
                            )}
                        >
                            <div className="flex items-start gap-2.5">
                                <div className={cn(
                                    "shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center",
                                    w.type === 'tip' ? 'bg-emerald-100 text-emerald-600' :
                                        w.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                )}>
                                    {w.type === 'tip' ? <Lightbulb size={12} /> : <AlertTriangle size={12} />}
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium">{w.message}</p>
                                    {w.action && (
                                        <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity italic decoration-dotted underline-offset-2">
                                            <ChevronRight size={10} />
                                            <span>{w.action}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
