import { AlertTriangle, ChevronRight } from 'lucide-react';
import type { PortConflict } from '../types';
import { useAppStore } from '../store/useAppStore';

interface Props {
    conflict: PortConflict;
}

export function PortConflictBanner({ conflict }: Props) {
    const { services, updateService } = useAppStore();

    const applySuggestion = (suggestion: number) => {
        // Apply the first conflicting service with the new port
        const firstServiceId = conflict.serviceIds[1];
        const service = services.find((s) => s.id === firstServiceId);
        if (!service) return;
        const updatedPorts = service.ports.map((p) =>
            p.host === conflict.port ? { ...p, host: suggestion } : p
        );
        updateService(firstServiceId, { ports: updatedPorts });
    };

    return (
        <div
            className="flex items-start gap-3 px-4 py-3 rounded-xl animate-fade-in"
            style={{
                background: 'rgba(251, 146, 60, 0.1)',
                border: '1px solid rgba(251, 146, 60, 0.4)',
            }}
        >
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#fb923c' }} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: '#fb923c' }}>
                    Port Conflict: {conflict.port}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Used by: {conflict.serviceNames.join(', ')}
                </p>
                {conflict.suggestions.length > 0 && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Use instead:
                        </span>
                        {conflict.suggestions.map((s) => (
                            <button
                                key={s}
                                onClick={() => applySuggestion(s)}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                                style={{
                                    background: 'rgba(251, 146, 60, 0.2)',
                                    color: '#fb923c',
                                    border: '1px solid rgba(251, 146, 60, 0.4)',
                                }}
                            >
                                {s}
                                <ChevronRight size={10} />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
