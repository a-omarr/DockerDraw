import { Globe, HardDrive, Network } from 'lucide-react';
import type { Service } from '../../types';

interface ServiceNodeBadgesProps {
    service: Service;
}

export function ServiceNodeBadges({ service }: ServiceNodeBadgesProps) {
    return (
        <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-3 flex-wrap">
            {service.ports.length > 0 && (
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-medium text-muted-foreground bg-slate-100/50 px-1.5 sm:px-2 py-0.5 rounded-full border border-slate-200/50">
                    <Globe size={10} className="text-blue-500 shrink-0" />
                    <span className="truncate max-w-[80px] sm:max-w-none">
                        {service.ports.map((p) => `${p.host}:${p.container}`).join(', ')}
                    </span>
                </div>
            )}
            {service.volumes.length > 0 && (
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-medium text-muted-foreground bg-slate-100/50 px-1.5 sm:px-2 py-0.5 rounded-full border border-slate-200/50">
                    <HardDrive size={10} className="text-amber-500 shrink-0" />
                    {service.volumes.length} vol
                </div>
            )}
            {service.networks.length > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground bg-slate-100/50 px-2 py-0.5 rounded-full border border-slate-200/50">
                    <Network size={11} className="text-emerald-500" />
                    {service.networks[0]}
                </div>
            )}
        </div>
    );
}
