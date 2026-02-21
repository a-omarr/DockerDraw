import { useState } from 'react';
import { Search, Star, Zap } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { builtinTemplates } from '../../data/builtinTemplates';
import { serviceTemplates } from '../../data/serviceTemplates';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export function TemplateGallery() {
    const { showTemplateGallery, setModalVisibility, loadTemplate } = useAppStore();
    const [search, setSearch] = useState('');

    const filtered = builtinTemplates.filter(
        (t) =>
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.description.toLowerCase().includes(search.toLowerCase()) ||
            t.tags.some((tag) => tag.includes(search.toLowerCase()))
    );

    const handleLoad = (templateId: string) => {
        const template = builtinTemplates.find((t) => t.id === templateId);
        if (template) {
            loadTemplate(template.services);
            setModalVisibility('showTemplateGallery', false);
        }
    };

    return (
        <Dialog open={showTemplateGallery} onOpenChange={(open) => setModalVisibility('showTemplateGallery', open)}>
            <DialogContent className="max-w-3xl w-[95vw] sm:w-[90vw] h-[85vh] sm:h-[80vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-xl">
                <DialogHeader className="px-4 sm:px-6 py-4 border-b bg-muted/20">
                    <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight">Template Gallery</DialogTitle>
                    <DialogDescription className="text-xs">
                        Start your project with a professionally configured Docker stack.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4 sm:p-6 pb-0">
                    <div className="relative mb-4 sm:mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search templates (e.g. 'fullstack', 'database', 'frontend')..."
                            className="pl-9 h-11 bg-muted/30 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
                            autoFocus
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1 px-4 sm:px-6 pb-4 sm:pb-6">
                    <div className="grid gap-3 sm:gap-4 pr-2 sm:pr-3">
                        {filtered.map((template) => (
                            <Card
                                key={template.id}
                                className="group p-4 sm:p-5 hover:border-primary/30 hover:shadow-md transition-all cursor-default border-border/60"
                            >
                                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                    <div className="flex-1 space-y-3 w-full">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                                                    {template.name}
                                                </h3>
                                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none flex items-center gap-1 h-5 px-1.5 text-[10px] font-bold">
                                                    <Star size={10} className="fill-current" />
                                                    {template.uses.toLocaleString()}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {template.description}
                                            </p>
                                        </div>

                                        {/* Service preview */}
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {template.services.map((s, i) => {
                                                const t = serviceTemplates.find((st) => st.id === s.templateId);
                                                return (
                                                    <Badge
                                                        key={i}
                                                        variant="outline"
                                                        className="h-6 gap-1.5 px-2 font-medium text-[10px] bg-background border-border/40"
                                                    >
                                                        {t?.Icon ? (
                                                            <t.Icon size={12} className="text-muted-foreground/80 group-hover:text-primary transition-colors" />
                                                        ) : (
                                                            <span className="text-xs">{t?.emoji || '📦'}</span>
                                                        )}
                                                        {s.name}
                                                    </Badge>
                                                );
                                            })}
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {template.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleLoad(template.id)}
                                        className="shrink-0 w-full sm:w-auto h-9 gap-2 px-4 shadow-sm"
                                        size="sm"
                                    >
                                        <Zap size={14} className="fill-current" />
                                        Use Template
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
