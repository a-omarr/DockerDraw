import Groq from 'groq-sdk';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { messages, yamlContext } = await req.json();
    
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
    }

    const groq = new Groq({ apiKey });

    const systemPrompt = `You are "DockerDraw AI", a helpful and expert Docker & DevOps assistant integrated into the DockerDraw web application.
Your goal is to help users design, debug, and understand their Docker Compose configurations.

CONTEXT:
The user is currently working on a Docker Compose project in this visual editor.
Here is the current YAML output of their design:
\`\`\`yaml
${yamlContext}
\`\`\`

CAPABILITIES:
- Analyze the current Compose file for best practices, security, and potential issues.
- Explain what specific services or configurations do.
- Suggest additional services that might be useful.
- Answer general questions about Docker, networking, volumes, and deployment.

GUIDELINES:
- Be concise but thorough.
- Format code blocks using markdown.
- If the user's YAML is empty or basic, encourage them by suggesting what they could add next.
- Always refer to the services defined in the current context when relevant.
- Be friendly and professional.`;

    const formattedMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content
      }))
    ];

    const completion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
      stream: false,
    });

    const content = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Groq Proxy Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
  }
}
