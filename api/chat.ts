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

    const systemPrompt = `You are "DockerDraw AI", a helpful and expert Docker & DevOps assistant.
Your goal is to help users design and manage their Docker Compose configurations with precision and speed.

CONTEXT:
User's current Docker Compose YAML:
\`\`\`yaml
${yamlContext}
\`\`\`

CAPABILITIES:
- Answer Docker/DevOps questions briefly and accurately.
- Add or update services via structured JSON actions.

STRICT DOMAIN LIMIT:
- You are EXCLUSIVELY a Docker, DevOps, and DockerDraw assistant.
- NEVER answer questions about unrelated topics (e.g., cooking, recipes, sports, hobbies, or general trivia).
- If the user asks something off-topic, you MUST politely refuse: "I'm sorry, but I am specifically designed to assist with Docker, DevOps, and this visual editor. I cannot help with unrelated topics."
- Do not provide partial answers or "bridge" to off-topic content.

RESPONSE GUIDELINES:
- **BE CONCISE**: Avoid long introductions, filler words, and redundant explanations. Every sentence should add value.
- **ACTION-FIRST**: When the user requests a modification, prioritize generating the action block.
- **SPECIFIC**: Focus on technical details. Do not repeat basic advice unless specifically asked.
- **STRUCTURE**: Use clear markdown formatting. 
- **JSON Format**: Always use a code block with \`type: "actions"\` at the end of your response for any workspace modifications (addService, updateService).

SERVICE ACTIONS:
Example:
\`\`\`json
{
  "type": "actions",
  "actions": [
    { "type": "addService", "templateId": "nginx" },
    { "type": "updateService", "serviceName": "nginx", "updates": { "image": "nginx:stable-alpine" } }
  ]
}
\`\`\`

AVAILABLE TEMPLATES:
Commonly used IDs: nginx, postgres, redis, mysql, mongodb, nodejs, python, rabbitmq, grafana, adminer, minio, traefik, keycloak, kafka.

Keep it short, professional, and technically focused.`;

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
