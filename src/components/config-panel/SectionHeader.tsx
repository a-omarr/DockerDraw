import React from 'react';
import { Info } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '../ui/tooltip';

interface SectionHeaderProps {
    title: string;
    icon?: React.ReactNode;
    tooltip?: string;
}

export function SectionHeader({ title, icon, tooltip }: SectionHeaderProps) {
    return (
        <div className="flex items-center gap-1.5 mb-1">
            {icon && <span className="text-muted-foreground/60">{icon}</span>}
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground">
                {title}
            </h3>
            {tooltip && (
                <Tooltip>
                    <TooltipTrigger type="button" tabIndex={-1} className="cursor-default">
                        <Info className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-foreground transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[250px] text-xs font-normal normal-case tracking-normal">
                        <p>{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            )}
        </div>
    );
}
