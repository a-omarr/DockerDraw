import { Plus, Layers, Settings, Download, Code } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { parseYAMLToServices } from '../../utils/yamlImport';
import { EXAMPLE_COMPOSE } from '../../data/exampleCompose';
import { Button } from '../ui/button';

export function EmptyCanvas() {
    const { toggleLibrary, setShowCommandPalette, importFromYAML } = useAppStore();

    const handleAddExample = () => {
        try {
            const { services, network } = parseYAMLToServices(EXAMPLE_COMPOSE);
            importFromYAML(services, network);
        } catch (error) {
            console.error('Failed to load example compose:', error);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center h-full py-12 sm:py-20 px-4 sm:px-6">
            {/* Animated floating icons illustration */}
            <div className="mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5 animate-bounce-in">
                    <Layers size={28} className="text-primary/60" />
                </div>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-1.5 text-center tracking-tight">
                Build your Docker stack
            </h3>
            <p className="text-sm text-muted-foreground mb-8 max-w-sm text-center leading-relaxed">
                Visually compose services, configure ports and volumes, then export a ready-to-use <code className="text-xs px-1 py-0.5 bg-muted rounded font-mono">docker-compose.yml</code>.
            </p>

            {/* 3-step guide */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 mb-10 px-2 mx-auto">
                {[
                    { step: '1', icon: Plus, label: 'Pick services', sub: 'from the library' },
                    { step: '2', icon: Settings, label: 'Configure', sub: 'ports, env, volumes' },
                    { step: '3', icon: Download, label: 'Export', sub: 'docker-compose.yml' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                        {i > 0 && (
                            <div className="hidden sm:block w-8 h-[1px] bg-border -ml-3" />
                        )}
                        <div className="flex items-center gap-2.5 w-48 sm:w-auto">
                            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                                {item.step}
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-foreground leading-tight">{item.label}</p>
                                <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    size="lg"
                    className="gap-2 shadow-md px-6"
                    onClick={() => toggleLibrary()}
                >
                    <Layers size={18} />
                    Browse Library
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 px-6 bg-white"
                    onClick={handleAddExample}
                >
                    <Code size={18} />
                    Try Example Stack
                </Button>
            </div>

            {/* Command palette hint */}
            <button
                onClick={() => setShowCommandPalette(true)}
                className="mt-6 flex items-center gap-2 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer"
            >
                Press
                <kbd className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border/50">
                    Ctrl+K
                </kbd>
                to open the command palette
            </button>
        </div>
    );
}
