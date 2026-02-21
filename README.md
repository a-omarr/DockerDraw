<div align="center">
  <img src="public/favicon.svg" alt="DockerDraw Logo" width="120" />
  <h1>DockerDraw</h1>
  <p><strong>Visually design, configure, and export Docker Compose stacks — no terminal required.</strong></p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

  <br />
  <img src="public/screenshot.png" alt="DockerDraw Dashboard" width="100%" style="border-radius: 8px; border: 1px solid #eee;" />
</div>

<hr />

## 📖 About DockerDraw

DockerDraw is a powerful, browser-based visual editor designed to simplify the creation and management of `docker-compose.yml` files. Whether you are scaffolding a complex microservices architecture or just setting up a simple LAMP stack, DockerDraw eliminates syntax errors and reduces configuration time by providing an intuitive, drag-and-drop interface.

## ✨ Key Features

### 🎨 Visual & Intuitive
* **Visual Service Editor**: Drag and drop service cards to build your stack visually.
* **Service Library**: Access over 15 pre-configured service templates (PostgreSQL, Redis, Nginx, RabbitMQ, etc.).
* **Template Gallery**: Jumpstart your project using battle-tested blueprints (e.g., MERN, WordPress).
* **Responsive Design**: fully functional on desktop, tablet, and mobile environments.

### ⚙️ Powerful Configuration
* **Live YAML Sync**: Watch your `docker-compose.yml` update in real time with a built-in Monaco Code Editor.
* **Import & Export**: Easily import an existing `docker-compose.yml` to visualize its structure, or export your finalized stack with one click.
* **Intelligent Validation**: 
  * Port conflict detection alerts you when services share identical host ports.
  * Circular dependency detection prevents invalid `depends_on` relationships.
* **Environment Presets**: Swiftly toggle between Development and Production configurations to automatically tune restart policies and boundaries.

### ⌨️ Developer Experience
* **Undo / Redo Engine**: Complete history tracking allowing you to safely revert mistakes (`Ctrl+Z` / `Ctrl+Shift+Z`).
* **Command Palette**: Power-user friendly command palette accessible via `Ctrl+K`.
* **Zero Backend**: Runs entirely locally in your browser ensuring complete privacy and offline readiness.

## 🛠️ Technology Stack

Built with modern web technologies focusing on performance and type-safety:

| Layer | Technology |
|-------|-----------|
| **Core** | React 19, TypeScript |
| **Build System** | Vite 7 |
| **Styling** | Tailwind CSS 4, Radix UI |
| **State Management** | Zustand (with Zundo for component history) |
| **Editors & Parsing** | Monaco Editor, js-yaml, Zod (Validation), dnd-kit |

## 🚀 Getting Started

### Prerequisites
* Node.js 18+ or later
* npm, yarn, or pnpm

### Local Development

```bash
git clone https://github.com/a-omarr/DockerDraw
cd DockerDraw
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Production Build

To test the optimized production build locally:
```bash
npm run build
npm run preview
```

## 📂 Project Architecture

```
src/
├── components/      # Specialized UI components
│   ├── ui/          # Standardized, reusable primitives (Radix UI wrappers)
│   ├── canvas/      # Core visual drag-and-drop editor
│   ├── modals/      # Application dialogs and overlays
│   └── panels/      # Configuration and property sidebars
├── data/            # Preset service blueprints and gallery templates
├── hooks/           # Custom React hooks (e.g., shortcut management)
├── store/           # Global Zustand state and middleware
├── types/           # TypeScript interfaces and domain models
└── utils/           # Transformation logic (YAML <-> State), validations
```

## 🤝 Contributing

Issues and PRs are welcome! If you've found a bug or have a feature request, please [open an issue](https://github.com/a-omarr/DockerDraw/issues).

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.
