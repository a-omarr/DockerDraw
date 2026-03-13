import { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Sparkles, X, Bot } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { ChatMessage } from './ChatMessage';
import { getGroqChatResponse } from '@/lib/groq';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function ChatPanel() {
    const {
        chatMessages,
        isChatLoading,
        yamlOutput,
        addChatMessage,
        setChatLoading,
        clearChat,
        setModalVisibility
    } = useAppStore();

    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages, isChatLoading]);

    const handleSend = async () => {
        if (!input.trim() || isChatLoading) return;

        const userMsg = {
            id: crypto.randomUUID(),
            role: 'user' as const,
            content: input.trim(),
            timestamp: Date.now()
        };

        addChatMessage(userMsg);
        setInput('');
        setChatLoading(true);

        try {
            const assistantResponse = await getGroqChatResponse(
                [...chatMessages, userMsg],
                yamlOutput
            );

            let visibleContent = assistantResponse;

            // Process AI actions if present
            try {
                // Find and extract JSON blocks
                const jsonBlocks = [...assistantResponse.matchAll(/```json\s*([\s\S]*?)\s*```/g)];

                for (const match of jsonBlocks) {
                    const jsonContent = match[1];
                    try {
                        const data = JSON.parse(jsonContent);
                        if (data.type === 'actions' && Array.isArray(data.actions)) {
                            // This is an internal action block, remove it from visible content
                            visibleContent = visibleContent.replace(match[0], '').trim();

                            for (const action of data.actions) {
                                if (action.type === 'addService' && action.templateId) {
                                    useAppStore.getState().addService(action.templateId);
                                } else if (action.type === 'updateService' && action.serviceName) {
                                    const service = useAppStore.getState().services.find(
                                        s => s.name.toLowerCase() === action.serviceName.toLowerCase()
                                    );
                                    if (service) {
                                        useAppStore.getState().updateService(service.id, action.updates);
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        // Not a valid actions block or just regular JSON, keep it
                    }
                }
            } catch (e) {
                console.error('Failed to parse AI actions:', e);
            }

            addChatMessage({
                id: crypto.randomUUID(),
                role: 'assistant' as const,
                content: visibleContent,
                timestamp: Date.now()
            });

        } catch (error: any) {
            console.error('Groq AI Error:', error);
            addChatMessage({
                id: crypto.randomUUID(),
                role: 'assistant' as const,
                content: `I encountered an error: ${error.message || 'Unknown error'}. Please try again later.`,
                timestamp: Date.now()
            });
        } finally {
            setChatLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background/50 backdrop-blur-md">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-background/80 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                        <Sparkles size={14} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold">DockerDraw AI</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Online</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={clearChat}
                        title="Clear Conversation"
                    >
                        <Trash2 size={16} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 lg:hidden"
                        onClick={() => setModalVisibility('showChatPanel', false)}
                    >
                        <X size={18} />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                {chatMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4 pt-12">
                        <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center opacity-50">
                            <Bot size={24} className="text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">How can I help you today?</p>
                            <p className="text-xs text-muted-foreground max-w-[200px]">
                                I'm your Docker expert. Ask me anything about your current stack!
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-2 w-full pt-4">
                            {[
                                "Analyze my current setup",
                                "Explain ports and volumes",
                                "Add a monitoring service"
                            ].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => setInput(suggestion)}
                                    className="text-[11px] text-left px-3 py-2 rounded-lg bg-muted/50 border border-transparent hover:border-primary/30 hover:bg-primary/5 transition-all"
                                >
                                    "{suggestion}"
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {chatMessages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
                {isChatLoading && (
                    <div className="flex gap-3 mb-4 animate-fade-in">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                            <Bot size={16} />
                        </div>
                        <div className="bg-background border border-border px-3 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
            </ScrollArea>

            {/* Input area */}
            <div className="p-4 bg-background border-t">
                <div className="flex items-stretch gap-0 bg-muted/30 rounded-2xl border border-border/50 focus-within:border-primary/30 focus-within:ring-1 focus-within:ring-primary/10 transition-all overflow-hidden">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your stack..."
                        rows={1}
                        className="flex-1 bg-transparent border-none px-4 py-3 text-sm focus:outline-none resize-none min-h-[44px] max-h-32 transition-all scrollbar-hide"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isChatLoading}
                        className={cn(
                            "flex items-center justify-center px-4 transition-all shrink-0 border-l border-border/50",
                            input.trim() && !isChatLoading
                                ? "text-primary hover:bg-primary/10 cursor-pointer"
                                : "text-muted-foreground/30 cursor-not-allowed"
                        )}
                    >
                        <Send size={16} />
                    </button>
                </div>
                <div className="mt-3 flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
                        <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-tighter">
                            Llama 3.3 Assistant
                        </p>
                    </div>
                    <Badge variant="outline" className="text-[9px] h-4 py-0 px-2 font-mono bg-muted/20 border-border/50 text-muted-foreground/70">
                        {yamlOutput.split('\n').length} lines context
                    </Badge>
                </div>
            </div>
        </div>
    );
}