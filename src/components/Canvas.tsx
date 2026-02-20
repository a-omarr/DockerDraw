import { useState } from 'react';
import { Plus, Layers, Trash2, Code, Settings, Download } from 'lucide-react';
import { parseYAMLToServices } from '../utils/yamlImport';
import { EXAMPLE_COMPOSE } from '../data/exampleCompose';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    type DragStartEvent,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useAppStore } from '../store/useAppStore';
import { ServiceNode, ServiceNodeOverlay } from './ServiceNode';
import { PortConflictBanner } from './PortConflictBanner';
import { ConfirmDialog } from './ConfirmDialog';
import { Button } from '@/components/ui/button';

export function Canvas() {
    const { services, portConflicts, selectedServiceId, reorderServices, clearAllServices } = useAppStore();
    const [activeDragId, setActiveDragId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveDragId(null);
        const { active, over } = event;
        if (over && active.id !== over.id) {
            reorderServices(active.id as string, over.id as string);
        }
    };

    const draggedService = activeDragId ? services.find((s) => s.id === activeDragId) : null;

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
            {/* Dot-grid background */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.4]"
                style={{
                    backgroundImage:
                        'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />

            <div className="relative flex-1 overflow-y-auto overflow-x-hidden">
                {/* Port conflict banners */}
                {portConflicts.length > 0 && (
                    <div className="p-2 sm:p-4 space-y-2 max-w-2xl mx-auto sticky top-0 z-20">
                        {portConflicts.map((conflict) => (
                            <PortConflictBanner key={conflict.port} conflict={conflict} />
                        ))}
                    </div>
                )}

                {services.length === 0 ? (
                    <EmptyCanvas />
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
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
                                        {/* Dependency flow */}
                                        {service.dependsOn.length > 0 && (
                                            <div className="pl-6 sm:pl-12 mt-2 space-y-1">
                                                {service.dependsOn.map((depId) => {
                                                    const depService = services.find((s) => s.id === depId);
                                                    const depName = depService ? depService.name : depId;
                                                    return (
                                                        <div
                                                            key={depId}
                                                            className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground"
                                                        >
                                                            <div className="w-2 h-[1px] bg-border" />
                                                            <span className="text-primary/70">Requires</span>
                                                            <span className="px-1.5 py-0.5 rounded-md bg-white border border-border shadow-sm font-mono text-foreground">
                                                                {depName}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <div className="pt-6 sm:pt-8 flex justify-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-2 rounded-full border-dashed bg-transparent hover:bg-white transition-all shadow-none"
                                        onClick={() => useAppStore.getState().setShowTemplateGallery(true)}
                                    >
                                        <Plus size={14} />
                                        Add another service
                                    </Button>
                                </div>
                            </div>
                        </SortableContext>
                        <DragOverlay>
                            {draggedService ? (
                                <ServiceNodeOverlay
                                    service={draggedService}
                                />
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                )}
            </div>
        </div>
    );
}

function EmptyCanvas() {
    const { setShowTemplateGallery, setShowCommandPalette, importFromYAML } = useAppStore();

    const handleAddExample = () => {
        try {
            const { services, network } = parseYAMLToServices(EXAMPLE_COMPOSE);
            importFromYAML(services, network);
        } catch (error) {
            console.error('Failed to load example compose:', error);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center h-full py-12 sm:py-20 px-4 sm:px-6">
            {/* Animated floating icons illustration */}
            <div className="mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5 animate-bounce-in">
                    <Layers size={28} className="text-primary/60" />
                </div>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-1.5 text-center tracking-tight">
                Build your Docker stack
            </h3>
            <p className="text-sm text-muted-foreground mb-8 max-w-sm text-center leading-relaxed">
                Visually compose services, configure ports and volumes, then export a ready-to-use <code className="text-xs px-1 py-0.5 bg-muted rounded font-mono">docker-compose.yml</code>.
            </p>

            {/* 3-step guide */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 mb-10 px-2">
                {[
                    { step: '1', icon: Plus, label: 'Pick services', sub: 'from the library' },
                    { step: '2', icon: Settings, label: 'Configure', sub: 'ports, env, volumes' },
                    { step: '3', icon: Download, label: 'Export', sub: 'docker-compose.yml' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                        {i > 0 && (
                            <div className="hidden sm:block w-8 h-[1px] bg-border -ml-3" />
                        )}
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                                {item.step}
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-foreground leading-tight">{item.label}</p>
                                <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    size="lg"
                    className="gap-2 shadow-md px-6"
                    onClick={() => setShowTemplateGallery(true)}
                >
                    <Layers size={18} />
                    Browse Templates
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 px-6 bg-white"
                    onClick={handleAddExample}
                >
                    <Code size={18} />
                    Try Example Stack
                </Button>
            </div>

            {/* Command palette hint */}
            <button
                onClick={() => setShowCommandPalette(true)}
                className="mt-6 flex items-center gap-2 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer"
            >
                Press
                <kbd className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border/50">
                    Ctrl+K
                </kbd>
                to open the command palette
            </button>
        </div>
    );
}
