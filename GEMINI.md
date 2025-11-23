# Juki Editor - Project Architecture & Context

## 1. Project Goal

Juki Editor is a web-based, WYSIWYG visual editor for creating user interfaces with React. It provides a Figma-like experience where users can drag, drop, and style elements and components on a canvas. The primary output is not just a visual representation but also production-quality React/JSX code and a portable JSON-based project state.

The application is designed to be entirely client-side, using `localStorage` for project persistence and integrating with the Gemini API for advanced features like component generation from text and JSX parsing.

---

## 2. Core Concepts & Data Model

The entire application state is normalized into a structured, JSON-serializable format. The UI is a direct, reactive representation of this state.

### Main Data Interfaces (`types.ts`)

#### `Project`
This is the top-level object. It contains everything related to a single user project.
```typescript
export interface Project {
  id: string;
  name: string;
  description: string;
  settings: ProjectSettings; // e.g., { useTypeScript: true, ... }
  pages: PageItem[];
  userComponents: DraggableItemSpec[];
}
```

#### `PageItem`
A page is the root container for a screen or view. It has its own props and a list of root-level children.
```typescript
export interface PageItem {
  id: string;
  name:string;
  props: Record<string, any>; // Props for the root div of the page
  children: AnyCanvasItem[];
}
```

#### `AnyCanvasItem` (The UI Tree Node)
This is the core recursive data structure for anything that can be rendered on the canvas. It's a discriminated union of an `Element` or a `Component`.

```typescript
// Base properties for all canvas items
export interface BaseCanvasItem {
  id: string;
  name: string;
  type: ItemType; // 'ELEMENT' or 'COMPONENT'
  props: Record<string, any>; // HTML attributes, component props
  content?: string | AnyCanvasItem[]; // Text content or nested children
}

// An 'Element' is a standard HTML tag
export interface ElementCanvasItem extends BaseCanvasItem {
  type: ItemType.Element;
  tag: string; // e.g., 'div', 'p', 'h1'
}

// A 'Component' is a reusable abstraction
export interface ComponentCanvasItem extends BaseCanvasItem {
  type: ItemType.Component;
  componentType: string; // e.g., 'Button', 'Card'
}

export type AnyCanvasItem = ElementCanvasItem | ComponentCanvasItem;
```

#### `DraggableItemSpec`
This defines an item that can be dragged from the sidebar (a preset or a user-saved component) to be added to the canvas. The `item` property contains the template for the `AnyCanvasItem` to be created.
```typescript
export interface DraggableItemSpec {
  id: string; // Unique ID for the sidebar item itself
  name: string;
  item: Omit<AnyCanvasItem, 'id' | 'name'>; // The template object
}
```
---

## 3. Application Architecture

### 3.1. State Management (`context/AppContext.tsx`)

A single, monolithic React Context is used to manage the entire application state.

-   **Provider:** `AppProvider` wraps the entire application.
-   **State:** It holds `projects`, `activeProject`, `activePageId`, `selectedItemId`, `editingComponentId`, etc.
-   **Actions:** It exposes all state mutation functions (`addItem`, `moveItem`, `updateItemProps`, `runCodePilot`, etc.).
-   **Immutability:** State updates are performed immutably by creating deep copies (`JSON.parse(JSON.stringify(prev))`) of the project state before applying modifications.
-   **Persistence:** `useEffect` hooks are used to write the `projects` list and `activeProject` ID to `localStorage` whenever they change, ensuring state is preserved across sessions.
-   **Derived State:** `useMemo` is used to efficiently compute derived state like `activePage`, `selectedItem`, and `editingComponent` only when their dependencies change.

### 3.2. Rendering Pipeline

The rendering of the canvas follows a clear, top-down, recursive pattern.

1.  **`Canvas.tsx`:** This component acts as the root render surface. It decides whether to render the `activePage` or the `editingComponent`. It also serves as the top-level drop target for adding new items to the root.
2.  **`RenderCanvasItem.tsx`:** This is the recursive workhorse.
    -   It receives a single `item` (`AnyCanvasItem`) object.
    -   It determines what to render:
        -   If `item.type` is `ELEMENT`, it renders the HTML tag specified in `item.tag`.
        -   If `item.type` is `COMPONENT`, it looks up the `item.componentType` in the `componentRegistry` and renders the corresponding React component.
    -   It passes all `item.props` to the rendered element/component.
    -   If `item.content` is an array, it recursively maps over it, rendering a `<RenderCanvasItem />` for each child.
    -   If `item.content` is a string, it's rendered as the text content.
3.  **`componentRegistry.ts`:** A simple object that maps component type strings (e.g., "Button") to their actual React functional components. This allows for a clean separation between the data representation and the implementation.

### 3.3. File Structure

```
src/
├── components/
│   ├── canvas/
│   │   ├── RenderCanvasItem.tsx  # Recursive renderer for canvas items
│   │   └── SelectionWidget.tsx   # Overlay with resize/delete controls
│   ├── setup/
│   │   ├── ProjectSetupPage.tsx  # Initial project selection screen
│   │   └── CreateProjectModal.tsx # Modal for creating new projects
│   ├── sidebar/
│   │   ├── CodePilotPanel.tsx    # AI component generator UI
│   │   ├── DomTreeItem.tsx       # Recursive renderer for the DOM tree view
│   │   └── DraggableSidebarItem.tsx # An item in the "Add" panel
│   ├── shared/
│   │   └── AutocompleteInput.tsx # Reusable input for Tailwind classes
│   ├── App.tsx                 # Root component, main layout logic
│   ├── Canvas.tsx              # The main visual editing area
│   ├── InspectorPanel.tsx      # Right-hand panel for editing props
│   ├── LeftSidebar.tsx         # Left-hand panel with Add, DOM, Pilot tabs
│   └── ...
├── context/
│   └── AppContext.tsx          # Centralized state management
├── utils/
│   ├── code-generator.ts       # Converts JSON state to React code string
│   ├── jsx-parser.ts           # Uses Gemini API to parse JSX string to JSON state
│   ├── pragmatic-dnd.ts        # Abstraction layer for drag-and-drop logic
│   └── ...
├── constants.tsx               # Preset elements and components for the sidebar
├── index.html                  # Main HTML entry point
├── index.tsx                   # React root renderer
└── types.ts                    # All TypeScript interfaces for the data model
```

---

## 4. Key Features & Implementation Details

### 4.1. Drag and Drop System (`@atlaskit/pragmatic-drag-and-drop`)

This is a headless library. The implementation is responsible for all logic and visual feedback.

-   **Global Monitor (`App.tsx`):**
    -   `monitorForElements` is attached once. Its `onDrop` function is the single source of truth for handling completed drop operations.
    -   It inspects the `source.data` (what was dragged) and `location.current.dropTargets[0].data` (where it was dropped).
    -   Based on the `source.type` (`sidebarItem` vs. `canvasItem`), it calls the appropriate context action (`addItem` or `moveItem`).

-   **Item-Level D&D (`RenderCanvasItem.tsx`):**
    -   `draggable` is attached to each rendered item, providing its `id` and `type` as data.
    -   `dropTargetForElements` is also attached. During a drag, its `onDragEnter` and `onDrag` callbacks fire.
    -   **Instruction Logic (`utils/pragmatic-dnd.ts`):** Inside the `onDrag...` callbacks, `getInstruction` is called. This utility uses the hitbox library (`extractTreeInstruction`, `extractClosestEdge`) to determine user intent. The result (e.g., `'make-child'`) is stored in the component's local state.
    -   **Visual Feedback:** The component uses the `instruction` state to render a visual indicator (`BoxDropIndicator` or a custom overlay), showing the user the outcome of their drop.

### 4.2. AI-Powered Features (`@google/genai`)

-   **Code Pilot (`components/sidebar/CodePilotPanel.tsx` & `AppContext.tsx`):**
    -   **Goal:** Generate a new component from a text prompt.
    -   **Process:** The user's prompt is sent to the Gemini API (`gemini-2.5-flash` or `gemini-2.5-pro`).
    -   **System Prompt:** A detailed system instruction is provided to the model, commanding it to respond *only* with a valid JSON object matching the app's `AnyCanvasItem` structure. It includes examples to guide the model's output.
    -   **Result:** The returned JSON text is parsed and added to the project's `userComponents` array.

-   **JSX Importer (`utils/jsx-parser.ts`):**
    -   **Goal:** Convert a string of JSX code into the app's internal `AnyCanvasItem` format.
    -   **Process:** The JSX string is sent to the Gemini API.
    -   **System Prompt:** This prompt is more complex. It instructs the AI to convert JSX to the app's JSON format, with a critical constraint: child elements must be placed in a **stringified JSON array** within the parent's `content` field.
    -   **Post-Processing:** The AI returns a JSON object where `content` fields may be strings of JSON. A recursive client-side function (`recursivelyParseContent`) traverses the received object and calls `JSON.parse()` on any `content` field that is a stringified array, hydrating the structure.

### 4.3. Inspector Panel & Styling

-   When an item is clicked on the canvas, `setSelectedItem(itemId)` is called.
-   `InspectorPanel.tsx` listens for changes to the `selectedItem` object from the context.
-   When a prop is changed in the inspector (e.g., editing the `className`), it calls `updateItemProps(itemId, newProps)`.
-   The `AutocompleteInput` provides suggestions for Tailwind CSS classes, improving developer experience.

---

## 5. Learnings & Key Solutions

-   **D&D Complexity:** The "instruction" pattern is the most important learning. Abstracting the complex geometry and position calculations away into a declarative `getInstruction` function, and then using that instruction to drive both the final state change and the visual feedback, is a robust and maintainable approach.
-   **Centralized vs. Local D&D Logic:** Placing the final drop logic in a single global monitor (`App.tsx`) while keeping the real-time feedback logic (calculating instructions) at the component level (`RenderCanvasItem.tsx`) provides the best of both worlds: centralized control and responsive, localized UI feedback.
-   **AI as a Parser:** Using an LLM to parse code (JSX) into a specific JSON format is a powerful shortcut. However, it can be brittle. The solution of asking the AI to stringify nested content is a clever workaround for the model's difficulty with deeply nested JSON, but it requires careful client-side post-processing and robust error handling in case the AI returns malformed JSON.
-   **State Immutability:** In a complex, nested state tree, ensuring immutability is critical for React's change detection to work correctly. While `JSON.parse(JSON.stringify(...))` is a simple way to create deep clones, for larger-scale applications, using a library like `immer` would be more performant.

## 6. Dependencies

-   **`react`, `react-dom`:** Core UI library.
-   **`@atlaskit/pragmatic-drag-and-drop`:** The core engine for handling drag-and-drop interactions.
-   **`@atlaskit/pragmatic-drag-and-drop-hitbox`:** Companion library for detecting drop intent (nesting vs. reordering).
-   **`@atlaskit/pragmatic-drag-and-drop-react-drop-indicator`:** Provides pre-built visual components for drop indicators.
-   **`@google/genai`:** The official SDK for interacting with the Google Gemini API.
-   **`lucide-react`:** A lightweight and clean icon library.
-   **`@monaco-editor/react`:** A wrapper that integrates the powerful Monaco Editor (from VS Code) into a React application, used for the code view modal.
-   **`tailwindcss` (via CDN):** A utility-first CSS framework used for all styling.
    Perfect — that’s a **major upgrade** to your context for the Juki Editor.

Let’s summarize what the **total context** will now represent when we integrate that prompt with your previous functional goals (like JSX parsing, drag/hover parenting, etc.).

---

### 🧩 **Juki Editor – Total Context Overview (Full System Vision)**

#### **1. Core Identity**

* **Name:** Juki Editor
* **Type:** Web-based visual UI builder for React applications.
* **Aesthetic:** Dark mode — deep blues & grays, vivid green accents, professional developer-friendly look.
* **Goal:** Visually build and manipulate React JSX structures, while maintaining a live underlying data model.

---

#### **2. Layout Overview**

##### **Left Sidebar (Command Center)**

* Header: `Juki Editor`
* **Tabbed Navigation (New)** above main content:

    * Tabs: `Editor` (active), `Code`, `Code Pilot`, `States`, `API`
* **Main Accordion Sections:**

    * **Pages**:

        * Example items: `Home (/)`, `About (about)`
        * Highlight selected, show delete (trash) and expand icons.
        * "+ New Page" button below list.
    * **Components**, **Elements**, **Modules**, **Marketplace**, **Theme**, **Icons** — all collapsible, each with icons.
* Footer: “Juki v1.0” in subtle text.

##### **Canvas (Central Area)**

* Default **welcome state**:

    * Title: *"Welcome to Juki Editor"*
    * Subtitle: *"Drag components from the left sidebar onto the canvas to get started."*
* When populated:

    * Displays **live JSX-rendered components** (e.g., a `Card` with a nested `Button`).
    * Active selection: glowing green border.
* **Interactions:**

    * Drag-and-drop to add components.
    * **Hover >3 seconds over another element** → becomes its child.
    * Moving element away → relationship removed.
    * Realtime sync with JSX model (bi-directional).

##### **Right Inspector Panel**

* Header: `Inspector` (with delete icon).
* **Empty State:** gear icon + message “Select an item…”.
* **Active State (element selected):**

    * Name field (editable).
    * Tabs:

        * **Props** (active by default) — key-value inputs + add/remove prop UI.
        * **Styles** — (future use or simple CSS controls).
    * Actions:

        * "+ Add Prop" button (green).
        * Remove prop (red 'x').

---

#### **3. Functional System Design**

##### **JSX Parsing & Model Sync**

* Use **Babel parser** locally to parse and transform JSX into a **structured internal JSON model**.
* Internal model mirrors the component tree:

  ```json
  {
    "type": "Card",
    "props": { "variant": "outlined" },
    "children": [
      {
        "type": "Button",
        "props": { "text": "Learn More" }
      }
    ]
  }
  ```
* Real-time updates both ways:

    * Editing JSX updates visual canvas.
    * Dragging/adding/modifying elements updates JSX.

##### **Event Handling & Hierarchy**

* Hover > 3 seconds over another element:

    * Temporarily show outline (drop target preview).
    * If held, move dragged element into that parent.
* On exit (moving away):

    * Break parent-child link.

##### **Data Flow**

* Internal state syncs between:

    * **Canvas** ←→ **JSX parser** ←→ **Inspector Panel** ←→ **Sidebar components.**

##### **Future Extensions**

* Code tab → shows generated JSX.
* Code Pilot tab → AI assistant for suggestions.
* States tab → state management UI.
* API tab → REST/GraphQL integration config.

---

#### **4. Visual & UX Details**

* Dark, modern design with glowing accent effects.
* Crisp iconography for all panels.
* Subtle transitions when switching between tabs or selecting elements.
* Smooth drag-and-drop animations.
* Minimal shadows for depth and focus.

---

#### ✅ **Summary:**

When we merge the **functional system goals** (JSX parsing, hover-parenting, event-driven hierarchy) with your **new UI layout prompt**,
we get a **cohesive blueprint** for:

* A **photorealistic dark UI**
* A **structured component system**
* A **functional visual-to-code editor**
* And **intuitive hierarchical manipulation**

---

Would you like me to write this up as a **single “system prompt”** (for AI tools, design handoff, or generation context)?
That would merge both visual and functional aspects into a single concise but powerful description (usable for generation, code, or docs).