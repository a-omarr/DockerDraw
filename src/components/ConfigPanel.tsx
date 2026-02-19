import { useState } from 'react';
import {
    X,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    Network,
    HardDrive,
    Globe,
    Link,
    Terminal,
    RotateCcw,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Service, Port, Volume, EnvVar } from '../types';
import { serviceTemplates } from '../data/serviceTemplates';

export function ConfigPanel() {
    const { services, selectedServiceId, selectService, updateService } = useAppStore();
    const service = services.find((s) => s.id === selectedServiceId);
    const template = service ? serviceTemplates.find((t) => t.id === service.templateId) : null;

    if (!service) {
        return (
            <div
                className="hidden lg:flex flex-col items-center justify-center h-full"
                style={{ width: 360, minWidth: 360, background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-color)' }}
            >
                <div className="text-center px-6">
                    <div className="text-4xl mb-4">⚙️</div>
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No service selected</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Click a service on the canvas to configure it</p>
                </div>
            </div>
        );
    }

    return (
        <aside
            className="flex flex-col h-full overflow-y-auto animate-slide-in-right"
            style={{ width: 360, minWidth: 360, background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-color)' }}
        >
            {/* Panel header */}
            <div
                className="flex items-center justify-between px-4 py-3 sticky top-0 z-10"
                style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}
            >
                <div className="flex items-center gap-2">
                    <span className="text-xl">{template?.emoji || '📦'}</span>
                    <div>
                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Configure Service</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{template?.name || service.templateId}</p>
                    </div>
                </div>
                <button
                    onClick={() => selectService(null)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                    <X size={15} />
                </button>
            </div>

            <div className="flex-1 px-4 py-4 space-y-5">
                {/* Name */}
                <Section title="Service Name">
                    <Input
                        value={service.name}
                        onChange={(v) => updateService(service.id, { name: v.replace(/[^a-z0-9_-]/g, '_').toLowerCase() })}
                        placeholder="service_name"
                        mono
                    />
                </Section>

                {/* Image */}
                <Section title="Image & Version">
                    <div className="space-y-2">
                        {template && template.availableVersions.length > 0 ? (
                            <select
                                value={service.image}
                                onChange={(e) => updateService(service.id, { image: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl text-sm custom-select outline-none transition-colors"
                                style={{
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'monospace',
                                }}
                            >
                                {template.availableVersions.map((v) => (
                                    <option key={v} value={v}>{v}</option>
                                ))}
                                <option value="custom">Custom image...</option>
                            </select>
                        ) : null}
                        {(!template?.availableVersions.length || service.image === 'custom') && (
                            <Input
                                value={service.image}
                                onChange={(v) => updateService(service.id, { image: v })}
                                placeholder="image:tag"
                                mono
                            />
                        )}
                    </div>
                </Section>

                {/* Ports */}
                <Section title="Port Mappings" icon={<Globe size={13} />}>
                    <div className="space-y-2">
                        {service.ports.map((port, i) => (
                            <PortRow
                                key={i}
                                port={port}
                                onChange={(updated) => {
                                    const ports = [...service.ports];
                                    ports[i] = updated;
                                    updateService(service.id, { ports });
                                }}
                                onRemove={() => {
                                    const ports = service.ports.filter((_, idx) => idx !== i);
                                    updateService(service.id, { ports });
                                }}
                            />
                        ))}
                        <AddButton
                            onClick={() =>
                                updateService(service.id, {
                                    ports: [...service.ports, { host: 8080, container: 8080 }],
                                })
                            }
                            label="Add Port"
                        />
                    </div>
                </Section>

                {/* Environment Variables */}
                <Section title="Environment Variables" icon={<Terminal size={13} />}>
                    <div className="space-y-2">
                        {service.environment.map((env, i) => (
                            <EnvVarRow
                                key={i}
                                envVar={env}
                                onChange={(updated) => {
                                    const environment = [...service.environment];
                                    environment[i] = updated;
                                    updateService(service.id, { environment });
                                }}
                                onRemove={() => {
                                    const environment = service.environment.filter((_, idx) => idx !== i);
                                    updateService(service.id, { environment });
                                }}
                            />
                        ))}
                        <AddButton
                            onClick={() =>
                                updateService(service.id, {
                                    environment: [...service.environment, { key: '', value: '', isSecret: false }],
                                })
                            }
                            label="Add Variable"
                        />
                    </div>
                </Section>

                {/* Volumes */}
                <Section title="Volumes" icon={<HardDrive size={13} />}>
                    <div className="space-y-2">
                        {service.volumes.map((vol, i) => (
                            <VolumeRow
                                key={i}
                                volume={vol}
                                onChange={(updated) => {
                                    const volumes = [...service.volumes];
                                    volumes[i] = updated;
                                    updateService(service.id, { volumes });
                                }}
                                onRemove={() => {
                                    const volumes = service.volumes.filter((_, idx) => idx !== i);
                                    updateService(service.id, { volumes });
                                }}
                            />
                        ))}
                        <AddButton
                            onClick={() =>
                                updateService(service.id, {
                                    volumes: [...service.volumes, { host: './', container: '/app' }],
                                })
                            }
                            label="Add Volume"
                        />
                    </div>
                </Section>

                {/* Networks */}
                <Section title="Networks" icon={<Network size={13} />}>
                    <div className="space-y-2">
                        {service.networks.map((net, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <Input
                                    value={net}
                                    onChange={(v) => {
                                        const networks = [...service.networks];
                                        networks[i] = v;
                                        updateService(service.id, { networks });
                                    }}
                                    placeholder="network_name"
                                    mono
                                />
                                <button
                                    onClick={() => {
                                        const networks = service.networks.filter((_, idx) => idx !== i);
                                        updateService(service.id, { networks });
                                    }}
                                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                                    style={{ color: 'var(--text-muted)' }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLElement).style.color = '#f87171';
                                        (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                                    }}
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        ))}
                        <AddButton
                            onClick={() =>
                                updateService(service.id, { networks: [...service.networks, 'app_network'] })
                            }
                            label="Add Network"
                        />
                    </div>
                </Section>

                {/* Depends On */}
                <Section title="Depends On" icon={<Link size={13} />}>
                    <DependsOnSelector service={service} services={services} onUpdate={updateService} />
                </Section>

                {/* Restart Policy */}
                <Section title="Restart Policy" icon={<RotateCcw size={13} />}>
                    <select
                        value={service.restart || 'no'}
                        onChange={(e) => updateService(service.id, { restart: e.target.value as Service['restart'] })}
                        className="w-full px-3 py-2.5 rounded-xl text-sm custom-select outline-none"
                        style={{
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                        }}
                    >
                        <option value="no">no (default)</option>
                        <option value="always">always</option>
                        <option value="on-failure">on-failure</option>
                        <option value="unless-stopped">unless-stopped</option>
                    </select>
                </Section>

                {/* Command */}
                <Section title="Command (optional)">
                    <Input
                        value={service.command || ''}
                        onChange={(v) => updateService(service.id, { command: v || undefined })}
                        placeholder="e.g. npm start"
                        mono
                    />
                </Section>
            </div>
        </aside>
    );
}

// ---- Sub-components ----

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div>
            <div className="flex items-center gap-1.5 mb-2">
                {icon && <span style={{ color: 'var(--text-muted)' }}>{icon}</span>}
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {title}
                </h3>
            </div>
            {children}
        </div>
    );
}

function Input({
    value,
    onChange,
    placeholder,
    mono,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    mono?: boolean;
}) {
    return (
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontFamily: mono ? 'monospace' : 'inherit',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
        />
    );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:opacity-80 border border-dashed"
            style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-muted)',
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-blue)';
                (e.currentTarget as HTMLElement).style.color = 'var(--accent-blue)';
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
            }}
        >
            <Plus size={12} />
            {label}
        </button>
    );
}

function PortRow({ port, onChange, onRemove }: { port: Port; onChange: (p: Port) => void; onRemove: () => void }) {
    return (
        <div className="flex items-center gap-1.5">
            <div className="flex-1">
                <input
                    type="number"
                    value={port.host}
                    onChange={(e) => onChange({ ...port, host: parseInt(e.target.value) || 0 })}
                    placeholder="Host"
                    className="w-full px-2.5 py-2 rounded-lg text-xs outline-none"
                    style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontFamily: 'monospace',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                />
            </div>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>:</span>
            <div className="flex-1">
                <input
                    type="number"
                    value={port.container}
                    onChange={(e) => onChange({ ...port, container: parseInt(e.target.value) || 0 })}
                    placeholder="Container"
                    className="w-full px-2.5 py-2 rounded-lg text-xs outline-none"
                    style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontFamily: 'monospace',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                />
            </div>
            <select
                value={port.protocol || 'tcp'}
                onChange={(e) => onChange({ ...port, protocol: e.target.value as 'tcp' | 'udp' })}
                className="px-2 py-2 rounded-lg text-xs outline-none custom-select"
                style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    width: 52,
                }}
            >
                <option value="tcp">tcp</option>
                <option value="udp">udp</option>
            </select>
            <button
                onClick={onRemove}
                className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.1)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
                <Trash2 size={12} />
            </button>
        </div>
    );
}

function EnvVarRow({ envVar, onChange, onRemove }: { envVar: EnvVar; onChange: (e: EnvVar) => void; onRemove: () => void }) {
    const [showValue, setShowValue] = useState(!envVar.isSecret);

    return (
        <div className="flex items-center gap-1.5">
            <input
                value={envVar.key}
                onChange={(e) => onChange({ ...envVar, key: e.target.value })}
                placeholder="KEY"
                className="flex-1 px-2.5 py-2 rounded-lg text-xs outline-none"
                style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--accent-cyan)',
                    fontFamily: 'monospace',
                    minWidth: 0,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
                onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    const isSecret = envVar.key.toLowerCase().includes('password') || envVar.key.toLowerCase().includes('secret') || envVar.key.toLowerCase().includes('key');
                    if (isSecret) onChange({ ...envVar, key: e.target.value, isSecret: true });
                }}
            />
            <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>=</span>
            <div className="flex-1 relative" style={{ minWidth: 0 }}>
                <input
                    value={envVar.value}
                    onChange={(e) => onChange({ ...envVar, value: e.target.value })}
                    type={envVar.isSecret && !showValue ? 'password' : 'text'}
                    placeholder="value"
                    className="w-full px-2.5 py-2 rounded-lg text-xs outline-none pr-7"
                    style={{
                        background: 'var(--bg-tertiary)',
                        border: `1px solid ${envVar.isSecret ? 'rgba(167,139,250,0.3)' : 'var(--border-color)'}`,
                        color: 'var(--text-primary)',
                        fontFamily: 'monospace',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = envVar.isSecret ? 'rgba(167,139,250,0.3)' : 'var(--border-color)')}
                />
                {envVar.isSecret && (
                    <button
                        onClick={() => setShowValue((v) => !v)}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        {showValue ? <EyeOff size={11} /> : <Eye size={11} />}
                    </button>
                )}
            </div>
            <button
                onClick={() => onChange({ ...envVar, isSecret: !envVar.isSecret })}
                title={envVar.isSecret ? 'Mark as plain' : 'Mark as secret'}
                className="flex-shrink-0 text-xs px-1.5 py-1.5 rounded-lg transition-colors"
                style={{
                    color: envVar.isSecret ? 'var(--accent-purple)' : 'var(--text-muted)',
                    background: envVar.isSecret ? 'rgba(167,139,250,0.1)' : 'transparent',
                }}
            >
                {envVar.isSecret ? <EyeOff size={11} /> : <Eye size={11} />}
            </button>
            <button
                onClick={onRemove}
                className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
            >
                <Trash2 size={11} />
            </button>
        </div>
    );
}

function VolumeRow({ volume, onChange, onRemove }: { volume: Volume; onChange: (v: Volume) => void; onRemove: () => void }) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
                <input
                    value={volume.host}
                    onChange={(e) => onChange({ ...volume, host: e.target.value })}
                    placeholder="Host path"
                    className="flex-1 px-2.5 py-2 rounded-lg text-xs outline-none"
                    style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontFamily: 'monospace',
                        minWidth: 0,
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                />
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>→</span>
                <input
                    value={volume.container}
                    onChange={(e) => onChange({ ...volume, container: e.target.value })}
                    placeholder="Container path"
                    className="flex-1 px-2.5 py-2 rounded-lg text-xs outline-none"
                    style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontFamily: 'monospace',
                        minWidth: 0,
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                />
                <select
                    value={volume.mode || 'rw'}
                    onChange={(e) => onChange({ ...volume, mode: e.target.value as 'ro' | 'rw' })}
                    className="px-1.5 py-2 rounded-lg text-xs outline-none custom-select"
                    style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-muted)',
                        width: 44,
                    }}
                >
                    <option value="rw">rw</option>
                    <option value="ro">ro</option>
                </select>
                <button
                    onClick={onRemove}
                    className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.1)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                    <Trash2 size={12} />
                </button>
            </div>
        </div>
    );
}

function DependsOnSelector({
    service,
    services,
    onUpdate,
}: {
    service: Service;
    services: Service[];
    onUpdate: (id: string, updates: Partial<Service>) => void;
}) {
    const otherServices = services.filter((s) => s.id !== service.id);

    if (otherServices.length === 0) {
        return (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Add more services to configure dependencies.
            </p>
        );
    }

    const toggleDep = (name: string) => {
        const current = service.dependsOn;
        if (current.includes(name)) {
            onUpdate(service.id, { dependsOn: current.filter((d) => d !== name) });
        } else {
            onUpdate(service.id, { dependsOn: [...current, name] });
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {otherServices.map((s) => {
                const isSelected = service.dependsOn.includes(s.name);
                const t = serviceTemplates.find((t) => t.id === s.templateId);
                return (
                    <button
                        key={s.id}
                        onClick={() => toggleDep(s.name)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                            background: isSelected ? 'rgba(79, 142, 247, 0.15)' : 'var(--bg-tertiary)',
                            border: isSelected ? '1px solid rgba(79, 142, 247, 0.5)' : '1px solid var(--border-color)',
                            color: isSelected ? 'var(--accent-blue)' : 'var(--text-secondary)',
                        }}
                    >
                        <span>{t?.emoji || '📦'}</span>
                        {s.name}
                    </button>
                );
            })}
        </div>
    );
}
