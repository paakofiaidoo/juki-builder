import React, { useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import LeftSidebar from './components/LeftSidebar';
import Canvas from './components/Canvas';
import CanvasHeader from './components/CanvasHeader';
import InspectorPanel from './components/InspectorPanel';
import CodeModal from './components/CodeModal';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { AnyCanvasItem, DragItemTypes, DraggableItemSpec, Instruction, PageItem } from './types';
import { findInstruction } from './utils/pragmatic-dnd';
// FIX: Import the missing ProjectSetupPage component.
import ProjectSetupPage from './components/setup/ProjectSetupPage';

const findPathToItem = (
  nodes: (AnyCanvasItem | PageItem)[],
  targetId: string,
  path: (AnyCanvasItem | PageItem)[] = [],
): (AnyCanvasItem | PageItem)[] | null => {
  for (const node of nodes) {
    const currentPath = [...path, node];
    if (node.id === targetId) {
      return currentPath;
    }
    const children = (node as PageItem).children || (node as AnyCanvasItem).content;
    if (Array.isArray(children)) {
      const result = findPathToItem(children, targetId, currentPath);
      if (result) {
        return result;
      }
    }
  }
  return null;
};


const EditorLayout: React.FC = () => {
  const { isCodeViewVisible, addItemToActivePage, moveItem, pages, activePageId } = useAppContext();

  useEffect(() => {
    return monitorForElements({
      onDrop({ location, source }) {
        const target = location.current.dropTargets[0];
        if (!target) {
          return;
        }

        const instruction = findInstruction(target.data);
        const targetId = target.data.id as string;
        
        const isSidebarItem = source.data.type === DragItemTypes.SIDEBAR_ITEM;

        if (isSidebarItem) {
            const spec = source.data.spec as DraggableItemSpec;
            let parentId = targetId;
            let index: number | undefined = undefined;

            if (instruction === 'reparent') {
                parentId = targetId;
                const targetPage = pages.find(p => p.id === activePageId);
                if (targetPage) {
                   const path = findPathToItem(targetPage.children, targetId, []);
                   const targetItem = path ? path[path.length - 1] as AnyCanvasItem : null;
                   if (Array.isArray(targetItem?.content)) {
                       index = targetItem.content.length;
                   }
                }
            } else if (instruction) { // reorder-above or reorder-below
                const targetPage = pages.find(p => p.id === activePageId);
                if (!targetPage) return;
                const path = findPathToItem([targetPage], targetId);

                if (path && path.length > 1) {
                    const parent = path[path.length - 2] as PageItem | AnyCanvasItem;
                    parentId = parent.id;
                    const parentChildren = (parent as PageItem).children || (parent as AnyCanvasItem).content as AnyCanvasItem[];
                    const targetIndex = parentChildren.findIndex(c => c.id === targetId);
                    index = instruction === 'reorder-above' ? targetIndex : targetIndex + 1;
                }
            } else { // Dropped on root canvas
                parentId = activePageId!;
                index = (target.data.index as number | undefined) ?? (pages.find(p=>p.id === activePageId)?.children.length ?? 0)
            }
            addItemToActivePage(spec, parentId, index);

        } else { // CANVAS_ITEM
            const sourceId = source.data.id as string;
            if (!instruction) return;
            
            const targetPage = pages.find(p => p.id === activePageId);
            if (!targetPage) return;

            let parentId = '';
            let index = 0;

            if (instruction === 'reparent') {
                parentId = targetId;
                const path = findPathToItem(targetPage.children, targetId);
                const targetItem = path ? path[path.length - 1] as AnyCanvasItem : null;
                index = Array.isArray(targetItem?.content) ? targetItem.content.length : 0;
            } else {
                 const path = findPathToItem([targetPage], targetId);
                 if (path && path.length > 1) {
                    const parent = path[path.length - 2] as PageItem | AnyCanvasItem;
                    parentId = parent.id;
                    const parentChildren = (parent as PageItem).children || (parent as AnyCanvasItem).content as AnyCanvasItem[];
                    const targetIndex = parentChildren.findIndex(c => c.id === targetId);
                    index = instruction === 'reorder-above' ? targetIndex : targetIndex + 1;
                 } else { // Should not happen for reorder
                     return;
                 }
            }
            moveItem(sourceId, parentId, index);
        }
      },
    });
  }, [addItemToActivePage, moveItem, pages, activePageId]);
  
  return (
      <div className="flex h-screen w-screen overflow-hidden bg-slate-900 text-slate-100">
        <LeftSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <CanvasHeader />
          <Canvas />
        </div>
        <InspectorPanel />
        {isCodeViewVisible && <CodeModal />}
      </div>
  );
};

const AppContent: React.FC = () => {
  const { activeProjectId } = useAppContext();
  
  if (!activeProjectId) {
    return <ProjectSetupPage />;
  }

  return <EditorLayout />;
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;