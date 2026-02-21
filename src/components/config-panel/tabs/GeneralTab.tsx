import { Terminal, Hammer, Link, Info, Plus, Trash2 } from 'lucide-react';
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '../../ui/tooltip';
import { SectionHeader } from '../SectionHeader';
import { DependsOnSelector } from '../DependsOnSelector';
import type { Service, ServiceTemplate } from '../../../types';

interface GeneralTabProps {
    service: Service;
    services: Service[];
    template: ServiceTemplate | null;
    updateService: (id: string, updates: Partial<Service>) => void;
}

export function GeneralTab({
    service,
    services,
    template,
    updateService,
}: GeneralTabProps) {
    return (
        <div className="space-y-8 mt-0 text-left">
            {/* Base Info */}
            <div className="space-y-4">
                <SectionHeader title="Base Configuration" />

                <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                        <Label htmlFor="service-name" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-left block">
                            Service Identifier
                        </Label>
                        <Tooltip>
                            <TooltipTrigger type="button" tabIndex={-1} className="cursor-default">
                                <Info className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[250px] text-xs font-normal normal-case tracking-normal">
                                <p>The unique name used to identify this service in the Docker network. Must be alphanumeric with underscores/hyphens.</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <Input
                        id="service-name"
                        value={service.name}
                        onChange={(e) => updateService(service.id, { name: e.target.value.replace(/[^a-z0-9_-]/g, '_').toLowerCase() })}
                        placeholder="e.g. web_app"
                        className="font-mono text-sm bg-muted/30"
                    />
                    <p className="text-[10px] text-muted-foreground italic">Must be alphanumeric with underscores/hyphens.</p>
                </div>

                <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-left block">
                                Deployment Source
                            </Label>
                            <Tooltip>
                                <TooltipTrigger type="button" tabIndex={-1} className="cursor-default">
                                    <Info className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-foreground transition-colors" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[250px] text-xs font-normal normal-case tracking-normal">
                                    <p>Choose how to run this service — either pull a pre-built image from a registry, or build it locally from a Dockerfile in your project.</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <Select
                            value={service.buildContext ? 'build' : 'image'}
                            onValueChange={(v: string) => {
                                if (v === 'build') {
                                    updateService(service.id, {
                                        buildContext: template?.defaultBuildContext || './app',
                                        image: 'custom',
                                        dockerfile: template?.defaultDockerfile || 'Dockerfile',
                                        buildTarget: template?.defaultBuildTarget || undefined,
                                        buildArgs: template?.defaultBuildArgs ? { ...template.defaultBuildArgs } : undefined,
                                    });
                                } else {
                                    updateService(service.id, {
                                        buildContext: undefined,
                                        image: template?.defaultImage || 'ubuntu:latest',
                                        dockerfile: undefined,
                                        buildTarget: undefined,
                                        buildArgs: undefined,
                                    });
                                }
                            }}
                        >
                            <SelectTrigger className="text-sm bg-muted/30">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="image">Pre-built Image</SelectItem>
                                <SelectItem value="build">Build from Source</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {!service.buildContext ? (
                        <div className="space-y-2 pt-2 animate-in fade-in duration-200">
                            <div className="flex items-center gap-1.5">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-left block">
                                    Docker Image
                                </Label>
                                <Tooltip>
                                    <TooltipTrigger type="button" tabIndex={-1} className="cursor-default">
                                        <Info className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-foreground transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[250px] text-xs font-normal normal-case tracking-normal">
                                        <p>The Docker container image and tag used to run this service (e.g., node:18-alpine, postgres:15).</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
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
                    ) : (
                        <div className="space-y-2 pt-2 animate-in fade-in duration-200">
                            <div className="flex items-center gap-1.5">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-left block">
                                    Build Context
                                </Label>
                                <Tooltip>
                                    <TooltipTrigger type="button" tabIndex={-1} className="cursor-default">
                                        <Info className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-foreground transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[250px] text-xs font-normal normal-case tracking-normal">
                                        <p>Path to a directory containing a Dockerfile. Usually relative to the docker-compose file (e.g., ./frontend).</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <Input
                                value={service.buildContext}
                                onChange={(e) => updateService(service.id, { buildContext: e.target.value })}
                                placeholder="e.g. ./frontend"
                                className="font-mono text-sm bg-muted/30"
                            />

                            {/* Dockerfile */}
                            <div className="space-y-2 pt-3">
                                <div className="flex items-center gap-1.5">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-left block">
                                        Dockerfile
                                    </Label>
                                    <Tooltip>
                                        <TooltipTrigger type="button" tabIndex={-1} className="cursor-default">
                                            <Info className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-foreground transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[250px] text-xs font-normal normal-case tracking-normal">
                                            <p>Name of the Dockerfile inside the build context. Defaults to "Dockerfile" if left empty.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Input
                                    value={service.dockerfile || ''}
                                    onChange={(e) => updateService(service.id, { dockerfile: e.target.value || undefined })}
                                    placeholder="Dockerfile"
                                    className="font-mono text-sm bg-muted/30"
                                />
                            </div>

                            {/* Target Stage */}
                            <div className="space-y-2 pt-3">
                                <div className="flex items-center gap-1.5">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-left block">
                                        Target Stage
                                    </Label>
                                    <Tooltip>
                                        <TooltipTrigger type="button" tabIndex={-1} className="cursor-default">
                                            <Info className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-foreground transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[250px] text-xs font-normal normal-case tracking-normal">
                                            <p>For multi-stage Dockerfiles, specify which stage to build (e.g., "production" or "development").</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Input
                                    value={service.buildTarget || ''}
                                    onChange={(e) => updateService(service.id, { buildTarget: e.target.value || undefined })}
                                    placeholder="e.g. production"
                                    className="font-mono text-sm bg-muted/30"
                                />
                            </div>

                            {/* Build Args */}
                            <div className="space-y-3 pt-3">
                                <div className="flex items-center justify-between">
                                    <SectionHeader
                                        title="Build Arguments"
                                        icon={<Hammer size={13} />}
                                        tooltip="Variables passed at build time via --build-arg. These are baked into the image."
                                    />
                                    <Badge variant="outline" className="text-[10px]">{Object.keys(service.buildArgs || {}).length}</Badge>
                                </div>
                                <div className="space-y-2">
                                    {Object.entries(service.buildArgs || {}).map(([key, value]) => (
                                        <div key={key} className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/10 group">
                                            <Input
                                                value={key}
                                                onChange={(e) => {
                                                    const args = { ...service.buildArgs };
                                                    const val = args[key];
                                                    delete args[key];
                                                    args[e.target.value] = val;
                                                    updateService(service.id, { buildArgs: args });
                                                }}
                                                placeholder="ARG_NAME"
                                                className="h-8 font-mono text-xs flex-1 uppercase"
                                            />
                                            <span className="text-muted-foreground/40 font-mono text-xs">=</span>
                                            <Input
                                                value={value}
                                                onChange={(e) => {
                                                    const args = { ...service.buildArgs };
                                                    args[key] = e.target.value;
                                                    updateService(service.id, { buildArgs: args });
                                                }}
                                                placeholder="value"
                                                className="h-8 font-mono text-xs flex-1"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                                onClick={() => {
                                                    const args = { ...service.buildArgs };
                                                    delete args[key];
                                                    updateService(service.id, { buildArgs: Object.keys(args).length > 0 ? args : undefined });
                                                }}
                                            >
                                                <Trash2 size={13} />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-dashed h-9 bg-background/50"
                                        onClick={() => {
                                            const args = { ...(service.buildArgs || {}), '': '' };
                                            updateService(service.id, { buildArgs: args });
                                        }}
                                    >
                                        <Plus size={14} className="mr-2" />
                                        Add Build Arg
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Separator className="opacity-50" />

            {/* Dependencies */}
            <div className="space-y-4">
                <SectionHeader
                    title="Dependencies"
                    icon={<Link size={13} />}
                    tooltip="Defines startup order. These services will be started before this container."
                />
                <DependsOnSelector service={service} services={services} onUpdate={updateService} />
            </div>

            <Separator className="opacity-50" />

            {/* Command */}
            <div className="space-y-4">
                <SectionHeader
                    title="Startup Command"
                    icon={<Terminal size={13} />}
                    tooltip="Override the default command specified in the image. e.g. npm run dev"
                />
                <div className="space-y-2">
                    <Input
                        value={service.command || ''}
                        onChange={(e) => updateService(service.id, { command: e.target.value || undefined })}
                        placeholder="e.g. npm start -- --watch"
                        className="font-mono text-sm bg-muted/30"
                    />
                </div>
            </div>
        </div>
    );
}
