import { MessageSquare, Sparkles, Minimize2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { ChatPanel } from './ChatPanel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useMediaQuery';

export function AIAssistant() {
    const { showChatPanel, toggleChatPanel } = useAppStore();
    const isMobile = useIsMobile();

    return (
        <div className="fixed bottom-12 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
            {/* Chat Panel */}
            <div 
                className={cn(
                    "w-[380px] h-[550px] max-h-[calc(100vh-120px)] rounded-2xl overflow-hidden shadow-2xl border border-divider transition-all duration-300 origin-bottom-right pointer-events-auto",
                    isMobile && "w-[calc(100vw-32px)] right-4",
                    showChatPanel 
                        ? "opacity-100 scale-100 translate-y-0" 
                        : "opacity-0 scale-95 translate-y-4 pointer-events-none"
                )}
            >
                <ChatPanel />
            </div>

            {/* Floating Toggle Button */}
            <div className="pointer-events-auto flex items-center gap-2">
                {!showChatPanel && (
                    <div className="bg-background/80 backdrop-blur-sm border border-border/50 px-3 py-1.5 rounded-full shadow-sm animate-fade-in hidden lg:flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <p className="text-[11px] font-medium text-foreground/80">
                            Ask AI for help
                        </p>
                    </div>
                )}
                
                <Button
                    size="icon"
                    className={cn(
                        "h-14 w-14 rounded-2xl shadow-xl transition-all duration-300 group relative overflow-hidden",
                        showChatPanel 
                            ? "bg-muted text-muted-foreground hover:bg-muted/80 ring-1 ring-border shadow-none" 
                            : "bg-primary text-primary-foreground hover:scale-105"
                    )}
                    onClick={toggleChatPanel}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {showChatPanel ? (
                        <Minimize2 size={24} className="animate-in zoom-in duration-300" />
                    ) : (
                        <>
                            <MessageSquare size={24} className="group-hover:rotate-12 transition-transform duration-300" />
                            <Sparkles 
                                size={12} 
                                className="absolute top-3.5 right-3.5 text-yellow-400 fill-yellow-400 animate-pulse" 
                            />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
