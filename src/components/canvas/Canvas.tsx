import { useState } from 'react';
import {
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useAppStore } from '../../store/useAppStore';
import { PortConflictBanner } from '../PortConflictBanner';
import { EmptyCanvas } from './EmptyCanvas';
import { ServiceList } from './ServiceList';

export function Canvas() {
    const { services, portConflicts, reorderServices } = useAppStore();
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
                    <ServiceList
                        sensors={sensors}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        activeDragId={activeDragId}
                    />
                )}
            </div>
        </div>
    );
}
