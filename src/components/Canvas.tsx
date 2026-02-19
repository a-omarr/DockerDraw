import { Plus, Layers } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { ServiceNode } from './ServiceNode';
import { PortConflictBanner } from './PortConflictBanner';
import { Button } from '@/components/ui/button';

export function Canvas() {
    const { services, portConflicts, selectedServiceId } = useAppStore();

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
                    <div className="p-4 space-y-2 max-w-2xl mx-auto sticky top-0 z-20">
                        {portConflicts.map((conflict) => (
                            <PortConflictBanner key={conflict.port} conflict={conflict} />
                        ))}
                    </div>
                )}

                {services.length === 0 ? (
                    <EmptyCanvas />
                ) : (
                    <div className="p-8 max-w-3xl mx-auto space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                                {services.length} service{services.length !== 1 ? 's' : ''} configured
                            </h2>
                        </div>
                        {services.map((service, index) => (
                            <div
                                key={service.id}
                                className="animate-fade-in-up"
                                style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'both' }}
                            >
                                <ServiceNode
                                    service={service}
                                    isSelected={service.id === selectedServiceId}
                                />
                                {/* Dependency flow */}
                                {service.dependsOn.length > 0 && (
                                    <div className="pl-12 mt-2 space-y-1">
                                        {service.dependsOn.map((dep) => (
                                            <div
                                                key={dep}
                                                className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground"
                                            >
                                                <div className="w-2 h-[1px] bg-border" />
                                                <span className="text-primary/70">Requires</span>
                                                <span className="px-1.5 py-0.5 rounded-md bg-white border border-border shadow-sm font-mono text-foreground">
                                                    {dep}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="pt-8 flex justify-center">
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
                )}
            </div>
        </div>
    );
}

function EmptyCanvas() {
    const { setShowTemplateGallery, addService } = useAppStore();
    return (
        <div className="flex-1 flex flex-col items-center justify-center h-full py-20 px-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-6 shadow-sm">
                <Layers size={32} className="text-primary/40" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">
                Build your Docker stack
            </h3>
            <p className="text-sm text-muted-foreground mb-8 max-w-xs text-center">
                Select a service from the library or start with a pre-configured template.
            </p>
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
                    onClick={() => addService('postgresql')}
                >
                    <Plus size={18} />
                    Quick Add PostgreSQL
                </Button>
            </div>
        </div>
    );
}
