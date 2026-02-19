import { Plus, Layers } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { ServiceNode } from './ServiceNode';
import { PortConflictBanner } from './PortConflictBanner';

export function Canvas() {
    const { services, portConflicts, selectedServiceId } = useAppStore();

    return (
        <div
            className="flex-1 flex flex-col h-full overflow-hidden"
            style={{ background: 'var(--bg-primary)', position: 'relative' }}
        >
            {/* Dot-grid background */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        'radial-gradient(circle, rgba(45,51,84,0.6) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />

            <div className="relative flex-1 overflow-y-auto overflow-x-hidden">
                {/* Port conflict banners */}
                {portConflicts.length > 0 && (
                    <div className="p-4 space-y-2">
                        {portConflicts.map((conflict) => (
                            <PortConflictBanner key={conflict.port} conflict={conflict} />
                        ))}
                    </div>
                )}

                {services.length === 0 ? (
                    <EmptyCanvas />
                ) : (
                    <div className="p-6 space-y-3">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                                {services.length} service{services.length !== 1 ? 's' : ''} configured
                            </h2>
                        </div>
                        {services.map((service, index) => (
                            <div
                                key={service.id}
                                className="animate-fade-in-up"
                                style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}
                            >
                                <ServiceNode
                                    service={service}
                                    isSelected={service.id === selectedServiceId}
                                />
                                {/* Dependency arrows */}
                                {service.dependsOn.length > 0 && (
                                    <div className="pl-8 mt-1">
                                        {service.dependsOn.map((dep) => (
                                            <div
                                                key={dep}
                                                className="flex items-center gap-1 text-xs"
                                                style={{ color: 'var(--text-muted)' }}
                                            >
                                                <span style={{ color: 'var(--accent-cyan)' }}>↑</span>
                                                <span>depends on</span>
                                                <span
                                                    className="px-1.5 py-0.5 rounded-md font-mono text-xs"
                                                    style={{
                                                        background: 'rgba(34, 211, 238, 0.1)',
                                                        color: 'var(--accent-cyan)',
                                                    }}
                                                >
                                                    {dep}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function EmptyCanvas() {
    const { setShowTemplateGallery, addService } = useAppStore();
    return (
        <div className="flex-1 flex flex-col items-center justify-center h-full py-20">
            <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 animate-pulse-glow"
                style={{ background: 'rgba(79, 142, 247, 0.1)', border: '1px solid rgba(79, 142, 247, 0.3)' }}
            >
                <Layers size={36} style={{ color: 'var(--accent-blue)' }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Start building your stack
            </h3>
            <p className="text-sm mb-8 max-w-xs text-center" style={{ color: 'var(--text-muted)' }}>
                Click any service from the library on the left to add it to your configuration.
            </p>
            <div className="flex gap-3">
                <button
                    onClick={() => setShowTemplateGallery(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #4f8ef7, #22d3ee)', color: 'white' }}
                >
                    <Layers size={16} />
                    Browse Templates
                </button>
                <button
                    onClick={() => addService('postgresql')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                    }}
                >
                    <Plus size={16} />
                    Quick Add PostgreSQL
                </button>
            </div>
        </div>
    );
}
