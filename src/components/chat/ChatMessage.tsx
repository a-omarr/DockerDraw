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
                "grid gap-3 mb-4 animate-fade-in w-full min-w-0 overflow-hidden",
                isAssistant ? "grid-cols-[32px_minmax(0,1fr)]" : "grid-cols-[minmax(0,1fr)_32px]"
            )}
        >
            <div
                className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border self-end",
                    isAssistant
                        ? "bg-primary/10 border-primary/20 text-primary order-1"
                        : "bg-muted border-border text-muted-foreground order-2"
                )}
            >
                {isAssistant ? <Bot size={16} /> : <User size={16} />}
            </div>

            <div
                className={cn(
                    "px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm min-w-0 overflow-hidden w-full",
                    isAssistant
                        ? "bg-background border border-border rounded-tl-none text-foreground order-2"
                        : "bg-primary text-primary-foreground rounded-tr-none order-1 ml-auto"
                )}
                style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
            >
                <div className={cn(
                    "prose prose-sm dark:prose-invert max-w-none min-w-0 overflow-hidden break-words",
                    "prose-p:leading-relaxed prose-p:break-words",
                    "prose-pre:max-w-full prose-pre:overflow-x-auto prose-pre:whitespace-pre-wrap",
                    !isAssistant && "text-primary-foreground prose-headings:text-primary-foreground prose-code:text-primary-foreground"
                )}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                    </ReactMarkdown>
                </div>

                <div className={cn(
                    "text-[10px] mt-1 opacity-50 shrink-0",
                    isAssistant ? "text-muted-foreground text-left" : "text-primary-foreground text-right"
                )}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
}