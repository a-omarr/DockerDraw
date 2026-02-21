import { useAppStore } from '../../store/useAppStore';

interface DependencyFlowProps {
    dependsOn: string[];
}

export function DependencyFlow({ dependsOn }: DependencyFlowProps) {
    const { services } = useAppStore();

    if (dependsOn.length === 0) return null;

    return (
        <div className="pl-6 sm:pl-12 mt-2 space-y-1 text-left">
            {dependsOn.map((depId) => {
                const depService = services.find((s) => s.id === depId);
                const depName = depService ? depService.name : depId;
                return (
                    <div
                        key={depId}
                        className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground"
                    >
                        <div className="w-2 h-[1px] bg-border" />
                        <span className="text-primary/70">Requires</span>
                        <span className="px-1.5 py-0.5 rounded-md bg-white border border-border shadow-sm font-mono text-foreground">
                            {depName}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
