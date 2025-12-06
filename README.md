# Juki Builder

**Juki Builder** is an open-source, visual no-code tool designed to help you build Next.js applications directly from your browser. It combines a sophisticated WYSIWYG editor with a robust Go backend engine to generate production-ready code.

## Project Structure

The project uses a modular submodule architecture within the `.juki` directory:

-   **`.juki/editor` (Frontend)**: React+Vite visual editor (TypeScript).
-   **`.juki/engine` (Backend)**: Go engine for parsing, caching, and Git operations.
-   **`.juki/protos` (Definitions)**: Shared Protocol Buffers (Source of Truth).

## Getting Started

### Prerequisites

-   **Node.js** (v18+)
-   **pnpm**
-   **Go** (v1.25+)

### Installation

1.  Clone the repository with submodules:
    ```bash
    git clone --recursive <repo-url>
    ```
2.  Install dependencies:
    ```bash
    pnpm install
    ```

### Development

Start the full stack (Editor + Engine) concurrently:

```bash
pnpm dev
```

*   **Engine**: Runs on `:8080` (Hot-reload via `go tool air`).
*   **Editor**: Runs on `:8889`.

### Proto Generation

If you modify files in `.juki/protos`, regenerate the code (Go & TS) with:

```bash
pnpm gen:protos
```

## License

Apache License 2.0
