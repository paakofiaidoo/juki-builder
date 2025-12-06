# Juki Editor: White Paper & Technical Documentation

> **"The WordPress for the AI Internet"**

## 1. Executive Summary

**Juki Editor** is a local-first, AI-powered visual development environment designed to bridge the gap between high-fidelity design and production-quality code. Unlike traditional "no-code" tools that lock users into proprietary platforms, Juki operates directly on your local filesystem, manipulating standard React/Next.js code. It combines the ease of drag-and-drop visual editing with the power of direct code manipulation, all orchestrated by an intelligent "Hybrid Engine."

**Mission:** To democratize software creation by allowing anyone to build complex, production-ready web applications visually, without sacrificing code quality or developer ownership.

---

## 2. Business Case

### 2.1 The Problem
*   **The "No-Code" Trap:** Tools like Webflow or Bubble offer speed but lock users into their hosting and proprietary data models. You cannot "eject" clean code.
*   **The "Code" Barrier:** Traditional coding is slow and has a high barrier to entry. AI coding assistants (Copilot, Cursor) help write code but don't provide a visual feedback loop or high-level architectural guidance.
*   **The Disconnect:** Designers work in Figma, Developers work in VS Code. The translation process is manual, error-prone, and expensive.

### 2.2 The Solution: Juki Editor
Juki sits in the middle. It is a **Visual IDE** that reads and writes standard code.
*   **No Vendor Lock-in:** Your project is just a Next.js folder on your disk. You can open it in VS Code at any time.
*   **AI-Native:** "Code Pilot" allows users to generate components and layouts using natural language, which Juki compiles into visual elements.
*   **Hybrid Architecture:** A high-performance Go engine handles heavy lifting (Git, File Watching), while a Node.js worker handles complex AST (Abstract Syntax Tree) transformations, ensuring generated code is safe and idiomatic.

### 2.3 Market Opportunity
*   **Target Audience:** Freelancers, Agencies, and Frontend Developers who want to speed up their workflow. "Citizen Developers" who want to build real apps, not prototypes.
*   **Value Proposition:** Build 10x faster visually, deploy anywhere (Vercel, Netlify, AWS), own your code forever.

---

## 3. Product Requirements

### 3.1 Core Features
*   **Visual Canvas:** A WYSIWYG editor where users can drag, drop, and style components.
*   **Direct Code Manipulation:** Changes on the canvas update the code (AST) in real-time. Changes in the code update the canvas.
*   **Code Pilot (AI):** A sidebar assistant that generates React components from text prompts (e.g., "Create a pricing card with a gradient background").
*   **Project Dashboard:** Manage multiple local projects, import from Git, or create new Next.js apps.
*   **Plugin System:** Extensible architecture allowing third-party plugins (e.g., CMS integrations, UI kits).

### 3.2 User Stories
*   *As a user, I want to drag a 'Button' from the sidebar and drop it into a 'Card' on the canvas.*
*   *As a developer, I want to edit the `className` prop in the inspector and see the code update in `page.tsx`.*
*   *As a beginner, I want to type "Landing page for a coffee shop" and have Juki generate the initial layout.*

---

## 4. Technical Architecture

Juki employs a **Hybrid Architecture** to balance performance (Go) with ecosystem compatibility (Node.js/TypeScript).

### 4.1 The Engine Core (Go)
*   **Role:** The central nervous system.
*   **Responsibilities:**
    *   **File Watching:** Monitors the filesystem for changes using `fsnotify` (debounced).
    *   **Git Operations:** Manages version control (Clone, Commit, Branching) internally.
    *   **Database:** Uses SQLite to index project metadata and state.
    *   **API:** Exposes a gRPC (Connect-Go) server for the frontend.
*   **Location:** `.juki/engine`

### 4.2 The Hybrid Bridge (Go <-> Node)
*   **Role:** The translator.
*   **Mechanism:** The Go Engine spawns a persistent Node.js worker process. They communicate via **JSON-RPC** over `stdin`/`stdout`.
*   **Why?** Go is great for systems, but JavaScript/TypeScript tools (like `ts-morph`, `prettier`) are best for manipulating JS/TS code.
*   **Capabilities:**
    *   **AST Transformations:** Safely parsing and modifying source code.
    *   **Plugin Execution:** Running NPM-based plugins.
    *   **Project Scaffolding:** Running `create-next-app`.

### 4.3 The Editor UI (Next.js)
*   **Role:** The user interface.
*   **Stack:** Next.js 14 (App Router), Tailwind CSS, TypeScript.
*   **Communication:** Connects to the Engine via gRPC-Web (`@connectrpc/connect-web`).
*   **Key Components:**
    *   **Canvas:** Renders the user's app (likely via iframe or direct render).
    *   **Inspector:** Property and style editor.
    *   **Code Pilot:** Chat interface for AI generation.

### 4.4 Data Flow
1.  **User Action:** User drops a button on the canvas.
2.  **Frontend:** Sends `UpdatePageRequest` to Go Engine (gRPC).
3.  **Engine:** Receives request, logs it to SQLite.
4.  **Bridge:** Engine sends `transform_ast` command to Node Worker (JSON-RPC).
5.  **Worker:** Uses `ts-morph` to inject `<Button />` into `page.tsx`.
6.  **File System:** File is written to disk.
7.  **Watcher:** Engine detects file change (via `fsnotify`).
8.  **Sync:** Engine streams `FileEvent` to Frontend via gRPC.
9.  **Frontend:** AppContext receives event, triggers `syncProject` to refresh UI.

---

## 5. Roadmap & Status

### ✅ Phase 1: The Engine Core (Complete)
*   Go project structure established.
*   gRPC Server (Connect) implemented.
*   Git Service & Branch Manager active.
*   SQLite integration & File Watcher running.

### ✅ Phase 2: The Hybrid Bridge (Complete)
*   Persistent Node Worker implemented.
*   JSON-RPC protocol defined.
*   Project Creation logic (`create-next-app`) wired.
*   Plugin/CMS installation protocol defined.

### 🚧 Phase 3: The Editor UI (In Progress)
*   Next.js App scaffolded.
*   gRPC Clients generated.
*   Visual Canvas & Inspector basics implemented.
*   **Real-time File Sync** (File Watcher + gRPC Streaming) active.
*   **API Key Management** implemented.

### 📅 Future Phases
*   **Phase 4:** Agentic Onboarding ("Swarm" Multi-Agent System).
*   **Phase 5:** CMS Integration (Headless CMS bindings).
*   **Phase 6:** Command Protocol & Publish Flow.
*   **Phase 7:** Plugin Ecosystem.

---

## 6. Contribution Guide

### Prerequisites
*   Go 1.21+
*   Node.js 18+
*   NPM

### Running the Engine
```bash
cd .juki/engine
go run ./cmd/main.go
```

### Running the Editor
```bash
cd editor
npm run dev
```

### Generating Protos
If you modify `protos/engine.proto`:
```bash
buf generate
```

## 7. Technical FAQ & Learnings

### Q: How does Juki handle real-time sync with external editors (VS Code)?
**A:** Juki uses a hybrid file watching approach. The Go Engine uses `fsnotify` to watch the project directory. When a file changes, it debounces the event and streams it via gRPC (`SubscribeToFileEvents`) to the Frontend. The React `AppContext` listens to this stream and triggers a smart re-fetch of the project state.

### Q: Why use a "Hybrid Engine" (Go + Node.js)?
**A:** Go provides low-latency system operations (File Watcher, Git, DB, HTTP Server). However, manipulating JavaScript/TypeScript ASTs (Abstract Syntax Trees) is best done in JavaScript tools like `ts-morph` or `babel`. Juki uses a persistent Node.js worker managed by Go to handle these code transformations safely.

### Q: How do we handle complex dependencies?
**A:** We learned that mixing package managers leads to "ghost dependency" issues. Juki enforces `pnpm` for its internal monorepo to ensure distinct node_module structures.

### Q: What about Protobuf versioning?
**A:** We strictly pin `@bufbuild/protobuf` to v1.10.1 to match `@connectrpc/connect` v1.x requirements, avoiding runtime incompatibilities with modern Protobuf v2 generators (for now).

---
