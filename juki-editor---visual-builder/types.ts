import { LucideIcon } from 'lucide-react';
import React from 'react';

// Main tabs for the sidebar
export enum SidebarTabId {
  Editor = 'editor',
  DomTree = 'dom-tree',
  CodePilot = 'code-pilot',
  States = 'states',
  API = 'api',
}

// Accordion sections within the Editor tab
export enum EditorAccordionId {
  Pages = 'pages',
  Components = 'components',
  Elements = 'elements',
  Modules = 'modules',
  Marketplace = 'marketplace',
  Theme = 'theme',
  Icons = 'icons',
}

export enum DragItemTypes {
  SIDEBAR_ITEM = 'sidebarItem',
  CANVAS_ITEM = 'canvasItem',
}

export type Instruction = 'reorder-above' | 'reorder-below' | 'reparent';

export interface SidebarTab {
  id: SidebarTabId;
  name: string;
  icon: LucideIcon;
  disabled?: boolean;
}

export interface EditorAccordionSection {
    id: EditorAccordionId;
    name: string;
    icon: LucideIcon;
    disabled?: boolean;
}

export enum ItemType {
  Page = 'page',
  Component = 'component',
  Element = 'element',
}

export interface ProjectItem {
  id: string;
  parentId: string | null; 
  type: ItemType;
  name: string; 
}

export interface PageItem extends ProjectItem {
  type: ItemType.Page;
  path: string;
  children: AnyCanvasItem[];
  props: Record<string, any>;
}

export interface CanvasItem extends ProjectItem {
  props: Record<string, any>;
  content?: string | AnyCanvasItem[];
}

export interface ComponentCanvasItem extends CanvasItem {
  type: ItemType.Component;
  componentType: string;
  content?: AnyCanvasItem[];
}

export interface ElementCanvasItem extends CanvasItem {
  type: ItemType.Element;
  tag: keyof React.JSX.IntrinsicElements;
}

export type AnyProjectItem = PageItem | ComponentCanvasItem | ElementCanvasItem;
export type AnyCanvasItem = ComponentCanvasItem | ElementCanvasItem;


export interface DraggableItemSpec {
  id: string; 
  name: string;
  type: ItemType.Component | ItemType.Element;
  icon: LucideIcon;
  defaultProps: Record<string, any>;
  defaultContent?: string | DraggableItemSpec[]; 
  itemDefinition: { componentType: string } | { tag: keyof React.JSX.IntrinsicElements };
}

export interface ProjectSettings {
  useGitHub: boolean;
  githubUrl?: string;
  useTypeScript: boolean;
  useESLint: boolean;
  useAlias: boolean;
}

export interface ProjectData {
  pages: PageItem[];
  userComponents: DraggableItemSpec[];
  history: PageItem[][];
  historyIndex: number;
  activePageId: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  settings: ProjectSettings;
  data: ProjectData;
}

export interface AppState {
  // Project Management State
  projects: Project[];
  activeProjectId: string | null;

  // Editor State (for the active project)
  pages: PageItem[];
  activePageId: string | null;
  selectedItemId: string | null;
  activeSidebarTab: SidebarTabId;
  zoomLevel: number;
  userComponents: DraggableItemSpec[];
  isPreviewMode: boolean;
  isCodeViewVisible: boolean;
  history: PageItem[][];
  historyIndex: number;
}

export interface AppContextActions {
  // Project Actions
  createProject: (name: string, description: string, settings: ProjectSettings) => void;
  loadProject: (projectId: string) => void;
  unloadProject: () => void;

  // Editor Actions
  setActiveSidebarTab: (tabId: SidebarTabId) => void;
  addPage: (name: string, path: string) => void;
  setActivePageId: (pageId: string | null) => void;
  setSelectedItem: (itemId: string | null) => void;
  addItemToActivePage: (itemSpec: DraggableItemSpec, parentId: string, index?: number) => void;
  moveItem: (draggedItemId: string, targetParentId: string, targetIndex: number) => void;
  updateItemProps: (itemId: string, pageId: string | null, newProps: Record<string, any>) => void;
  updateItemContent: (itemId: string, pageId: string | null, newContent: string) => void;
  deleteItem: (itemId: string, pageId: string | null) => void;
  saveComponent: (name: string) => void;
  togglePreviewMode: () => void;
  toggleCodeView: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export type AppContextType = AppState & AppContextActions;

export type IdGenerator = () => string;