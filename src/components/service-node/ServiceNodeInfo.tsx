import { FolderOpen } from 'lucide-react';
import { Badge } from '../ui/badge';
import type { Service } from '../../types';

interface ServiceNodeInfoProps {
    service: Service;
}

export function ServiceNodeInfo({ service }: ServiceNodeInfoProps) {
    return (
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-xs sm:text-sm tracking-tight text-foreground truncate">
                    {service.name}
                </span>
                <Badge variant="outline" className="font-mono text-[10px] h-4 px-1.5 bg-background hidden sm:inline-flex">
                    {service.buildContext ? 'build' : (service.image.split(':')[1] || 'latest')}
                </Badge>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate font-mono opacity-70">
                {service.buildContext ? (
                    <span className="flex items-center gap-1">
                        <FolderOpen size={10} className="shrink-0" />
                        build {service.buildContext}
                    </span>
                ) : (
                    service.image
                )}
            </p>
        </div>
    );
}
