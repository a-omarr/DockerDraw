import { useState, useRef, useEffect, useMemo } from 'react';
import {
    LayoutTemplate,
    Upload,
    Save,
    FolderOpen,
    Download,
    Undo2,
    Redo2,
    FileCode,
    Library,
    Trash2,
    Plus,
    Command,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { serviceTemplates } from '../data/serviceTemplates';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface CommandItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    shortcut?: string;
    category: string;
    action: () => void;
}

export function CommandPalette() {
    const {
        showCommandPalette,
        setShowCommandPalette,
        setShowTemplateGallery,
        setShowImportModal,
        setShowSaveModal,
        setShowLoadModal,
        toggleYAMLPanel,
        toggleLibrary,
        addService,
        clearAllServices,
        services,
        yamlOutput,
        setShowSuccessModal,
    } = useAppStore();

    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const handleDownload = () => {
        const blob = new Blob([yamlOutput], { type: 'text/yaml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'docker-compose.yml';
        a.click();
        URL.revokeObjectURL(url);
        setShowSuccessModal(true);
    };

    const commands: CommandItem[] = useMemo(() => {
        const base: CommandItem[] = [
            {
                id: 'templates',
                label: 'Browse Templates',
                icon: <LayoutTemplate size={16} />,
                category: 'Navigation',
                action: () => setShowTemplateGallery(true),
            },
            {
                id: 'import',
                label: 'Import YAML',
                icon: <Upload size={16} />,
                category: 'Navigation',
                action: () => setShowImportModal(true),
            },
            {
                id: 'save',
                label: 'Save Project',
                icon: <Save size={16} />,
                shortcut: '⌘S',
                category: 'Project',
                action: () => setShowSaveModal(true),
            },
            {
                id: 'load',
                label: 'Load Project',
                icon: <FolderOpen size={16} />,
                category: 'Project',
                action: () => setShowLoadModal(true),
            },
            {
                id: 'download',
                label: 'Download docker-compose.yml',
                icon: <Download size={16} />,
                category: 'Project',
                action: handleDownload,
            },
            {
                id: 'undo',
                label: 'Undo',
                icon: <Undo2 size={16} />,
                shortcut: '⌘Z',
                category: 'Edit',
                action: () => {
                    const temporal = useAppStore.temporal.getState();
                    temporal.pause();
                    temporal.undo();
                    useAppStore.getState().refreshDerived();
                    temporal.resume();
                },
            },
            {
                id: 'redo',
                label: 'Redo',
                icon: <Redo2 size={16} />,
                shortcut: '⌘⇧Z',
                category: 'Edit',
                action: () => {
                    const temporal = useAppStore.temporal.getState();
                    temporal.pause();
                    temporal.redo();
                    useAppStore.getState().refreshDerived();
                    temporal.resume();
                },
            },
            {
                id: 'toggle-yaml',
                label: 'Toggle YAML Preview',
                icon: <FileCode size={16} />,
                category: 'View',
                action: toggleYAMLPanel,
            },
            {
                id: 'toggle-library',
                label: 'Toggle Service Library',
                icon: <Library size={16} />,
                category: 'View',
                action: toggleLibrary,
            },
        ];

        // Add "Clear All" only if there are services
        if (services.length > 0) {
            base.push({
                id: 'clear-all',
                label: 'Clear All Services',
                icon: <Trash2 size={16} />,
                category: 'Edit',
                action: clearAllServices,
            });
        }

        // Add all service templates as "Add <service>"
        const serviceCommands: CommandItem[] = serviceTemplates.map((t) => ({
            id: `add-${t.id}`,
            label: `Add ${t.name}`,
            icon: t.Icon ? <t.Icon size={16} style={{ color: t.color }} /> : <Plus size={16} />,
            category: 'Add Service',
            action: () => addService(t.id),
        }));

        return [...base, ...serviceCommands];
    }, [services.length]);

    const filtered = useMemo(() => {
        if (!search.trim()) return commands;
        const q = search.toLowerCase();
        return commands.filter(
            (c) =>
                c.label.toLowerCase().includes(q) ||
                c.category.toLowerCase().includes(q)
        );
    }, [search, commands]);

    // Group by category
    const grouped = useMemo(() => {
        const map = new Map<string, CommandItem[]>();
        filtered.forEach((item) => {
            if (!map.has(item.category)) map.set(item.category, []);
            map.get(item.category)!.push(item);
        });
        return map;
    }, [filtered]);

    // Reset selection when search changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    // Reset on open
    useEffect(() => {
        if (showCommandPalette) {
            setSearch('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [showCommandPalette]);

    // Scroll selected item into view
    useEffect(() => {
        const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
        el?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    const executeItem = (item: CommandItem) => {
        setShowCommandPalette(false);
        // Small delay so dialog closes first
        setTimeout(() => item.action(), 50);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filtered[selectedIndex]) {
                executeItem(filtered[selectedIndex]);
            }
        }
    };

    let flatIndex = 0;

    return (
        <Dialog open={showCommandPalette} onOpenChange={setShowCommandPalette}>
            <DialogContent
                className="max-w-lg p-0 gap-0 overflow-hidden border-border/60 shadow-2xl"
                onKeyDown={handleKeyDown}
            >
                {/* Search */}
                <div className="flex items-center gap-3 px-4 border-b h-14">
                    <Command size={16} className="text-muted-foreground/50 shrink-0" />
                    <input
                        ref={inputRef}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Type a command or search…"
                        className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/40"
                    />
                    <kbd className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div ref={listRef} className="max-h-[340px] overflow-y-auto p-2">
                    {filtered.length === 0 ? (
                        <div className="py-8 text-center">
                            <p className="text-sm text-muted-foreground">No commands found</p>
                        </div>
                    ) : (
                        Array.from(grouped.entries()).map(([category, items]) => (
                            <div key={category} className="mb-2 last:mb-0">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-2 py-1.5">
                                    {category}
                                </p>
                                {items.map((item) => {
                                    const idx = flatIndex++;
                                    return (
                                        <button
                                            key={item.id}
                                            data-index={idx}
                                            onClick={() => executeItem(item)}
                                            className={cn(
                                                'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer',
                                                idx === selectedIndex
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-foreground/80 hover:bg-muted'
                                            )}
                                        >
                                            <span className="text-muted-foreground/70 shrink-0">
                                                {item.icon}
                                            </span>
                                            <span className="flex-1 text-left font-medium truncate">
                                                {item.label}
                                            </span>
                                            {item.shortcut && (
                                                <kbd className="text-[10px] font-mono text-muted-foreground/60 bg-muted/50 px-1.5 py-0.5 rounded border border-border/50 shrink-0">
                                                    {item.shortcut}
                                                </kbd>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/20 text-[10px] text-muted-foreground/60 font-medium">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <kbd className="font-mono bg-muted px-1 rounded border border-border/50">↑↓</kbd>
                            Navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="font-mono bg-muted px-1 rounded border border-border/50">↵</kbd>
                            Select
                        </span>
                    </div>
                    <span>{filtered.length} commands</span>
                </div>
            </DialogContent>
        </Dialog>
    );
}
