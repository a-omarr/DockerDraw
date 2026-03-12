import type { ChatMessage } from '../types/chat';

export async function getGroqChatResponse(
    messages: ChatMessage[],
    yamlContext: string
) {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages,
            yamlContext
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
    }

    const data = await response.json();
    return data.content || "I'm sorry, I couldn't generate a response.";
}
