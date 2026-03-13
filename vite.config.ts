import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'api-proxy',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/chat' && req.method === 'POST') {
              try {
                let body = '';
                for await (const chunk of req) body += chunk;
                if (!body) throw new Error('Empty request body');
                const { messages, yamlContext } = JSON.parse(body);
                
                const apiKey = env.GROQ_API_KEY;
                
                if (!apiKey) {
                  throw new Error('GROQ_API_KEY is not set in environment variables');
                }
                
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
                
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    messages: [
                      { role: 'system', content: systemPrompt }, 
                      ...messages.map((m: any) => ({ role: m.role, content: m.content }))
                    ],
                    model: 'llama-3.3-70b-versatile',
                  }),
                });

                const data: any = await response.json();
                if (!response.ok) {
                  console.error('Groq API Error:', data);
                  throw new Error(data.error?.message || 'Groq API Error');
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ content: data.choices[0]?.message?.content }));
              } catch (error: any) {
                console.error('Local Proxy Error Detail:', error);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: `Local Proxy Error: ${error.message}` }));
              }
              return;
            }
            next();
          });
        },
      }
    ],
  appType: 'spa',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  }
})
