# Juki Editor - Implementation Plan

## Goal
Build "The WordPress for the AI Internet" - a local-first, AI-powered, visual editor for Next.js applications.

## Phase 1: The Engine Core (Go) - ✅ Complete
**Objective**: Build the "Brain" that runs locally.
- [x] **Scaffold Go Project**: Setup standard Go project structure (`cmd`, `pkg`, `internal`).
- [x] **Implement Connect Server**: Setup HTTP/2 server with Connect-Go.
- [x] **Git Service**: Implement `Clone`, `Pull`, `Push`, `Commit` methods.
- [x] **Branch Manager**: Implement logic to create `juki-session-*` branches and handle merging/squashing.
- [x] **SQLite Integration**: Setup local SQLite DB and schema for project indexing.
- [x] **File Watcher**: Implement `fsnotify` with **Debounce Logic** to handle rapid disk changes.
- [x] **Strict PNPM Enforcer**: Hardcoded `pnpm` logic for reliability (Dynamic managers postponed).
- [x] **Terminal Service**: Safe PTY Runner (Strict PNPM commands) with DB tracking.
- [x] **Activity Logger**: Filtered Activity Logger for mutation auditing.

## Phase 2: The Hybrid Bridge (Go <-> Node) - ✅ Complete
**Objective**: Enable safe AST transformations with robust error handling.
- [x] **Persistent Node Worker**: Go service that spawns a *long-running* Node process via JSON-RPC.
- [x] **Worker Health Check**: Logic to restart the Node worker if it crashes.
- [x] **Gemini Integration**: Using AI for "Creative" parsing and debugging suggestions.
- [x] **Error Recovery**: If AST parsing fails, return a specific error code.

## Phase 3: The Editor UI (React) - 🚧 In Progress
**Objective**: The Visual Interface.
- [ ] **Connect Client**: Generate TypeScript client from Protobufs.
- [ ] **Project Dashboard**: UI to list local projects and "Import from URL".
- [ ] **Visual Canvas**: Implement `iframe` based renderer for the user's app.
- [ ] **Selection Engine**: Logic to map DOM elements back to AST nodes (Source Maps?).
- [ ] **Terminal Console (New)**: VS Code-style bottom panel with `xterm.js` stream.
- [ ] **Activity Viewer (New)**: List view of API mutations (Activity Logs).
- [ ] **State Menu**: Central dashboard to view Local, Global, and API state variables.
- [ ] **Type Manager**: Tree view UI to define/edit TypeScript interfaces with type dropdowns.
- [ ] **Effects Panel**: UI to add `useEffect` hooks with dependency selector and code editor.
- [ ] **Props Panel**: UI to bind parent variables to child props.
- [ ] **Data Loader UI**: Visual block for adding `async` data fetching to Server Components.

## Phase 4: Agentic Onboarding
**Objective**: The "Project Manager" Agent Flow.
- [ ] **Onboarding Wizard**: UI for "Describe your project".
- [ ] **PM Agent**: Prompt chain to analyze description -> output JSON plan (Plugins, Pages, Theme).
- [ ] **Plan Review UI**: Interface for user to approve/tweak the plan.
- [ ] **Execution Engine**: Logic to trigger multiple agents (scaffold, install plugins, generate pages) in parallel.

## Phase 5: The Command Protocol & Publish Flow
**Objective**: Standardize AI-Engine communication and handle State Sync.
- [ ] **Command Parser**: Define JSON schema for commands (e.g., `ADD_COMPONENT`, `UPDATE_STYLE`).
- [ ] **Draft State (SQLite)**: Implement the "Staging" table for pending commands.
- [ ] **Session Branch Logic**: Ensure every command triggers a git commit on the session branch.
- [ ] **Optimistic Concurrency**: Logic to check file hash before writing to disk.
- [ ] **Publish Action**: Merge/Squash Session Branch -> `juki-dev`.
- [ ] **Deploy Action**: Push `juki-dev` -> GitHub.

## Phase 6: The "Import & Juki-fy" Workflow
**Objective**: Handle existing projects.
- [ ] **Import Wizard**: UI to input Git URL and run the clone.
- [ ] **Analyzer**: Logic to scan `package.json` and folder structure.
- [ ] **"Juki-fy" Action**: UI to select a code block and convert it to a component (calling the Node worker).

## Phase 7: Plugins & CMS
**Objective**: The Ecosystem.
- [ ] **Plugin Registry**: Simple JSON file listing available plugins.
- [ ] **PayloadCMS Installer**: Script to `npm install payload` and generate config.
- [ ] **Zustand Plugin**: Script to install `zustand` and generate a basic store.

## Phase 8: The AI Debugger
**Objective**: Intelligent debugging and type generation.
- [ ] **Terminal Stream**: Implement WebSocket/Connect stream to pipe `stdout`/`stderr` from the Next.js process to the Editor UI.
- [ ] **Log Injector**: Node script (using `ts-morph`) to insert `console.log` with unique IDs into user code.
- [ ] **Log Analyzer**: Logic to parse captured logs and feed them to the AI context.
- [ ] **Type Generator**: AI prompt chain to take JSON log data and output TypeScript interfaces.
