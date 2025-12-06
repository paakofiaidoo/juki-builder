# Juki Builder

**Juki Builder** is a powerful no-code tool designed to help you build Next.js applications with a visual interface. It combines a sophisticated WYSIWYG editor with a robust backend engine to generate production-ready code.

## Project Structure

The project is organized into two main components within the `.juki` directory:

- **`.juki/editor` (Frontend)**: A React-based visual editor built with Vite. This is where you design your UI, manage components, and interact with the AI features.
- **`.juki/engine` (Backend)**: A Go-based engine that handles data persistence, project management, and executes CLI commands for the generated Next.js application.

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** (v18+)
- **pnpm** (Package Manager)
- **Go** (v1.23+)

### Installation

1.  Clone the repository.
2.  Install dependencies:

    ```bash
    pnpm install
    ```

    This will also trigger the installation of dependencies for the editor.

### Running the Project

To start the entire development environment (Editor, Engine, and your App), run:

```bash
pnpm dev
```

This command uses `concurrently` to run:
- `dev-engine`: Starts the Go backend (requires `air` for live reload, or standard `go run`).
- `dev-editor`: Starts the Vite dev server for the visual editor on port 8889.
- `dev-app`: Starts the Next.js user application (if initialized).

## Key Features

- **Visual Editing**: Drag-and-drop interface for building React components.
- **AI Integration**: Generate components and images using Gemini AI.
- **Code Export**: Exports clean, production-ready Next.js/React code.
- **Local Storage**: Projects are persisted locally.

## License

ISC
