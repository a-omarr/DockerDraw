import { Globe, Terminal, Plus } from 'lucide-react';
import { Button } from '../../ui/button';
import { Separator } from '../../ui/separator';
import { Badge } from '../../ui/badge';
import { SectionHeader } from '../SectionHeader';
import { PortRow } from '../rows/PortRow';
import { EnvVarRow } from '../rows/EnvVarRow';
import type { Service } from '../../../types';

interface EnvPortsTabProps {
    service: Service;
    updateService: (id: string, updates: Partial<Service>) => void;
}

export function EnvPortsTab({
    service,
    updateService,
}: EnvPortsTabProps) {
    return (
        <div className="space-y-8 mt-0 text-left">
            {/* Ports */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <SectionHeader
                        title="Port Mappings"
                        icon={<Globe size={13} />}
                        tooltip="Map host machine ports to container ports to make the service accessible externally."
                    />
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
                    <SectionHeader
                        title="Environment Variables"
                        icon={<Terminal size={13} />}
                        tooltip="Set environment variables used by the container at runtime."
                    />
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
        </div>
    );
}
