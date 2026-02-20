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
        <footer className="flex items-center justify-between px-2 sm:px-4 h-7 border-t bg-muted/20 text-[10px] font-medium text-muted-foreground shrink-0 select-none">
            {/* Left: stats */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <div className="flex items-center gap-1.5">
                    <Layers size={10} className="text-primary/60 shrink-0" />
                    <span>{services.length}</span>
                    <span className="hidden sm:inline">service{services.length !== 1 ? 's' : ''}</span>
                </div>
                {totalPorts > 0 && (
                    <div className="flex items-center gap-1.5">
                        <Globe size={10} className="text-blue-500/60 shrink-0" />
                        <span>{totalPorts}</span>
                        <span className="hidden sm:inline">port{totalPorts !== 1 ? 's' : ''}</span>
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
                    "uppercase tracking-widest font-bold text-[9px]",
                    environmentPreset === 'development' ? 'text-emerald-600' : 'text-orange-600'
                )}>
                    {environmentPreset}
                </span>
            </div>

            {/* Right: toggles */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button
                    onClick={toggleLibrary}
                    className={cn(
                        "flex items-center gap-1 transition-colors hover:text-foreground cursor-pointer",
                        showLibrary ? 'text-primary' : 'text-muted-foreground/60'
                    )}
                >
                    <Library size={10} />
                    <span className="hidden sm:inline">Library</span>
                </button>
                <button
                    onClick={toggleYAMLPanel}
                    className={cn(
                        "flex items-center gap-1 transition-colors hover:text-foreground cursor-pointer",
                        showYAMLPanel ? 'text-primary' : 'text-muted-foreground/60'
                    )}
                >
                    <FileCode size={10} />
                    <span className="hidden sm:inline">YAML</span>
                </button>
                <div className="h-3 w-[1px] bg-border hidden sm:block" />
                <button
                    onClick={() => setShowCommandPalette(true)}
                    className="hidden sm:flex items-center gap-1 text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer"
                >
                    <Command size={9} />
                    <kbd className="font-mono text-[9px] bg-muted px-1 rounded border border-border/50">
                        ⌘K
                    </kbd>
                </button>
            </div>
        </footer>
    );
}
