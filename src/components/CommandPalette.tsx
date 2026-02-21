import { useState, useRef, useEffect } from 'react';
import {
    Command,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useCommandList } from '../hooks/useCommandList';
import type { CommandItem } from '../types';

export function CommandPalette() {
    const {
        showCommandPalette,
        setModalVisibility,
    } = useAppStore();

    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const { filtered, grouped } = useCommandList(search);

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
        setModalVisibility('showCommandPalette', false);
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
        <Dialog open={showCommandPalette} onOpenChange={(open) => setModalVisibility('showCommandPalette', open)}>
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
