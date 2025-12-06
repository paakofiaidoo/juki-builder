# Juki Editor - Brainstorming

## Project Vision: "The WordPress for the AI Internet"

**Core Philosophy**: A tool to build full-stack, enterprise-grade Next.js applications that offers three ways to edit:
1.  **Visual**: Drag-and-drop WYSIWYG (Figma-like).
2.  **Agentic**: AI-driven changes (Code Pilot).
3.  **Code**: Direct access to the underlying Next.js code.

**Strategy**:
-   **Open Ecosystem**: Plugins are open. Users own their code.
-   **Closed Engine**: The "Juki Engine" (Go binary) is proprietary (but free to use locally) to maintain quality and control the core experience.
-   **Traction**: Become the standard "Interface Builder" for AI agents.

**Architecture**:
-   **`.juki` Folder**: Contains the Editor (UI) and the Engine (Logic/CLI).
-   **The Engine**: The brain. Handles CLI actions, project creation, git operations, and "linking" the editor to the target Next.js project.
-   **Target Project**: A standard Next.js application created in the root (or imported).

## Journal of Ideas & Decisions

### 1. Project Scope & Architecture
*   **Q**: What is the target framework?
    *   **Decision**: **Next.js**. It allows for full-stack, enterprise-grade apps.
*   **Q**: How do we handle the "Engine" vs "Editor"?
    *   **Decision**: **Split Architecture**.
        *   `Editor`: Client-side React app (UI).
        *   `Engine`: Local Go binary (CLI/Logic).
        *   `Communication`: **Connect (gRPC over HTTP)**.
*   **Q**: How do we handle CMS?
    *   **Decision**: **PayloadCMS 3.0**. It runs *inside* the user's Next.js app as a set of routes/pages. Juki manages the config.
*   **Q**: Should PayloadCMS be installed by default?
    *   **Decision**: **On-Demand (Plugin)**. Keep the core lean.

### 2. Plugin System (Plugin-First Approach)
*   **Philosophy**: "Don't Gen, Use Plugins".
    *   Instead of asking AI to write Auth code, we use the **NextAuth Plugin**.
    *   The AI's job is to *configure* the plugin, not write it.
*   **Mechanism**: **AST Transformations**. Plugins use the Engine to safely inject code.

### 3. AI & Data Layer
*   **Concept**: The Engine maintains a **Local SQLite Database**.
    *   **Purpose**: To index the user's codebase (symbols, components, exports, routes).
    *   **Why**: The AI needs "Context". It can't read 1000 files every time. The SQLite DB acts as a "Knowledge Graph" for the AI.

### 4. Monetization & Cloud Strategy
*   **Model**: "Freemium Local, Paid Cloud".
*   **Local Version (Free/Community)**: Unlimited local projects. Basic AI.
*   **Cloud Version ($5/mo Subscription)**: One-click deploy to Vercel. GitHub Sync. Unlimited AI. Team Features.
*   **Distribution**:
    *   **Engine Code**: **Private**.
    *   **Engine Binary**: **Public**. Included in the repo (or downloaded via script) so anyone can run it locally.
    *   **Cloud Access**: Via GitHub Login (OAuth).

### 5. Code Generation & AST Strategy
*   **Solution**: **Hybrid Engine (Go + Node.js)**.
    *   **Go Engine**: Orchestrator (Git, SQLite, API).
    *   **Node Worker**: Uses `ts-morph` for safe AST manipulations.

### 6. The "Import Existing Project" Workflow
*   **Strategy**: **"Progressive Juki-fication"**.
    1.  **Clone & Analyze**: Engine clones the repo.
    2.  **Level 1 (Read-Only)**: Show code if too complex.
    3.  **Level 2 (Visual Selection)**: Parse HTML tree for selection.
    4.  **Level 3 (Juki-fication)**: User selects code block -> "Extract to Component".

### 7. The AI Debugger & Type Generator
*   **Problem**: Debugging complex flows (API calls, state) is hard in a visual tool.
*   **Solution**: **Integrated Terminal & AI Console**.
    *   **Terminal Access**: The Editor streams the Next.js terminal output (via WebSocket/Connect) so users can see server logs.
    *   **AI Debugging Flow**:
        1.  User clicks "Debug this Flow".
        2.  AI analyzes the code and *injects* `console.log` statements (using AST) at critical points.
        3.  App runs, logs are captured.
        4.  AI reads the logs, identifies the error (or data structure), and suggests a fix.
    *   **Auto-Typing**:
        1.  AI sees an API response in the logs (e.g., from `fetch('/api/users')`).
        2.  AI generates a TypeScript interface (`interface User { ... }`).
        3.  AI saves it to `types.ts` and updates the component to use it.

### 8. Agentic Onboarding & Auth
*   **The Flow**:
    1.  **Input**: User enters a description (e.g., "A marketplace for vintage shoes").
    2.  **PM Agent**: Analyzes requirements. "You need a CMS, Auth, and a Payment Gateway."
    3.  **Architect Agent**: Proposes a stack (Next.js + Payload + Stripe Plugin).
    4.  **Designer Agent**: Proposes a Theme/Layout.
    5.  **Approval**: User says "Go".
    6.  **Build**: Agents execute the plan in parallel.
*   **Auth Strategy**:
    *   **Free/Local**: **"Bring Your Own Key" (BYOK)**. User enters Gemini/OpenAI key in settings.
    *   **Pro/Cloud**: **Juki Auth**. User logs in (GitHub/Google), and we proxy the requests (we pay the bill).
*   **Design Vibes**: "Awesome, Animated, Memes". The UI should feel alive and fun, not sterile.

### 9. The Command Protocol & Publish Workflow
*   **Token Optimization**:
    *   AI shouldn't write full code. It should send **Commands** to the Engine.
    *   *Example*: `CMD: ADD_COMP { name: "Button", style: "bg-#fff" }`
    *   *Benefit*: Saves tokens, faster, less hallucination.
*   **Indirect Interaction**:
    *   AI talks to Engine -> Engine talks to Code.
    *   AI never touches the file system directly.
*   **Publish Workflow**:
    *   **Draft Mode**: Changes happen in a "Shadow DOM" or temporary state in the Engine.
    *   **Publish Button**: User clicks "Publish" -> Engine commits changes to the actual Next.js files -> Triggers local rebuild.
    *   **Deploy Button**: User clicks "Deploy" -> Engine pushes to GitHub -> Vercel builds.

### 10. State Management & Hooks Strategy
*   **Local State (`useState`)**:
    *   **Visual Panel**: "State Variables" section in the Inspector.
    *   **Action**: User adds `count` (number, default 0).
    *   **Result**: Juki injects `const [count, setCount] = useState(0)` into the component.
*   **Side Effects (`useEffect`)**:
    *   **Visual Panel**: "Effects" section.
    *   **Dependencies**: Multiselect dropdown of available state/props.
    *   **Body**: A mini-code editor (Monaco) for the effect logic.
    *   *Why?* Visualizing arbitrary logic is impossible. Code is best here.
*   **Global State**:
    *   **Recommendation**: **Zustand**. It's simple, hook-based, and unopinionated.
    *   **Plugin**: "Zustand Plugin" creates a `store` folder and exposes a UI to define global slices.

### 11. Data Flow & Fetching Strategy
*   **Server Components (RSC)**:
    *   **Default**: All pages are Server Components by default.
    *   **Fetching**: Users can add a "Data Loader" block (async function) to the page.
    *   **Visual**: These components have a distinct border/badge in the UI.
*   **Client Components**:
    *   **Toggle**: User can toggle "Use Client" in the inspector.
    *   **Fetching**: Standard `useEffect` + `fetch` (or React Query via plugin).
*   **Prop Passing (Parent -> Child)**:
    *   **Visual**: When selecting a child component, the Inspector shows a "Props" section.
    *   **Binding**: User can bind a prop to a variable (State or Server Data) using a "Connect" icon.
*   **Auto-Typing (The "Magic")**:
    *   User doesn't manually define types.
    *   **Workflow**:
        1.  User adds a `fetch('/api/data')`.
        2.  User clicks "Debug/Run".
        3.  AI sees the JSON response in the logs.
        4.  AI generates `interface Data { ... }` and applies it to the variable.

### 12. State Menu & Type Management (New)
*   **The "State Menu"**: A central dashboard (like Redux DevTools) to view all active state.
    *   **Sections**: Local State, Global State (Zustand), API State.
    *   **API State Automations**: For any API call, Juki automatically tracks `isLoading`, `isError`, `data`.
        *   *Implementation*: We wrap fetches in a custom hook or React Query.
*   **The "Type Manager"**:
    *   **UI**: A Tree View showing all defined types in the project.
    *   **Editing**: Click a type -> See fields.
    *   **Type Dropdown**: Next to every field name, a dropdown to select `string`, `number`, `boolean`, or *another custom type*.
    *   **Custom Types**: User can click "Add Type" to define a new interface manually.

## Critical Engineering Review (The "Hard Stuff")

### 1. The "Hybrid Engine" Fragility
*   **Risk**: Spawning Node.js processes from Go is brittle.
*   **Mitigation**: **Persistent Worker**. The Go Engine will spawn a *single* long-running Node process and talk to it via JSON-RPC.

### 2. The "Two-Editor" Problem (Race Conditions)
*   **Risk**: User edits `page.tsx` in VS Code while Juki is trying to write to it.
*   **Mitigation**: **Optimistic Concurrency**. Before writing, the Engine checks the file's hash. If it changed on disk, it aborts the write and reloads the AST.

### 3. Dependency Management Nightmare
*   **Risk**: "Just run npm install" fails if the user uses `pnpm` or has conflicts.
*   **Mitigation**: **Package Manager Detector**. The Engine detects `pnpm-lock.yaml` and uses the correct tool.

### 4. Undo/Redo & Git Workflow
*   **Risk**: Data loss if Juki overwrites files.
*   **Solution**: **Session Branching Strategy**.
    1.  **Start Session**: Create `juki-session-<uuid>`.
    2.  **Atomic Commits**: Every change is a commit.
    3.  **Publish**: Merge to `juki-dev`.

### 5. AST Reliability
*   **Risk**: `ts-morph` fails on syntax errors.
*   **Mitigation**: **Error Recovery**. If parsing fails, degrade to "Code Mode" (Monaco Editor) and show the error.

## Next Steps: Implementation Plan
1.  **Phase 1: The Engine Core (Go)** - Git, SQLite, File Watcher.
2.  **Phase 2: The Hybrid Bridge** - Connect (gRPC) + Node.js Worker (ts-morph).
3.  **Phase 3: The Editor UI** - Visual Canvas, Component Picker.
4.  **Phase 4: The "Juki-fication" Flow** - Import & Parse logic.

## Next.js Editor Pivot (Current Focus)

**Core Goal**: Juki is a **Visual Editor for Next.js**. It is not a generic React editor.
**MVP Requirement**: Visualize and edit pages within a real Next.js project structure (`app` directory).

### Key Issues & Fixes
1.  **Framework Alignment**: The app must reflect Next.js strict structure (Pages, Layouts, Routes).
2.    -   **Visualization**:
    -   Must show the root page (`/`) immediately upon project creation/load.
    -   Must visualize `globals.css` and page modules (CSS) correctly in the sandbox.
    -   **Layouts**: Extract and visualize layouts separately but allow seeing the "whole page" (Layout + Page).
    -   **Parsing Strategy**: Use `nextJsStructure.ts` to identify `layout.tsx` vs `page.tsx` from the file list.
    -   **Editing Model**: Link Pages to Layouts via `layoutId`. Detect nested layouts for future consideration.
3.  **UI Refinements**:
    -   Fix "Create Page Form" transparency.
    -   Fix "Project List" showing deleted projects (validate file existence).
4.  **Feature Flags**:
    -   Move flags out of UI.
    -   Use a simple `features.json` for admin-only toggling.
    -   Enable only MVP features to focus development.

### 13. Next.js App Router Implementation Details (The "Pivot" Architecture)

#### A. The Engine's Role (Heavy Lifting)
*   **Parsing & Indexing**:
    *   The Engine (Go) scans the `app` directory.
    *   It parses all `page.tsx`, `layout.tsx`, and `css` files.
    *   **DB Caching**: It stores the parsed structure (AST/Meta) in the local SQLite DB.
    *   **Change Detection**: It computes a content Hash for each file. On startup/sync, it checks `CurrentHash` vs `StoredHash` to avoid re-parsing unchanged files.
*   **Git Strategy**:
    *   **Branching**: When a project is opened/created, the Engine creates a dedicated `juki-work` branch.
    *   **Safety**: All edits happen on this branch.
*   **Data Feed**:
    *   The Engine sends a fully resolved "Project Graph" to the Editor via gRPC.
    *   The Editor does *not* parse raw files. It renders the API response.

#### B. The Editor's Role (Pure UI)
*   **Visualization**: Receives the "Project Graph" and renders the Sidebar (Pages/Layouts) and Canvas.
*   **Layout Proxying**:
    *   Since the Engine distinguishes Layouts and Pages, the Editor simply renders what it receives.
    *   For the *visual canvas*, we still proxy Layouts as "Page-like" entities to reuse the DnD renderer.
*   **Sandbox**:
    *   The sandbox receives injected styles and structure pre-processed by the Engine.

#### C. Sidebar Organization
*   **Split View**: "Pages" and "Layouts" are listed separately in `PagesPanel.tsx`.
*   **Selection**: Mutually exclusive selection (selecting a Layout deselects the Page).

### 14. Confirmed UX Decisions (User Input)
*   **Dynamic Routes**:
    *   **Structure**: Routes are managed as a **Tree**.
    *   **Creation**: When creating a node (page/route), the user explicitly selects the type (Static vs Dynamic) via a specific UI (e.g., Radio Button).
    *   **Validation**: User must confirm when creating a dynamic route or sub-route.
    *   **Engine Sync**: The Engine provides the initial tree (bootstrapped from `app` folder).
*   **Layout Visualization**:
    *   **Toggle**: A "With/Without Layout" toggle in the toolbar allows users to switch between seeing the isolated Page or the Page within its Layout context.
*   **Event Handling (Interaction)**:
    *   **Handlers Tab**: A new tab in the Inspector (alongside Props/Styles) called **"Handlers"**.
    *   **Functionality**: Assign actions to events (e.g., `onClick`).
    *   **Types**: Route Navigation, API Calls, Data Mutation, Custom Functions, Form Submit.
*   **Data Usage**:
### 15. Repository & Infrastructure Strategy (Modular Submodules)

**The Vision**:
*   **Goal**: Strict modularity. Users/Devs should be able to clone *just* the Editor or *just* the Engine if needed.
*   **Distribution**: The entire Juki toolchain lives inside the `.juki` folder of a user's project.
*   **Mechanism**: **Git Submodules**. The main repo is a thin orchestrator.

**Approved Directory Structure**:
```
juki-builder/ (Orchestrator Repo)
└── .juki/                 # The Container
    ├── editor/            # [Submodule] -> juki-editor (React Frontend)
    ├── engine/            # [Submodule] -> juki-engine (Go Backend)
    └── protos/            # [Submodule] -> juki-protos (Shared Types)
```

**Workflow**:
1.  **Isolation**: Each folder (`editor`, `engine`, `protos`) is a distinct Git repository.
2.  **Synchronization**:
    *   **Protos**: Changes are pushed to `juki-protos`.
    *   **Engine/Editor**: They pull the latest `protos` (or specific version).
    *   **Juki Builder**: This parent repo effectively just points to specific commits of the submodules (a "bill of materials").
3.  **Development**:
    *   We work inside `.juki/`.
    *   Commits are made to the individual submodule repos.
    *   We synchronize them carefully to ensure the Editor and Engine versions are compatible.

### 16. Protocol Buffers Workflow (Expert Recommendation)

**The Confusion**: "Should we use generated files (`buf generate`) or the Buf SDK (`go get buf.build...`)?"

**The Verdict**: **Hybrid Approach**.
1.  **For Active Development (Local Gen)**:
    *   **Why**: You need instant feedback. Initializing a "Publish -> Wait -> Update" loop for every typo fix is too slow.
    *   **How**:
        *   We keep a script (e.g., `./gen.sh`) in the root.
        *   It runs `buf generate` and outputs code *directly* into the `.juki/editor` and `.juki/engine` directories.
        *   We adds these patterns to `.gitignore` so we don't commit generated code to the repos (optional, but cleaner).
2.  **For Production/Release (Remote SDK)**:
    *   **Why**: Stability and immutable versioning.
    *   **How**: When you merge a PR in `protos`, CI pushes it to the **Buf Schema Registry (BSR)**.
    *   External consumers (or your production builds) can use `go get buf.build/...` to ensure they use a "frozen" version.

**Recommended "Dev" Setup**:
```bash
# In juki-builder root
/scripts/gen-protos.sh
# -> Reads .juki/protos
# -> Writes to .juki/engine/gen/go/...
# -> Writes to .juki/editor/src/gen/ts/...
```
### 17. Licensing & Monetization Strategy (Consultation)

**The Goal**: "Monetize but partly Open Source."

**Option A: The "Open Core" Model (Recommended for Growth)**
*   **License**: **Apache 2.0** or **MIT** (Permissive).
*   **What's Free**: The Editor UI, the basic Engine, standard components.
*   **Monetization**:
    *   **Cloud Hosting**: "Juki Cloud" - You host the Engine/DB/Git so they don't have to.
    *   **Enterprise Features**: SSO (Okta/SAML), Role-Based Access Control (RBAC), Audit Logs, Multi-player Collaboration.
    *   **Marketplace**: Take a % of sales from premium templates/components.
*   **Pros**: Maximize adoption. Developers love MIT tools.
*   **Cons**: AWS/Google could theoretically host it (but unlikely to compete on niche).

**Option B: The "Dual License" / Protectionist Model**
*   **License**: **AGPL v3** (Viral Copyleft).
*   **Terms**: "Free if you are also Open Source. Paid if you are Proprietary."
*   **Monetization**: Selling "Commercial Licenses" to companies who can't use AGPL software.
*   **Pros**: Prevents competitors from forking and reselling your SaaS.
*   **Cons**: Scares away adoption. Many corporate legal teams ban AGPL tools entirely.

### 18. Cloud/Enterprise Repository Strategy (The "Wrapper" Pattern)

**The Question**: "Do I need a second repo for the Cloud/Private code?"
**The Answer**: **Yes**.

**Structure**:
1.  **Public Repo (`juki-builder`)**:
    *   Contains the Engine, Editor, and definitions.
    *   This is what the community uses.
2.  **Private Repo (`juki-cloud`)**:
    *   This is your "SaaS Wrapper".
    *   It imports `juki-engine` as a Go module / library.
    *   It adds **Private Features**:
        *   Stripe/Billing Integration.
        *   Multi-tenant Database logic (Postgres/Supabase instead of SQLite).
        *   User Management (Clerk/Auth0).
        *   Kubernetes/Deployment configs.

**Why Separate?**:
*   **Security**: You never accidentally commit API keys or Stripe logic to the public repo.
*   **Clarity**: The community sees a clean, self-contained tool. You see a complex SaaS platform.

**Development Workflow**:
*   You make a feature in `juki-builder` (Public).
*   You push.
*   You go to `juki-cloud` (Private) and update the `go.mod` to point to the new `juki-builder` version.
*   You deploy `juki-cloud`.


