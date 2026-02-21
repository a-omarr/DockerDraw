import { HardDrive, Network, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../ui/select';
import { Separator } from '../../ui/separator';
import { Badge } from '../../ui/badge';
import { SectionHeader } from '../SectionHeader';
import { VolumeRow } from '../rows/VolumeRow';
import type { Service } from '../../../types';

interface AdvancedTabProps {
    service: Service;
    updateService: (id: string, updates: Partial<Service>) => void;
}

export function AdvancedTab({
    service,
    updateService,
}: AdvancedTabProps) {
    return (
        <div className="space-y-8 mt-0 text-left">
            {/* Volumes */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <SectionHeader
                        title="Storage Volumes"
                        icon={<HardDrive size={13} />}
                        tooltip="Mount host paths or named volumes into the container for persistent storage."
                    />
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
                <SectionHeader
                    title="Networking"
                    icon={<Network size={13} />}
                    tooltip="Connect the container to Docker networks for inter-container communication."
                />
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
                <SectionHeader
                    title="Lifecycle Management"
                    icon={<RotateCcw size={13} />}
                    tooltip="Configure the restart policy for the container in case of failures."
                />
                <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-left block">
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
        </div>
    );
}
