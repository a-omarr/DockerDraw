import { GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Service, ServiceTemplate } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { serviceTemplates } from '../../data/serviceTemplates';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Sub-components
import { ServiceNodeIcon } from './ServiceNodeIcon';
import { ServiceNodeInfo } from './ServiceNodeInfo';
import { ServiceNodeBadges } from './ServiceNodeBadges';
import { ServiceNodeActions } from './ServiceNodeActions';

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

                <ServiceNodeActions
                    serviceName={service.name}
                    onEdit={() => selectService(service.id)}
                    onDuplicate={() => duplicateService(service.id)}
                    onRemove={() => removeService(service.id)}
                />
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
    template: ServiceTemplate | undefined;
    color: string;
    emoji: string;
}) {
    return (
        <>
            <ServiceNodeIcon template={template} color={color} emoji={emoji} />

            <div className="flex-1 min-w-0">
                <ServiceNodeInfo service={service} />
                <ServiceNodeBadges service={service} />
            </div>
        </>
    );
}
