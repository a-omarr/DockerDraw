import { useState } from 'react';
import { Save, Check, Layers } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
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
