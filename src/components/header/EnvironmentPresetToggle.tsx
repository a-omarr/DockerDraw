import { ChevronDown } from 'lucide-react';
import { SiDocker, SiVite } from 'react-icons/si';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { EnvironmentPreset } from '../../types';

interface EnvironmentPresetToggleProps {
    value: EnvironmentPreset;
    onChange: (value: EnvironmentPreset) => void;
}

export function EnvironmentPresetToggle({ value, onChange }: EnvironmentPresetToggleProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={`h-9 gap-2 font-medium text-sm ${value === 'development'
                            ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800'
                            : 'border-orange-200 bg-orange-50/50 text-orange-700 hover:bg-orange-50 hover:text-orange-800'
                        }`}
                >
                    {value === 'development' ? (
                        <SiVite size={14} className="text-emerald-600" />
                    ) : (
                        <SiDocker size={14} className="text-orange-600" />
                    )}
                    <span>{value === 'development' ? 'Development' : 'Production'}</span>
                    <ChevronDown size={12} className="opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
                {(['development', 'production'] as const).map((preset) => (
                    <DropdownMenuItem
                        key={preset}
                        onClick={() => onChange(preset)}
                        className="flex flex-col items-start gap-0.5"
                    >
                        <div className="flex items-center gap-2 font-medium capitalize">
                            {preset === 'development' ? (
                                <SiVite size={12} className="text-emerald-600" />
                            ) : (
                                <SiDocker size={12} className="text-orange-600" />
                            )}
                            {preset}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                            {preset === 'development'
                                ? 'Hot reload, verbose logs, exposed ports'
                                : 'Restart policies, resource limits, health checks'}
                        </span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
