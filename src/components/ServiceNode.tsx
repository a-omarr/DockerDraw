import { Trash2, Copy, Edit3, Network, HardDrive, Globe, GripVertical, FolderOpen } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Service } from '../types';
import { useAppStore } from '../store/useAppStore';
import { serviceTemplates } from '../data/serviceTemplates';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from './modals';
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

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: service.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            onClick={() => selectService(isSelected ? null : service.id)}
            className={cn(
                "relative p-3 sm:p-4 cursor-pointer transition-all duration-200 border-border/60 hover:border-border hover:shadow-md",
                isSelected && "ring-2 ring-primary ring-offset-2 shadow-lg scale-[1.01]",
                isDragging && "opacity-30 border-dashed border-2 border-primary/40 shadow-none bg-primary/5"
            )}
        >
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Drag handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="flex items-center justify-center w-6 h-8 rounded cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors shrink-0 touch-none"
                    onClick={(e) => e.stopPropagation()}
                    title="Drag to reorder"
                >
                    <GripVertical size={16} />
                </button>

                <ServiceNodeContent service={service} template={template} color={color} emoji={emoji} />

                {/* Actions */}
                <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 ml-1 sm:ml-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                        onClick={(e) => {
                            e.stopPropagation();
                            selectService(service.id);
                        }}
                        title="Edit Service"
                    >
                        <Edit3 size={13} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 hidden sm:flex"
                        onClick={(e) => {
                            e.stopPropagation();
                            duplicateService(service.id);
                        }}
                        title="Duplicate"
                    >
                        <Copy size={13} />
                    </Button>
                    <ConfirmDialog
                        trigger={
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                                onClick={(e) => e.stopPropagation()}
                                title="Remove"
                            >
                                <Trash2 size={13} />
                            </Button>
                        }
                        title={`Delete "${service.name}"?`}
                        description="This service and its configuration will be removed from the canvas. You can undo this with Ctrl+Z."
                        confirmLabel="Delete"
                        variant="destructive"
                        onConfirm={() => removeService(service.id)}
                    />
                </div>
            </div>
        </Card>
    );
}

/** Static overlay shown during drag — no sortable hooks, just a visual clone */
export function ServiceNodeOverlay({ service }: { service: Service }) {
    const template = serviceTemplates.find((t) => t.id === service.templateId);
    const color = template?.color || '#4f8ef7';
    const emoji = template?.emoji || '📦';

    return (
        <Card className="p-3 sm:p-4 shadow-2xl border-primary/30 ring-2 ring-primary/20 scale-[1.02] rotate-[0.5deg] bg-background cursor-grabbing">
            <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center justify-center w-6 h-8 rounded cursor-grabbing text-muted-foreground/60 shrink-0">
                    <GripVertical size={16} />
                </div>
                <ServiceNodeContent service={service} template={template} color={color} emoji={emoji} />
            </div>
        </Card>
    );
}

/** Shared visual content between sortable and overlay cards */
function ServiceNodeContent({
    service,
    template,
    color,
    emoji,
}: {
    service: Service;
    template: ReturnType<typeof serviceTemplates.find>;
    color: string;
    emoji: string;
}) {
    return (
        <>
            {/* Icon */}
            <div
                className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl text-xl sm:text-2xl flex-shrink-0 shadow-sm border border-border/50"
                style={{ backgroundColor: `${color}10`, color: color }}
            >
                {template?.Icon ? (
                    <>
                        <template.Icon size={20} className="sm:hidden" />
                        <template.Icon size={24} className="hidden sm:block" />
                    </>
                ) : (
                    emoji
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs sm:text-sm tracking-tight text-foreground truncate">
                        {service.name}
                    </span>
                    <Badge variant="outline" className="font-mono text-[10px] h-4 px-1.5 bg-background hidden sm:inline-flex">
                        {service.buildContext ? 'build' : (service.image.split(':')[1] || 'latest')}
                    </Badge>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate font-mono opacity-70">
                    {service.buildContext ? (
                        <span className="flex items-center gap-1">
                            <FolderOpen size={10} className="shrink-0" />
                            build {service.buildContext}
                        </span>
                    ) : (
                        service.image
                    )}
                </p>

                {/* Badges row */}
                <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-3 flex-wrap">
                    {service.ports.length > 0 && (
                        <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-medium text-muted-foreground bg-slate-100/50 px-1.5 sm:px-2 py-0.5 rounded-full border border-slate-200/50">
                            <Globe size={10} className="text-blue-500 shrink-0" />
                            <span className="truncate max-w-[80px] sm:max-w-none">
                                {service.ports.map((p) => `${p.host}:${p.container}`).join(', ')}
                            </span>
                        </div>
                    )}
                    {service.volumes.length > 0 && (
                        <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-medium text-muted-foreground bg-slate-100/50 px-1.5 sm:px-2 py-0.5 rounded-full border border-slate-200/50">
                            <HardDrive size={10} className="text-amber-500 shrink-0" />
                            {service.volumes.length} vol
                        </div>
                    )}
                    {service.networks.length > 0 && (
                        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground bg-slate-100/50 px-2 py-0.5 rounded-full border border-slate-200/50">
                            <Network size={11} className="text-emerald-500" />
                            {service.networks[0]}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
