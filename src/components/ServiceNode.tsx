import { Trash2, Copy, Edit3, Network, HardDrive, Globe } from 'lucide-react';
import type { Service } from '../types';
import { useAppStore } from '../store/useAppStore';
import { serviceTemplates } from '../data/serviceTemplates';

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
        <div
            onClick={() => selectService(isSelected ? null : service.id)}
            className="rounded-2xl p-4 cursor-pointer transition-all duration-200"
            style={{
                background: isSelected
                    ? `linear-gradient(135deg, ${color}18 0%, var(--bg-card) 100%)`
                    : 'var(--bg-card)',
                border: isSelected
                    ? `1px solid ${color}80`
                    : '1px solid var(--border-color)',
                boxShadow: isSelected
                    ? `0 0 20px ${color}25, 0 4px 20px rgba(0,0,0,0.3)`
                    : '0 2px 8px rgba(0,0,0,0.2)',
            }}
        >
            <div className="flex items-center gap-3">
                {/* Icon */}
                <div
                    className="flex items-center justify-center w-11 h-11 rounded-xl text-xl flex-shrink-0"
                    style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                >
                    {emoji}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                            {service.name}
                        </span>
                        <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: `${color}20`, color }}
                        >
                            {service.image.split(':')[1] || 'latest'}
                        </span>
                    </div>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        {service.image}
                    </p>

                    {/* Badges row */}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {service.ports.length > 0 && (
                            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                                <Globe size={10} />
                                {service.ports.map((p) => `${p.host}:${p.container}`).join(', ')}
                            </div>
                        )}
                        {service.volumes.length > 0 && (
                            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                                <HardDrive size={10} />
                                {service.volumes.length} vol
                            </div>
                        )}
                        {service.networks.length > 0 && (
                            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                                <Network size={10} />
                                {service.networks[0]}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <ActionBtn
                        icon={<Edit3 size={13} />}
                        label="Edit"
                        color="var(--accent-blue)"
                        onClick={(e) => {
                            e.stopPropagation();
                            selectService(service.id);
                        }}
                    />
                    <ActionBtn
                        icon={<Copy size={13} />}
                        label="Duplicate"
                        color="var(--accent-green)"
                        onClick={(e) => {
                            e.stopPropagation();
                            duplicateService(service.id);
                        }}
                    />
                    <ActionBtn
                        icon={<Trash2 size={13} />}
                        label="Remove"
                        color="#f87171"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeService(service.id);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

function ActionBtn({
    icon,
    label,
    color,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    color: string;
    onClick: (e: React.MouseEvent) => void;
}) {
    return (
        <button
            onClick={onClick}
            title={label}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:scale-110"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = color;
                (e.currentTarget as HTMLElement).style.background = `${color}18`;
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
        >
            {icon}
        </button>
    );
}
