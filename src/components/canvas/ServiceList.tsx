import {
    DndContext,
    closestCenter,
    DragOverlay,
    type DragStartEvent,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Trash2, Plus } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ServiceNode, ServiceNodeOverlay } from '../ServiceNode';
import { ConfirmDialog } from '../ConfirmDialog';
import { Button } from '../ui/button';
import { DependencyFlow } from './DependencyFlow';

interface ServiceListProps {
    sensors: any;
    onDragStart: (event: DragStartEvent) => void;
    onDragEnd: (event: DragEndEvent) => void;
    activeDragId: string | null;
}

export function ServiceList({
    sensors,
    onDragStart,
    onDragEnd,
    activeDragId,
}: ServiceListProps) {
    const { services, selectedServiceId, clearAllServices } = useAppStore();
    const draggedService = activeDragId ? services.find((s) => s.id === activeDragId) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            <SortableContext
                items={services.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                            {services.length} service{services.length !== 1 ? 's' : ''} configured
                        </h2>
                        <ConfirmDialog
                            trigger={
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 gap-1.5 text-[10px] text-muted-foreground/50 hover:text-destructive"
                                >
                                    <Trash2 size={11} />
                                    Clear All
                                </Button>
                            }
                            title="Clear all services?"
                            description={`This will remove all ${services.length} service${services.length !== 1 ? 's' : ''} from the canvas. You can undo this action with Ctrl+Z.`}
                            confirmLabel="Clear All"
                            variant="destructive"
                            onConfirm={clearAllServices}
                        />
                    </div>
                    {services.map((service) => (
                        <div key={service.id}>
                            <ServiceNode
                                service={service}
                                isSelected={service.id === selectedServiceId}
                            />
                            <DependencyFlow dependsOn={service.dependsOn} />
                        </div>
                    ))}

                    <div className="pt-6 sm:pt-8 flex justify-center">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2 rounded-full border-dashed bg-transparent hover:bg-white transition-all shadow-none"
                            onClick={() => useAppStore.getState().setShowAddServiceModal(true)}
                        >
                            <Plus size={14} />
                            Add another service
                        </Button>
                    </div>
                </div>
            </SortableContext>
            <DragOverlay>
                {draggedService ? (
                    <ServiceNodeOverlay service={draggedService} />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
