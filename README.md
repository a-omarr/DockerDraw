# DockerDraw

**Visually design, configure, and export Docker Compose stacks — no terminal required.**

DockerDraw is a browser-based visual editor for `docker-compose.yml` files. Pick services from a library, configure ports, volumes, environment variables, and dependencies through an intuitive UI, then download a production-ready compose file in one click.

---

## ✨ Features

- **Visual Service Editor** — Drag-and-drop service cards on a canvas; click to configure
- **Live YAML Preview** — See your `docker-compose.yml` update in real-time with syntax highlighting (Monaco Editor)
- **Template Gallery** — Start from pre-configured stacks (MERN, LAMP, WordPress, etc.)
- **Import & Export** — Paste or upload an existing `docker-compose.yml` and edit it visually
- **Service Library** — 15+ service templates (PostgreSQL, Redis, Nginx, RabbitMQ, Elasticsearch, and more)
- **Dependency Management** — Define `depends_on` relationships with circular-dependency detection
- **Port Conflict Detection** — Real-time warnings when two services share the same host port
- **Environment Presets** — Switch between Development and Production defaults (restart policies, resource limits)
- **Undo / Redo** — Full history with `Ctrl+Z` / `Ctrl+Shift+Z`
- **Keyboard Shortcuts & Command Palette** — Power-user friendly (`Ctrl+K`)
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Offline Ready** — Runs entirely in the browser; no backend required

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| UI Primitives | Radix UI |
| State | Zustand + Zundo (undo/redo) |
| YAML | js-yaml |
| Code Editor | Monaco Editor |
| Drag & Drop | dnd-kit |
| Validation | Zod |
| Icons | Lucide React + react-icons (Simple Icons) |

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/your-username/DockerDraw.git
cd DockerDraw

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production build

```bash
npm run build
npm run preview   # preview the production bundle locally
```

---

## 📂 Project Structure

```
src/
├── components/      # React UI components
│   ├── ui/          # Reusable primitives (Button, Dialog, etc.)
│   └── ...          # Feature components (Canvas, Header, ConfigPanel, etc.)
├── data/            # Service templates & built-in compose examples
├── hooks/           # Custom React hooks
├── store/           # Zustand store (useAppStore)
├── types/           # TypeScript type definitions
└── utils/           # YAML generation, validation, port conflict detection
```

---

## 📄 License

MIT
