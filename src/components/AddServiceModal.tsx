import { useState } from 'react';
import { Search, Plus, Check } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { serviceTemplates } from '../data/serviceTemplates';
import type { ServiceCategory, ServiceTemplate } from '../types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const CATEGORY_META: Record<ServiceCategory, { label: string; emoji: string }> = {
    database: { label: 'Databases', emoji: '🗄️' },
    cache: { label: 'Caching', emoji: '⚡' },
    webserver: { label: 'Web Servers', emoji: '🌐' },
    queue: { label: 'Message Queues', emoji: '📨' },
    app: { label: 'App & Backend', emoji: '📦' },
    monitoring: { label: 'Monitoring & Tools', emoji: '📊' },
};

const CATEGORY_ORDER: ServiceCategory[] = ['database', 'app', 'cache', 'webserver', 'queue', 'monitoring'];

interface AddServiceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddServiceModal({ open, onOpenChange }: AddServiceModalProps) {
    const { addService, services } = useAppStore();
    const [search, setSearch] = useState('');
    const [justAdded, setJustAdded] = useState<string | null>(null);

    const filtered = serviceTemplates.filter(
        (t) =>
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.description.toLowerCase().includes(search.toLowerCase()) ||
            t.tags.some((tag) => tag.includes(search.toLowerCase()))
    );

    const grouped = CATEGORY_ORDER.reduce<Record<string, ServiceTemplate[]>>((acc, cat) => {
        const items = filtered.filter((t) => t.category === cat);
        if (items.length > 0) acc[cat] = items;
        return acc;
    }, {});

    const getServiceCount = (templateId: string) =>
        services.filter((s) => s.templateId === templateId).length;

    const handleAdd = (templateId: string) => {
        addService(templateId);
        setJustAdded(templateId);
        setTimeout(() => setJustAdded(null), 600);
    };

    const handleClose = (open: boolean) => {
        onOpenChange(open);
        if (!open) {
            setSearch('');
            setJustAdded(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl h-[75vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="px-6 py-4 border-b bg-muted/20">
                    <DialogTitle className="text-lg font-bold tracking-tight">Add a Service</DialogTitle>
                    <DialogDescription className="text-xs">
                        Pick a service to add to your Docker Compose stack.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 pt-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search services (e.g. 'postgres', 'redis', 'nginx')..."
                            className="pl-9 h-11 bg-muted/30 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
                            autoFocus
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1 px-6 pb-6">
                    <div className="space-y-6 pt-4 pr-2">
                        {Object.entries(grouped).map(([category, templates]) => (
                            <div key={category}>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-sm">{CATEGORY_META[category as ServiceCategory]?.emoji}</span>
                                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                                        {CATEGORY_META[category as ServiceCategory]?.label || category}
                                    </h3>
                                    <div className="flex-1 h-[1px] bg-border/50" />
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {templates.map((template) => {
                                        const count = getServiceCount(template.id);
                                        const wasJustAdded = justAdded === template.id;
                                        return (
                                            <button
                                                key={template.id}
                                                onClick={() => handleAdd(template.id)}
                                                className={cn(
                                                    "group relative flex items-center gap-3 p-3 rounded-xl border transition-all text-left cursor-pointer",
                                                    "hover:border-primary/30 hover:shadow-md hover:bg-background",
                                                    wasJustAdded
                                                        ? "border-emerald-300 bg-emerald-50/50 shadow-sm"
                                                        : count > 0
                                                            ? "border-border/60 bg-background shadow-sm"
                                                            : "border-border/30 bg-muted/20"
                                                )}
                                            >
                                                <div
                                                    className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 transition-transform group-hover:scale-110"
                                                    style={{ backgroundColor: `${template.color}15`, color: template.color }}
                                                >
                                                    {wasJustAdded ? (
                                                        <Check size={18} className="text-emerald-600" />
                                                    ) : template.Icon ? (
                                                        <template.Icon size={18} />
                                                    ) : (
                                                        template.emoji
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                                            {template.name}
                                                        </span>
                                                        {count > 0 && (
                                                            <Badge variant="default" className="h-4 px-1 text-[9px] font-mono min-w-[16px] justify-center shrink-0">
                                                                {count}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground truncate">
                                                        {template.defaultBuildContext ? 'Dockerfile' : template.defaultImage}
                                                    </p>
                                                </div>
                                                <Plus size={14} className="text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                        {Object.keys(grouped).length === 0 && (
                            <div className="text-center py-16 space-y-2">
                                <div className="text-3xl opacity-20">🔍</div>
                                <p className="text-sm font-medium text-muted-foreground">No services match "{search}"</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
