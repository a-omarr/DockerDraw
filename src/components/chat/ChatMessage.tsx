import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '@/types/chat';

interface ChatMessageProps {
    message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isAssistant = message.role === 'assistant';
    const isSystem = message.role === 'system';

    if (isSystem) return null;

    return (
        <div
            className={cn(
                "flex gap-3 mb-4 animate-fade-in",
                isAssistant ? "justify-start" : "justify-end flex-row-reverse"
            )}
        >
            <div
                className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                    isAssistant 
                        ? "bg-primary/10 border-primary/20 text-primary" 
                        : "bg-muted border-border text-muted-foreground"
                )}
            >
                {isAssistant ? <Bot size={16} /> : <User size={16} />}
            </div>

            <div
                className={cn(
                    "max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm overflow-hidden",
                    isAssistant
                        ? "bg-background border border-border rounded-tl-none text-foreground"
                        : "bg-primary text-primary-foreground rounded-tr-none"
                )}
            >
                <div className={cn(
                    "prose prose-sm dark:prose-invert max-w-none break-all sm:break-words",
                    "prose-p:leading-relaxed prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/50",
                    !isAssistant && "text-primary-foreground prose-headings:text-primary-foreground prose-code:text-primary-foreground"
                )}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                    </ReactMarkdown>
                </div>
                
                <div className={cn(
                    "text-[10px] mt-1 opacity-50",
                    isAssistant ? "text-muted-foreground" : "text-primary-foreground"
                )}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
}
