import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { serviceTemplates } from '../data/serviceTemplates';
import type { ServiceCategory, ServiceTemplate } from '../types';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
    database: 'Databases',
    cache: 'Caching',
    webserver: 'Web Servers',
    queue: 'Message Queues',
    app: 'App Servers',
    monitoring: 'Monitoring',
};

const CATEGORY_ORDER: ServiceCategory[] = ['app', 'database', 'cache', 'webserver', 'queue', 'monitoring'];

export function ServiceLibrary() {
    const { addService, services, setShowLibrary } = useAppStore();
    const [search, setSearch] = useState('');
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

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

    const toggleCategory = (cat: string) => {
        setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
    };

    return (
        <aside className="w-full lg:w-64 border-r bg-muted/30 flex flex-col h-full shrink-0 bg-background">
            {/* Header */}
            <div className="p-4 space-y-4 border-b bg-background/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Library
                    </h2>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-[10px] px-1.5 h-4">
                            {serviceTemplates.length}
                        </Badge>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-md text-muted-foreground hover:text-foreground"
                            onClick={() => setShowLibrary(false)}
                        >
                            <X size={14} />
                        </Button>
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                        placeholder="Search services..."
                        className="pl-9 h-9 bg-background focus-visible:ring-1"
                    />
                </div>
            </div>

            {/* Service groups */}
            <ScrollArea className="flex-1">
                <div className="p-3 space-y-4">
                    {Object.entries(grouped).map(([category, templates]) => (
                        <div key={category} className="space-y-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleCategory(category)}
                                className="w-full justify-between h-8 px-2 hover:bg-transparent hover:text-foreground text-muted-foreground"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                    {CATEGORY_LABELS[category as ServiceCategory] || category}
                                </span>
                                {collapsed[category] ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                            </Button>
                            {!collapsed[category] && (
                                <div className="space-y-1 mt-1">
                                    {templates.map((template) => {
                                        const count = getServiceCount(template.id);
                                        return (
                                            <ServiceLibraryCard
                                                key={template.id}
                                                template={template}
                                                count={count}
                                                onAdd={() => addService(template.id)}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                    {Object.keys(grouped).length === 0 && (
                        <div className="text-center py-12 px-4 space-y-2">
                            <div className="text-3xl opacity-20">🔍</div>
                            <p className="text-sm font-medium text-muted-foreground">No matches found</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </aside>
    );
}

function ServiceLibraryCard({
    template,
    count,
    onAdd,
}: {
    template: ServiceTemplate;
    count: number;
    onAdd: () => void;
}) {
    return (
        <Card
            onClick={onAdd}
            className={cn(
                "p-2.5 flex items-center gap-3 cursor-pointer transition-all border-transparent shadow-none hover:bg-background hover:border-border hover:shadow-sm group relative",
                count > 0 && "bg-background border-border/50"
            )}
        >
            <div
                className="w-8 h-8 rounded-md flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-105"
                style={{ backgroundColor: `${template.color}15`, color: template.color }}
            >
                {template.Icon ? <template.Icon size={18} /> : template.emoji}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                        {template.name}
                    </span>
                    {count > 0 && (
                        <Badge variant="default" className="h-4 px-1 text-[10px] font-mono min-w-[18px] justify-center">
                            {count}
                        </Badge>
                    )}
                </div>
                <p className="text-[10px] text-muted-foreground truncate font-mono">
                    {template.defaultBuildContext ? 'Dockerfile' : template.defaultImage.split(':')[0]}
                </p>
            </div>
            <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus size={12} className="text-primary" />
            </div>
        </Card>
    );
}
