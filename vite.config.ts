import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
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
              
              const apiKey = process.env.GROQ_API_KEY;
              
              if (!apiKey) {
                throw new Error('GROQ_API_KEY is not set in environment variables');
              }
              
              const systemPrompt = `You are "DockerDraw AI", a helpful expert assistant.\n\nContext:\n\`\`\`yaml\n${yamlContext}\n\`\`\``;
              
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
})
