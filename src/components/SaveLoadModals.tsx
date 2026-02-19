import { useState } from 'react';
import { Save, Folder, Trash2, Check, Clock, Layers } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export function SaveModal() {
    const { showSaveModal, setShowSaveModal, saveProject, projectName, services } = useAppStore();
    const [name, setName] = useState(projectName);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        saveProject(name || projectName);
        setSaved(true);
        setTimeout(() => setShowSaveModal(false), 800);
    };

    return (
        <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
            <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="px-6 py-5 border-b bg-muted/20">
                    <DialogTitle className="text-xl font-bold tracking-tight">Save Project</DialogTitle>
                    <DialogDescription className="text-xs">
                        Store your configuration to access it later from this browser.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Layers size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">{services.length} Services</p>
                                <p className="text-xs text-muted-foreground">Successfully validated stack</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                                Project Name
                            </label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="my-awesome-deployment"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                className="h-12 text-sm font-mono bg-muted/30 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-0">
                    <Button
                        onClick={handleSave}
                        disabled={!name.trim() || saved}
                        className={cn(
                            "w-full h-11 text-sm font-bold shadow-sm transition-all duration-300",
                            saved ? "bg-emerald-500 hover:bg-emerald-600" : ""
                        )}
                    >
                        {saved ? (
                            <>
                                <Check size={18} className="mr-2" />
                                Project Saved!
                            </>
                        ) : (
                            <>
                                <Save size={18} className="mr-2" />
                                Save Configuration
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function LoadModal() {
    const { showLoadModal, setShowLoadModal, loadProject, deleteProject, savedProjects } = useAppStore();

    return (
        <Dialog open={showLoadModal} onOpenChange={setShowLoadModal}>
            <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="px-6 py-5 border-b bg-muted/20">
                    <DialogTitle className="text-xl font-bold tracking-tight">Load Project</DialogTitle>
                    <DialogDescription className="text-xs">
                        Select a previously saved project to restore your workspace.
                    </DialogDescription>
                </DialogHeader>

                {savedProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground/30 mb-4">
                            <Folder size={32} />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground mb-1">No Saved Projects</h3>
                        <p className="text-xs text-muted-foreground max-w-[240px]">
                            Projects you save will appear here for easy access.
                        </p>
                    </div>
                ) : (
                    <ScrollArea className="flex-1 px-6 py-6">
                        <div className="grid gap-3 pr-3 pb-4">
                            {savedProjects.map((project) => (
                                <Card
                                    key={project.id}
                                    className="group p-4 hover:border-primary/30 hover:shadow-md transition-all border-border/60"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                                    {project.name}
                                                </h3>
                                                <Badge variant="secondary" className="h-5 px-1.5 text-[9px] font-bold">
                                                    {project.services.length} services
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {new Date(project.updatedAt).toLocaleDateString()}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                <span>Modified {new Date(project.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                onClick={() => { loadProject(project.id); setShowLoadModal(false); }}
                                                size="sm"
                                                className="h-8 px-4 font-bold shadow-sm"
                                            >
                                                Load
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteProject(project.id)}
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
}
