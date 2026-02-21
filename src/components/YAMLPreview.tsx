import { useState } from 'react';
import { Copy, Check, Download, AlertTriangle, Lightbulb, FileCode, ChevronRight } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useAppStore } from '../store/useAppStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export function YAMLPreview({ className }: { className?: string }) {
    const { yamlOutput, warnings, setShowSuccessModal } = useAppStore();
    const [copied, setCopied] = useState(false);
    const [showWarnings, setShowWarnings] = useState(true);

    const warningCount = warnings.filter((w) => w.type === 'warning' || w.type === 'error').length;
    const tipCount = warnings.filter((w) => w.type === 'tip').length;

    const handleCopy = () => {
        navigator.clipboard.writeText(yamlOutput).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

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

    return (
        <div className={cn("flex flex-col h-[350px] bg-background border-t border-border shadow-[0_-4px_24px_rgba(0,0,0,0.03)]", className)}>
            {/* Header bar */}
            <div className="flex items-center justify-between px-6 py-2 border-b bg-muted/30">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <FileCode size={14} className="text-muted-foreground" />
                        <span className="text-xs font-bold tracking-tight text-foreground/80 uppercase">
                            docker-compose.yml
                        </span>
                    </div>

                    <Separator orientation="vertical" className="h-4" />

                    <div className="flex items-center gap-2">
                        {warningCount > 0 && (
                            <Badge
                                variant="outline"
                                className="cursor-pointer hover:bg-amber-100/50 transition-colors gap-1.5 h-6 px-2.5 border-amber-200 text-amber-700 bg-amber-50/50 font-bold text-[10px]"
                                onClick={() => setShowWarnings(v => !v)}
                            >
                                <AlertTriangle size={10} className="fill-amber-700/20" />
                                {warningCount} {warningCount === 1 ? 'Warning' : 'Warnings'}
                            </Badge>
                        )}
                        {tipCount > 0 && (
                            <Badge
                                variant="outline"
                                className="cursor-pointer hover:bg-emerald-100/50 transition-colors gap-1.5 h-6 px-2.5 border-emerald-200 text-emerald-700 bg-emerald-50/50 font-bold text-[10px]"
                                onClick={() => setShowWarnings(v => !v)}
                            >
                                <Lightbulb size={10} className="fill-emerald-700/20" />
                                {tipCount} {tipCount === 1 ? 'Tip' : 'Tips'}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleCopy}
                        className={cn(
                            "h-7 sm:h-8 gap-1.5 sm:gap-2 px-2 sm:px-3 text-[10px] sm:text-[11px] font-bold transition-all border-none ring-0",
                            copied ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-muted hover:bg-muted-foreground/10"
                        )}
                    >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleDownload}
                        className="h-7 sm:h-8 gap-1.5 sm:gap-2 px-2 sm:px-4 text-[10px] sm:text-[11px] font-bold shadow-sm"
                    >
                        <Download size={12} />
                        <span className="hidden sm:inline">Download Compose File</span>
                        <span className="sm:hidden">Download</span>
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
                {/* Monaco editor */}
                <div className="flex-1 overflow-hidden opacity-90">
                    <Editor
                        height="100%"
                        language="yaml"
                        value={yamlOutput}
                        theme="vs"
                        options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            fontSize: 13,
                            lineNumbers: 'on',
                            wordWrap: 'on',
                            padding: { top: 16, bottom: 16 },
                            scrollbar: {
                                verticalScrollbarSize: 8,
                                horizontalScrollbarSize: 8,
                                verticalSliderSize: 4,
                                horizontalSliderSize: 4,
                                useShadows: false
                            },
                            fontFamily: "JetBrains Mono, Fira Code, monospace",
                        }}
                    />
                </div>

                {/* Warnings panel */}
                {showWarnings && warnings.length > 0 && (
                    <div className="flex-shrink-0 w-full md:w-80 h-40 md:h-auto border-t md:border-t-0 md:border-l bg-muted/10 backdrop-blur-sm animate-in slide-in-from-bottom-2 md:slide-in-from-right-1 duration-300 z-10">
                        <ScrollArea className="h-full">
                            <div className="p-4 space-y-3">
                                {warnings.map((w) => (
                                    <div
                                        key={w.id}
                                        className={cn(
                                            "p-3 rounded-lg border text-[11px] leading-relaxed relative overflow-hidden group transition-all hover:shadow-sm",
                                            w.type === 'tip'
                                                ? 'bg-emerald-50/30 border-emerald-100 text-emerald-900/80'
                                                : w.type === 'error'
                                                    ? 'bg-red-50/30 border-red-100 text-red-900/80'
                                                    : 'bg-amber-50/30 border-amber-100 text-amber-900/80'
                                        )}
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <div className={cn(
                                                "shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center",
                                                w.type === 'tip' ? 'bg-emerald-100 text-emerald-600' :
                                                    w.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                            )}>
                                                {w.type === 'tip' ? <Lightbulb size={12} /> : <AlertTriangle size={12} />}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-medium">{w.message}</p>
                                                {w.action && (
                                                    <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity italic decoration-dotted underline-offset-2">
                                                        <ChevronRight size={10} />
                                                        <span>{w.action}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                )}
            </div>
        </div>
    );
}
