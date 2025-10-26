import { PageItem, ItemType, DraggableItemSpec, SidebarTab, EditorAccordionSection, SidebarTabId, EditorAccordionId } from './types';
import {
    Layout,
    Type,
    MousePointerClick,
    Image as ImageIcon,
    Heading1,
    Box,
    Edit,
    Code,
    GitBranch,
    Braces,
    Store,
    Palette,
    Puzzle,
    Wand2,
    Atom,
    Map,
    LayoutList
} from 'lucide-react';

const INITIAL_PAGE_ID = 'page_1';

export const DEFAULT_INITIAL_PAGE_ID: string = INITIAL_PAGE_ID;

export const INITIAL_PAGES: PageItem[] = [
  {
    id: INITIAL_PAGE_ID,
    parentId: null,
    type: ItemType.Page,
    name: 'Home Page',
    path: '/',
    children: [],
    props: { className: 'flex flex-col items-start gap-4 p-8 bg-slate-50 dark:bg-slate-900' }
  }
];

export const SIDEBAR_TABS: SidebarTab[] = [
  { id: SidebarTabId.Editor, name: 'Editor', icon: Edit },
  { id: SidebarTabId.DomTree, name: 'Elements', icon: LayoutList },
  { id: SidebarTabId.CodePilot, name: 'Code Pilot', icon: Wand2, disabled: false },
  { id: SidebarTabId.States, name: 'States', icon: GitBranch, disabled: true },
  { id: SidebarTabId.API, name: 'API', icon: Braces, disabled: true },
];

export const EDITOR_ACCORDION_SECTIONS: EditorAccordionSection[] = [
  { id: EditorAccordionId.Pages, name: 'Pages', icon: Map },
  { id: EditorAccordionId.Components, name: 'Components', icon: Puzzle },
  { id: EditorAccordionId.Elements, name: 'Elements', icon: Box },
  { id: EditorAccordionId.Modules, name: 'Modules', icon: Atom, disabled: true },
  { id: EditorAccordionId.Marketplace, name: 'Marketplace', icon: Store, disabled: true },
  { id: EditorAccordionId.Theme, name: 'Theme', icon: Palette, disabled: true },
  { id: EditorAccordionId.Icons, name: 'Icons', icon: ImageIcon, disabled: true },
];

export const ELEMENT_ITEMS: DraggableItemSpec[] = [
  {
    id: 'el-div',
    name: 'Container',
    type: ItemType.Element,
    icon: Box,
    itemDefinition: { tag: 'div' },
    defaultProps: { className: 'p-4 border border-dashed border-slate-400 min-h-[50px] min-w-[50px]' },
    defaultContent: [],
  },
  {
    id: 'el-h1',
    name: 'Heading',
    type: ItemType.Element,
    icon: Heading1,
    itemDefinition: { tag: 'h1' },
    defaultProps: { className: 'text-2xl font-bold text-slate-800 dark:text-slate-200' },
    defaultContent: 'Heading Text',
  },
  {
    id: 'el-p',
    name: 'Paragraph',
    type: ItemType.Element,
    icon: Type,
    itemDefinition: { tag: 'p' },
    defaultProps: { className: 'text-base text-slate-600 dark:text-slate-400' },
    defaultContent: 'This is a paragraph. You can edit this text.',
  },
  {
    id: 'el-img',
    name: 'Image',
    type: ItemType.Element,
    icon: ImageIcon,
    itemDefinition: { tag: 'img' },
    defaultProps: { src: 'https://via.placeholder.com/150', alt: 'Placeholder', className: 'w-full' },
  },
];

export const COMPONENT_ITEMS: DraggableItemSpec[] = [
  {
    id: 'comp-button',
    name: 'Button',
    type: ItemType.Component,
    icon: MousePointerClick,
    itemDefinition: { componentType: 'Button' },
    defaultProps: { text: 'Click Me', className: 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600' },
  },
  {
    id: 'comp-card',
    name: 'Card',
    type: ItemType.Component,
    icon: Layout,
    itemDefinition: { componentType: 'Card' },
    defaultProps: { className: 'p-4 bg-white dark:bg-slate-800 shadow-md rounded-lg border border-slate-200 dark:border-slate-700' },
    defaultContent: [
      {
        id: 'el-card-h2',
        name: 'Card Title',
        type: ItemType.Element,
        icon: Heading1,
        itemDefinition: { tag: 'h2' },
        defaultProps: { className: 'text-xl font-semibold mb-2 text-slate-800 dark:text-slate-200' },
        defaultContent: 'Card Title',
      },
      {
        id: 'el-card-p',
        name: 'Card Body',
        type: ItemType.Element,
        icon: Type,
        itemDefinition: { tag: 'p' },
        defaultProps: { className: 'text-slate-600 dark:text-slate-400' },
        defaultContent: 'This is the body content of the card. It provides some details.',
      },
    ],
  },
];