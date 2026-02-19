import { Trash2, Copy, Edit3, Network, HardDrive, Globe } from 'lucide-react';
import type { Service } from '../types';
import { useAppStore } from '../store/useAppStore';
import { serviceTemplates } from '../data/serviceTemplates';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
    service: Service;
    isSelected: boolean;
}

export function ServiceNode({ service, isSelected }: Props) {
    const { selectService, removeService, duplicateService } = useAppStore();
    const template = serviceTemplates.find((t) => t.id === service.templateId);
    const color = template?.color || '#4f8ef7';
    const emoji = template?.emoji || '📦';

    return (
        <Card
            onClick={() => selectService(isSelected ? null : service.id)}
            className={cn(
                "p-4 cursor-pointer transition-all duration-200 border-border/60 hover:border-border hover:shadow-md",
                isSelected && "ring-2 ring-primary ring-offset-2 shadow-lg scale-[1.01]"
            )}
        >
            <div className="flex items-center gap-4">
                {/* Icon */}
                <div
                    className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl flex-shrink-0 shadow-sm border border-border/50"
                    style={{ backgroundColor: `${color}10`, color: color }}
                >
                    {template?.Icon ? <template.Icon size={24} /> : emoji}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm tracking-tight text-foreground">
                            {service.name}
                        </span>
                        <Badge variant="outline" className="font-mono text-[10px] h-4 px-1.5 bg-background">
                            {service.image.split(':')[1] || 'latest'}
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate font-mono opacity-70">
                        {service.image}
                    </p>

                    {/* Badges row */}
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                        {service.ports.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground bg-slate-100/50 px-2 py-0.5 rounded-full border border-slate-200/50">
                                <Globe size={11} className="text-blue-500" />
                                {service.ports.map((p) => `${p.host}:${p.container}`).join(', ')}
                            </div>
                        )}
                        {service.volumes.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground bg-slate-100/50 px-2 py-0.5 rounded-full border border-slate-200/50">
                                <HardDrive size={11} className="text-amber-500" />
                                {service.volumes.length} volumes
                            </div>
                        )}
                        {service.networks.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground bg-slate-100/50 px-2 py-0.5 rounded-full border border-slate-200/50">
                                <Network size={11} className="text-emerald-500" />
                                {service.networks[0]}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 ml-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                        onClick={(e) => {
                            e.stopPropagation();
                            selectService(service.id);
                        }}
                        title="Edit Service"
                    >
                        <Edit3 size={14} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50"
                        onClick={(e) => {
                            e.stopPropagation();
                            duplicateService(service.id);
                        }}
                        title="Duplicate"
                    >
                        <Copy size={14} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeService(service.id);
                        }}
                        title="Remove"
                    >
                        <Trash2 size={14} />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
