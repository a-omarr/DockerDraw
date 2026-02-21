import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, Terminal } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { parseYAMLToServices } from '../../utils/yamlImport';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export function ImportModal() {
    const { showImportModal, setShowImportModal, importFromYAML } = useAppStore();
    const [yamlText, setYamlText] = useState('');
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const handleImport = () => {
        setError('');
        try {
            const { services, network } = parseYAMLToServices(yamlText);
            importFromYAML(services, network);
            setShowImportModal(false);
        } catch (e: any) {
            setError(e.message || 'Failed to parse YAML');
        }
    };

    const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setYamlText(ev.target?.result as string || '');
        reader.readAsText(file);
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setYamlText(ev.target?.result as string || '');
        reader.readAsText(file);
    };

    const sampleYaml = `version: '3.8'
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: changeme`;

    return (
        <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
            <DialogContent className="max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="px-6 py-4 border-b bg-muted/20">
                    <DialogTitle className="text-xl font-bold tracking-tight">Import Configuration</DialogTitle>
                    <DialogDescription className="text-xs">
                        Import an existing docker-compose.yml file to visualize and edit it.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Drop zone */}
                    <div
                        onDragOver={(e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleFileDrop}
                        onClick={() => document.getElementById('file-input')?.click()}
                        className={cn(
                            "group flex flex-col items-center justify-center p-8 rounded-xl cursor-pointer transition-all border-2 border-dashed",
                            isDragging
                                ? "bg-primary/5 border-primary"
                                : "bg-muted/30 border-muted-foreground/20 hover:bg-muted/50 hover:border-muted-foreground/40"
                        )}
                    >
                        <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors",
                            isDragging ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground group-hover:text-foreground"
                        )}>
                            <Upload size={20} />
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                            Drop your docker-compose.yml here
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">or click to browse your files</p>
                        <input id="file-input" type="file" accept=".yml,.yaml" className="hidden" onChange={handleFileInput} />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground font-semibold tracking-wider">
                                Or paste YAML content
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <Textarea
                                value={yamlText}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setYamlText(e.target.value)}
                                placeholder={sampleYaml}
                                className="min-h-[250px] font-mono text-[13px] leading-relaxed bg-muted/30 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20 p-4 resize-none"
                            />
                            <div className="absolute top-3 right-3 opacity-20 group-hover:opacity-40 transition-opacity">
                                <Terminal size={14} />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                                <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-destructive uppercase tracking-tight">Import Error</p>
                                    <p className="text-[13px] text-destructive/90 leading-tight font-medium">{error}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 pt-0 mt-auto border-t bg-muted/20">
                    <Button
                        onClick={handleImport}
                        disabled={!yamlText.trim()}
                        className="w-full h-11 text-sm font-bold shadow-sm"
                    >
                        <FileText size={16} className="mr-2" />
                        Import & Visualize Stack
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
