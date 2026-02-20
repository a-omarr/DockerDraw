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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function ConfigPanel() {
    const { services, selectedServiceId, selectService, updateService } = useAppStore();
    const service = services.find((s) => s.id === selectedServiceId);
    const template = service ? serviceTemplates.find((t) => t.id === service.templateId) : null;

    if (!service) {
        return (
            <div className="hidden lg:flex flex-col items-center justify-center h-full w-96 border-l bg-muted/10">
                <div className="text-center px-8 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                        <Terminal size={32} className="text-muted-foreground/30" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-foreground">No service selected</p>
                        <p className="text-xs text-muted-foreground mt-1">Select a service on the canvas to configure its properties</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <aside className="w-full lg:w-96 border-l bg-background flex flex-col h-full shrink-0 animate-in slide-in-from-right duration-300">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b h-14 bg-background/50 backdrop-blur-sm sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-lg shrink-0">
                        {template?.Icon ? (
                            <template.Icon size={18} style={{ color: template.color }} />
                        ) : (
                            template?.emoji || '📦'
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-bold leading-none">{service.name}</p>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight mt-1">
                            {template?.name || 'Custom Service'}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => selectService(null)}
                >
                    <X size={16} />
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="w-full grid grid-cols-3 mb-6">
                            <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
                            <TabsTrigger value="env" className="text-xs">Env & Ports</TabsTrigger>
                            <TabsTrigger value="advanced" className="text-xs">Advanced</TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="space-y-8 mt-0">
                            {/* Base Info */}
                            <div className="space-y-4">
                                <SectionHeader title="Base Configuration" />

                                <div className="space-y-2">
                                    <Label htmlFor="service-name" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Service Identifier
                                    </Label>
                                    <Input
                                        id="service-name"
                                        value={service.name}
                                        onChange={(e) => updateService(service.id, { name: e.target.value.replace(/[^a-z0-9_-]/g, '_').toLowerCase() })}
                                        placeholder="e.g. web_app"
                                        className="font-mono text-sm bg-muted/30"
                                    />
                                    <p className="text-[10px] text-muted-foreground italic">Must be alphanumeric with underscores/hyphens.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Docker Image
                                    </Label>
                                    {template && template.availableVersions.length > 0 && (
                                        <Select
                                            value={service.image}
                                            onValueChange={(v) => updateService(service.id, { image: v })}
                                        >
                                            <SelectTrigger className="font-mono text-sm bg-muted/30">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {template.availableVersions.map((v) => (
                                                    <SelectItem key={v} value={v} className="font-mono">{v}</SelectItem>
                                                ))}
                                                <SelectItem value="custom">Custom image...</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}

                                    {(!template?.availableVersions.length || service.image === 'custom') && (
                                        <Input
                                            value={service.image === 'custom' ? '' : service.image}
                                            onChange={(e) => updateService(service.id, { image: e.target.value })}
                                            placeholder="image:tag"
                                            className="font-mono text-sm bg-muted/30 mt-2"
                                        />
                                    )}
                                </div>
                            </div>

                            <Separator className="opacity-50" />

                            {/* Dependencies */}
                            <div className="space-y-4">
                                <SectionHeader title="Dependencies" icon={<Link size={13} />} />
                                <DependsOnSelector service={service} services={services} onUpdate={updateService} />
                            </div>

                            <Separator className="opacity-50" />

                            {/* Command */}
                            <div className="space-y-4">
                                <SectionHeader title="Startup Command" icon={<Terminal size={13} />} />
                                <div className="space-y-2">
                                    <Input
                                        value={service.command || ''}
                                        onChange={(e) => updateService(service.id, { command: e.target.value || undefined })}
                                        placeholder="e.g. npm start -- --watch"
                                        className="font-mono text-sm bg-muted/30"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="env" className="space-y-8 mt-0">
                            {/* Ports */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <SectionHeader title="Port Mappings" icon={<Globe size={13} />} />
                                    <Badge variant="outline" className="text-[10px]">{service.ports.length}</Badge>
                                </div>
                                <div className="space-y-3">
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
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-dashed h-9 bg-background/50"
                                        onClick={() =>
                                            updateService(service.id, {
                                                ports: [...service.ports, { host: 8080, container: 8080 }],
                                            })
                                        }
                                    >
                                        <Plus size={14} className="mr-2" />
                                        Add Port Mapping
                                    </Button>
                                </div>
                            </div>

                            <Separator className="opacity-50" />

                            {/* Env Vars */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <SectionHeader title="Environment Variables" icon={<Terminal size={13} />} />
                                    <Badge variant="outline" className="text-[10px]">{service.environment.length}</Badge>
                                </div>
                                <div className="space-y-3">
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
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-dashed h-9 bg-background/50"
                                        onClick={() =>
                                            updateService(service.id, {
                                                environment: [...service.environment, { key: '', value: '', isSecret: false }],
                                            })
                                        }
                                    >
                                        <Plus size={14} className="mr-2" />
                                        Add Variable
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="advanced" className="space-y-8 mt-0">
                            {/* Volumes */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <SectionHeader title="Storage Volumes" icon={<HardDrive size={13} />} />
                                    <Badge variant="outline" className="text-[10px]">{service.volumes.length}</Badge>
                                </div>
                                <div className="space-y-3">
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
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-dashed h-9 bg-background/50"
                                        onClick={() =>
                                            updateService(service.id, {
                                                volumes: [...service.volumes, { host: './data', container: '/app/data' }],
                                            })
                                        }
                                    >
                                        <Plus size={14} className="mr-2" />
                                        Add Data Volume
                                    </Button>
                                </div>
                            </div>

                            <Separator className="opacity-50" />

                            {/* Networks */}
                            <div className="space-y-4">
                                <SectionHeader title="Networking" icon={<Network size={13} />} />
                                <div className="space-y-3">
                                    {service.networks.map((net, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <Input
                                                value={net}
                                                onChange={(e) => {
                                                    const networks = [...service.networks];
                                                    networks[i] = e.target.value;
                                                    updateService(service.id, { networks });
                                                }}
                                                placeholder="network-name"
                                                className="font-mono text-sm bg-muted/30 h-9"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/5 shrink-0"
                                                onClick={() => {
                                                    const networks = service.networks.filter((_, idx) => idx !== i);
                                                    updateService(service.id, { networks });
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-dashed h-9 bg-background/50"
                                        onClick={() =>
                                            updateService(service.id, { networks: [...service.networks, 'app-network'] })
                                        }
                                    >
                                        <Plus size={14} className="mr-2" />
                                        Add Network
                                    </Button>
                                </div>
                            </div>

                            <Separator className="opacity-50" />

                            {/* Restart Policy */}
                            <div className="space-y-4">
                                <SectionHeader title="Lifecycle Management" icon={<RotateCcw size={13} />} />
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Restart Policy
                                    </Label>
                                    <Select
                                        value={service.restart || 'no'}
                                        onValueChange={(v) => updateService(service.id, { restart: v as Service['restart'] })}
                                    >
                                        <SelectTrigger className="text-sm bg-muted/30">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="no">no (default)</SelectItem>
                                            <SelectItem value="always">always</SelectItem>
                                            <SelectItem value="on-failure">on-failure</SelectItem>
                                            <SelectItem value="unless-stopped">unless-stopped</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </ScrollArea>
        </aside>
    );
}

// ---- Sub-components ----

function SectionHeader({ title, icon }: { title: string; icon?: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 mb-1">
            {icon && <span className="text-muted-foreground/60">{icon}</span>}
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground">
                {title}
            </h3>
        </div>
    );
}

function PortRow({ port, onChange, onRemove }: { port: Port; onChange: (p: Port) => void; onRemove: () => void }) {
    return (
        <div className="flex items-end gap-2 group p-3 rounded-lg border bg-muted/10 relative">
            <div className="grid grid-cols-2 gap-2 flex-1">
                <div className="space-y-1">
                    <Label className="text-[9px] font-bold uppercase text-muted-foreground/70">Host</Label>
                    <Input
                        type="number"
                        value={port.host}
                        onChange={(e) => onChange({ ...port, host: parseInt(e.target.value) || 0 })}
                        className="h-8 font-mono text-xs"
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-[9px] font-bold uppercase text-muted-foreground/70">Container</Label>
                    <Input
                        type="number"
                        value={port.container}
                        onChange={(e) => onChange({ ...port, container: parseInt(e.target.value) || 0 })}
                        className="h-8 font-mono text-xs"
                    />
                </div>
            </div>
            <div className="space-y-1">
                <Label className="text-[9px] font-bold uppercase text-muted-foreground/70">Type</Label>
                <Select
                    value={port.protocol || 'tcp'}
                    onValueChange={(v) => onChange({ ...port, protocol: v as 'tcp' | 'udp' })}
                >
                    <SelectTrigger className="h-8 w-[64px] text-[10px] font-mono">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="tcp">TCP</SelectItem>
                        <SelectItem value="udp">UDP</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onRemove}
            >
                <Trash2 size={13} />
            </Button>
        </div>
    );
}

function EnvVarRow({ envVar, onChange, onRemove }: { envVar: EnvVar; onChange: (e: EnvVar) => void; onRemove: () => void }) {
    const [showValue, setShowValue] = useState(!envVar.isSecret);

    return (
        <div className="flex flex-col gap-2 p-3 rounded-lg border bg-muted/10 group relative">
            <div className="flex items-center justify-between gap-2">
                <Input
                    value={envVar.key}
                    onChange={(e) => onChange({ ...envVar, key: e.target.value })}
                    placeholder="VAR_NAME"
                    className="h-8 flex-1 font-mono text-xs uppercase"
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-8 w-8",
                        envVar.isSecret ? "text-primary" : "text-muted-foreground"
                    )}
                    onClick={() => onChange({ ...envVar, isSecret: !envVar.isSecret })}
                    title={envVar.isSecret ? "Mark as public" : "Mark as secret"}
                >
                    {envVar.isSecret ? <EyeOff size={13} /> : <Eye size={13} />}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={onRemove}
                >
                    <Trash2 size={13} />
                </Button>
            </div>
            <div className="relative">
                <Input
                    value={envVar.value}
                    onChange={(e) => onChange({ ...envVar, value: e.target.value })}
                    type={envVar.isSecret && !showValue ? 'password' : 'text'}
                    placeholder="value"
                    className="h-8 font-mono text-xs pr-8"
                />
                {envVar.isSecret && (
                    <button
                        onClick={() => setShowValue((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        {showValue ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                )}
            </div>
        </div>
    );
}

function VolumeRow({ volume, onChange, onRemove }: { volume: Volume; onChange: (v: Volume) => void; onRemove: () => void }) {
    return (
        <div className="flex flex-col gap-2 p-3 rounded-lg border bg-muted/10 group relative">
            <div className="flex items-center justify-between mb-1">
                <Label className="text-[9px] font-bold uppercase text-muted-foreground/70">Mapping</Label>
                <div className="flex items-center gap-2">
                    <Select
                        value={volume.mode || 'rw'}
                        onValueChange={(v) => onChange({ ...volume, mode: v as 'ro' | 'rw' })}
                    >
                        <SelectTrigger className="h-5 w-16 text-[9px] font-bold py-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="text-[9px]">
                            <SelectItem value="rw">RW</SelectItem>
                            <SelectItem value="ro">RO</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={onRemove}
                    >
                        <Trash2 size={12} />
                    </Button>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Input
                    value={volume.host}
                    onChange={(e) => onChange({ ...volume, host: e.target.value })}
                    placeholder="Host (local) path"
                    className="h-8 font-mono text-xs flex-1"
                />
                <span className="text-muted-foreground/40 font-mono text-xs">→</span>
                <Input
                    value={volume.container}
                    onChange={(e) => onChange({ ...volume, container: e.target.value })}
                    placeholder="Container path"
                    className="h-8 font-mono text-xs flex-1"
                />
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
            <div className="p-8 rounded-xl border border-dashed border-muted-foreground/20 bg-muted/5 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Link size={18} className="text-muted-foreground/40" />
                </div>
                <div className="space-y-1">
                    <p className="text-[11px] font-bold text-foreground/80 uppercase tracking-tight">No other services</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[180px]">
                        Add more services to the canvas to configure inter-service dependencies.
                    </p>
                </div>
            </div>
        );
    }

    const toggleDep = (id: string) => {
        const current = service.dependsOn;
        if (current.includes(id)) {
            onUpdate(service.id, { dependsOn: current.filter((d) => d !== id) });
        } else {
            onUpdate(service.id, { dependsOn: [...current, id] });
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {otherServices.map((s) => {
                const isSelected = service.dependsOn.includes(s.id);
                const t = serviceTemplates.find((t) => t.id === s.templateId);
                return (
                    <Button
                        key={s.id}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDep(s.id)}
                        className={cn(
                            "h-8 gap-2 px-3 text-xs font-medium rounded-full",
                            !isSelected && "bg-muted/10 hover:bg-muted/30"
                        )}
                    >
                        <span className="flex items-center justify-center shrink-0">
                            {t?.Icon ? (
                                <t.Icon size={14} style={{ color: t.color }} />
                            ) : (
                                <span className="text-sm scale-110">{t?.emoji || '📦'}</span>
                            )}
                        </span>
                        {s.name}
                    </Button>
                );
            })}
        </div>
    );
}
