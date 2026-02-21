import { Link } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { serviceTemplates } from '../../data/serviceTemplates';
import type { Service } from '../../types';

interface DependsOnSelectorProps {
    service: Service;
    services: Service[];
    onUpdate: (id: string, updates: Partial<Service>) => void;
}

export function DependsOnSelector({
    service,
    services,
    onUpdate,
}: DependsOnSelectorProps) {
    const otherServices = services.filter((s) => s.id !== service.id);

    if (otherServices.length === 0) {
        return (
            <div className="p-8 rounded-xl border border-dashed border-muted-foreground/20 bg-muted/5 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Link size={18} className="text-muted-foreground/40" />
                </div>
                <div className="space-y-1">
                    <p className="text-[11px] font-bold text-foreground/80 uppercase tracking-tight text-center">No other services</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[180px] text-center">
                        Add more services to the canvas to configure inter-service dependencies.
                    </p>
                </div>
            </div>
        );
    }

    const toggleDep = (id: string) => {
        const current = service.dependsOn;
        if (current.includes(id)) {
            onUpdate(service.id, { dependsOn: current.filter((d) => d !== id) });
        } else {
            onUpdate(service.id, { dependsOn: [...current, id] });
        }
    };

    return (
        <div className="flex flex-wrap gap-2 text-left">
            {otherServices.map((s) => {
                const isSelected = service.dependsOn.includes(s.id) || service.dependsOn.includes(s.name);
                const t = serviceTemplates.find((t) => t.id === s.templateId);
                return (
                    <Button
                        key={s.id}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDep(s.id)}
                        className={cn(
                            "h-8 gap-2 px-3 text-xs font-medium rounded-full",
                            !isSelected && "bg-muted/10 hover:bg-muted/30"
                        )}
                    >
                        <span className="flex items-center justify-center shrink-0">
                            {t?.Icon ? (
                                <t.Icon size={14} style={{ color: t.color }} />
                            ) : (
                                <span className="text-sm scale-110">{t?.emoji || '📦'}</span>
                            )}
                        </span>
                        {s.name}
                    </Button>
                );
            })}
        </div>
    );
}
