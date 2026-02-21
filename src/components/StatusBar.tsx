import {
    Globe,
    HardDrive,
    Layers,
    FileCode,
    Library,
    Command,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '@/lib/utils';

export function StatusBar() {
    const {
        services,
        showYAMLPanel,
        showLibrary,
        toggleYAMLPanel,
        toggleLibrary,
        setShowCommandPalette,
        environmentPreset,
    } = useAppStore();

    const totalPorts = services.reduce((acc, s) => acc + s.ports.length, 0);
    const totalVolumes = services.reduce((acc, s) => acc + s.volumes.length, 0);
    const totalEnvVars = services.reduce((acc, s) => acc + s.environment.length, 0);

    return (
        <footer className="flex items-center justify-between px-2 sm:px-4 h-11 sm:h-7 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 text-[10px] sm:text-[10px] font-medium text-muted-foreground shrink-0 select-none pb-safe relative z-50">
            {/* Left: stats */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <div className="flex items-center gap-1.5">
                    <Layers size={12} className="text-primary/60 shrink-0 sm:w-2.5 sm:h-2.5" />
                    <span className="text-xs sm:text-[10px]">{services.length}</span>
                    <span className="hidden sm:inline text-xs sm:text-[10px]">service{services.length !== 1 ? 's' : ''}</span>
                </div>
                {totalPorts > 0 && (
                    <div className="flex items-center gap-1.5">
                        <Globe size={12} className="text-blue-500/60 shrink-0 sm:w-2.5 sm:h-2.5" />
                        <span className="text-xs sm:text-[10px]">{totalPorts}</span>
                        <span className="hidden sm:inline text-xs sm:text-[10px]">port{totalPorts !== 1 ? 's' : ''}</span>
                    </div>
                )}
                {totalVolumes > 0 && (
                    <div className="hidden sm:flex items-center gap-1.5">
                        <HardDrive size={10} className="text-amber-500/60" />
                        <span>{totalVolumes} volume{totalVolumes !== 1 ? 's' : ''}</span>
                    </div>
                )}
                {totalEnvVars > 0 && (
                    <div className="hidden md:flex items-center gap-1 opacity-60">
                        <span>{totalEnvVars} env var{totalEnvVars !== 1 ? 's' : ''}</span>
                    </div>
                )}
                <div className="h-3 w-[1px] bg-border hidden sm:block" />
                <span className={cn(
                    "uppercase tracking-widest font-bold text-[10px] sm:text-[9px]",
                    environmentPreset === 'development' ? 'text-emerald-600' : 'text-orange-600'
                )}>
                    {environmentPreset}
                </span>
            </div>

            {/* Right: toggles */}
            <div className="flex items-center gap-1 sm:gap-3 shrink-0">
                <button
                    onClick={toggleLibrary}
                    className={cn(
                        "flex items-center justify-center gap-1.5 transition-colors hover:text-foreground cursor-pointer min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 rounded-md active:bg-muted/50 p-1 sm:p-0",
                        showLibrary ? 'text-primary' : 'text-muted-foreground/60'
                    )}
                >
                    <Library size={14} className="sm:w-2.5 sm:h-2.5" />
                    <span className="hidden sm:inline">Library</span>
                </button>
                <div className="h-4 w-[1px] bg-border block sm:hidden mx-1" />
                <button
                    onClick={toggleYAMLPanel}
                    className={cn(
                        "flex items-center justify-center gap-1.5 transition-colors hover:text-foreground cursor-pointer min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 rounded-md active:bg-muted/50 p-1 sm:p-0 z-50",
                        showYAMLPanel ? 'text-primary' : 'text-muted-foreground/60'
                    )}
                >
                    <FileCode size={14} className="sm:w-2.5 sm:h-2.5" />
                    <span className="hidden sm:inline">YAML</span>
                </button>
                <div className="h-3 w-[1px] bg-border hidden sm:block" />
                <button
                    onClick={() => setShowCommandPalette(true)}
                    className="hidden sm:flex items-center gap-1 text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer"
                >
                    <Command size={9} />
                    <kbd className="font-mono text-[9px] bg-muted px-1 rounded border border-border/50">
                        Ctrl+K
                    </kbd>
                </button>
            </div>
        </footer>
    );
}
