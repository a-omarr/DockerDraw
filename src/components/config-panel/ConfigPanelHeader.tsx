import { X } from 'lucide-react';
import { Button } from '../ui/button';
import type { Service } from '../../types';
import type { ServiceTemplate } from '../../types';

interface ConfigPanelHeaderProps {
    service: Service;
    template: ServiceTemplate | null;
    onClose: () => void;
}

export function ConfigPanelHeader({
    service,
    template,
    onClose,
}: ConfigPanelHeaderProps) {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-b h-14 bg-background/50 backdrop-blur-sm sticky top-0 z-20">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-lg shrink-0">
                    {template?.Icon ? (
                        <template.Icon size={18} style={{ color: template.color }} />
                    ) : (
                        template?.emoji || '📦'
                    )}
                </div>
                <div className="text-left">
                    <p className="text-sm font-bold leading-none">{service.name}</p>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight mt-1">
                        {template?.name || 'Custom Service'}
                    </p>
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={onClose}
            >
                <X size={16} />
            </Button>
        </div>
    );
}
