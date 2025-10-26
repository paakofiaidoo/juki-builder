import React, { createContext, useState, useCallback, ReactNode, useContext, useEffect } from 'react';
import {
  AppState,
  AppContextActions,
  AppContextType,
  PageItem,
  SidebarTabId,
  ItemType,
  DraggableItemSpec,
  ElementCanvasItem,
  ComponentCanvasItem,
  AnyCanvasItem,
  Project,
  ProjectData,
  ProjectSettings,
} from '../types';
import { Puzzle } from 'lucide-react';

const generateId = (): string => `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const AppContext = createContext<AppContextType | undefined>(undefined);

const convertDraggableSpecsToCanvasItems = (specs: DraggableItemSpec[], parentId: string): AnyCanvasItem[] => {
  return specs.map((spec): AnyCanvasItem => {
      const newItemId = generateId();
      const canvasItemBase = {
          id: newItemId,
          parentId: parentId,
          name: spec.name,
          props: { ...spec.defaultProps },
      };

      let nestedContent: string | AnyCanvasItem[] | undefined;
      if (Array.isArray(spec.defaultContent)) {
          nestedContent = convertDraggableSpecsToCanvasItems(spec.defaultContent as DraggableItemSpec[], newItemId);
      } else if (typeof spec.defaultContent === 'string') {
          nestedContent = spec.defaultContent;
      }

      if (spec.type === ItemType.Element && 'tag' in spec.itemDefinition) {
          return {
              ...canvasItemBase,
              type: ItemType.Element,
              tag: spec.itemDefinition.tag,
              content: nestedContent,
          } as ElementCanvasItem;
      } else if (spec.type === ItemType.Component && 'componentType' in spec.itemDefinition) {
          return {
              ...canvasItemBase,
              type: ItemType.Component,
              componentType: spec.itemDefinition.componentType,
              content: Array.isArray(nestedContent) ? nestedContent : undefined,
          } as ComponentCanvasItem;
      }
      throw new Error(`Invalid DraggableItemSpec: ${spec.name}`);
  });
};

// Recursive helper to find and remove an item
const findAndRemove = (items: AnyCanvasItem[], itemId: string): { items: AnyCanvasItem[], foundItem: AnyCanvasItem | null } => {
    let foundItem: AnyCanvasItem | null = null;
    const remainingItems: AnyCanvasItem[] = [];

    for (const item of items) {
        if (item.id === itemId) {
            foundItem = item;
            continue;
        }
        if (item.content && Array.isArray(item.content)) {
            const result = findAndRemove(item.content, itemId);
            if (result.foundItem) {
                foundItem = result.foundItem;
            }
            remainingItems.push({ ...item, content: result.items });
        } else {
            remainingItems.push(item);
        }
    }
    return { items: remainingItems, foundItem };
};

// Recursive helper to find a parent and insert an item
const findAndInsert = (items: AnyCanvasItem[], parentId: string, itemToInsert: AnyCanvasItem, index: number): AnyCanvasItem[] => {
    return items.map(item => {
        if (item.id === parentId) {
            const newContent = Array.isArray(item.content) ? [...item.content] : [];
            newContent.splice(index, 0, { ...itemToInsert, parentId });
            return { ...item, content: newContent };
        }
        if (item.content && Array.isArray(item.content)) {
            return { ...item, content: findAndInsert(item.content, parentId, itemToInsert, index) };
        }
        return item;
    });
};

const convertCanvasItemToSpec = (item: AnyCanvasItem): DraggableItemSpec => {
    const specBase = {
      id: `user-comp-${generateId()}`,
      name: item.name,
      icon: Puzzle,
      defaultProps: { ...item.props },
    };

    if (item.type === ItemType.Element) {
        let defaultContent: string | DraggableItemSpec[] | undefined;
        if (Array.isArray(item.content)) {
            defaultContent = item.content.map(convertCanvasItemToSpec);
        } else if (typeof item.content === 'string') {
            defaultContent = item.content;
        }

        return {
            ...specBase,
            type: ItemType.Element,
            itemDefinition: { tag: item.tag },
            defaultContent: defaultContent,
        };
    } else if (item.type === ItemType.Component) {
        let defaultContent: DraggableItemSpec[] | undefined;
        if (Array.isArray(item.content)) {
            defaultContent = item.content.map(convertCanvasItemToSpec);
        }

        return {
            ...specBase,
            type: ItemType.Component,
            itemDefinition: { componentType: item.componentType },
            defaultContent: defaultContent,
        };
    }
    throw new Error("Cannot convert item to spec: unknown type");
};


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Global state for projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Editor state for the active project
  const [pages, setPages] = useState<PageItem[]>([]);
  const [history, setHistory] = useState<PageItem[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [activePageId, setActivePageIdState] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemIdState] = useState<string | null>(null);
  const [activeSidebarTab, setActiveSidebarTabState] = useState<SidebarTabId>(SidebarTabId.Editor);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [userComponents, setUserComponents] = useState<DraggableItemSpec[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isCodeViewVisible, setIsCodeViewVisible] = useState(false);

  // Effect to save editor state back to the active project whenever it changes
  useEffect(() => {
    if (!activeProjectId) return;

    setProjects(currentProjects => {
      return currentProjects.map(p => {
        if (p.id === activeProjectId) {
          return {
            ...p,
            data: { pages, userComponents, history, historyIndex, activePageId }
          };
        }
        return p;
      });
    });
  }, [pages, userComponents, history, historyIndex, activePageId, activeProjectId]);

  const loadProject = useCallback((projectId: string) => {
    const projectToLoad = projects.find(p => p.id === projectId);
    if (projectToLoad) {
      const { data } = projectToLoad;
      setPages(data.pages);
      setUserComponents(data.userComponents);
      setHistory(data.history);
      setHistoryIndex(data.historyIndex);
      setActivePageIdState(data.activePageId);
      setSelectedItem(data.activePageId);
      setIsPreviewMode(false);
      setIsCodeViewVisible(false);
      setActiveSidebarTabState(SidebarTabId.Editor);
      setActiveProjectId(projectId);
    }
  }, [projects]);

  const createProject = useCallback((name: string, description: string, settings: ProjectSettings) => {
    const newProjectId = generateId();
    const newInitialPageId = generateId();
    const newInitialPages: PageItem[] = [
      {
        id: newInitialPageId,
        parentId: null,
        type: ItemType.Page,
        name: 'Home Page',
        path: '/',
        children: [],
        props: { className: 'flex flex-col items-start gap-4 p-8 bg-slate-50 dark:bg-slate-900' }
      }
    ];
    
    const newProjectData: ProjectData = {
      pages: newInitialPages,
      userComponents: [],
      history: [newInitialPages],
      historyIndex: 0,
      activePageId: newInitialPageId,
    };

    const newProject: Project = { id: newProjectId, name, description, settings, data: newProjectData };
    
    setProjects(prev => [...prev, newProject]);
    loadProject(newProjectId);

  }, [loadProject]);

  const unloadProject = useCallback(() => {
    setActiveProjectId(null);
    setPages([]);
    setUserComponents([]);
    setHistory([[]]);
    setHistoryIndex(0);
    setActivePageIdState(null);
    setSelectedItem(null);
  }, []);
  
  const setActiveSidebarTab = useCallback((tabId: SidebarTabId) => {
    setActiveSidebarTabState(tabId);
  }, []);
  
  const togglePreviewMode = useCallback(() => setIsPreviewMode(prev => !prev), []);
  const toggleCodeView = useCallback(() => setIsCodeViewVisible(prev => !prev), []);

  const addPage = useCallback((name: string, path: string) => {
    const newPage: PageItem = {
      id: generateId(),
      parentId: null,
      type: ItemType.Page,
      name,
      path,
      children: [],
      props: { className: 'flex flex-col items-start gap-4 p-8 bg-slate-50 dark:bg-slate-900' }
    };
    setPages(prevPages => {
      const newPages = [...prevPages, newPage];
      const newHistory = [...history.slice(0, historyIndex + 1), newPages];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      return newPages;
    });
    setActivePageIdState(newPage.id);
    setSelectedItemIdState(newPage.id);
  }, [history, historyIndex]);

  const setActivePageId = useCallback((pageId: string | null) => {
    setActivePageIdState(pageId);
    setSelectedItemIdState(pageId); 
  }, []);
  
  const setSelectedItem = useCallback((itemId: string | null) => {
    setSelectedItemIdState(itemId);
  }, []);
  
  const updateItemRecursive = <T extends AnyCanvasItem,>(
    items: T[], 
    itemId: string, 
    updateFn: (item: T) => T
  ): T[] => {
    return items.map(item => {
      if (item.id === itemId) {
        return updateFn(item);
      }
      if (item.content && Array.isArray(item.content)) {
        const updatedContent = updateItemRecursive(item.content as T[], itemId, updateFn);
        return { ...item, content: updatedContent };
      }
      return item;
    });
  };

  const deleteItemRecursive = (items: AnyCanvasItem[], itemId: string): AnyCanvasItem[] => {
    const filteredItems = items.filter(item => item.id !== itemId);
    return filteredItems.map(item => {
        if (item.content && Array.isArray(item.content)) {
            return { ...item, content: deleteItemRecursive(item.content, itemId) };
        }
        return item;
    });
  };
  
  const addItemToActivePage = useCallback((itemSpec: DraggableItemSpec, targetParentId: string, index?: number) => {
    if (!activePageId) return;

    const newItemId = generateId();
    let newItem: AnyCanvasItem;

    if (itemSpec.type === ItemType.Element && 'tag' in itemSpec.itemDefinition) {
      const newElementItem: ElementCanvasItem = {
        id: newItemId,
        parentId: targetParentId,
        type: ItemType.Element,
        name: itemSpec.name,
        tag: itemSpec.itemDefinition.tag,
        props: { ...itemSpec.defaultProps },
      };
       if (Array.isArray(itemSpec.defaultContent)) {
         newElementItem.content = convertDraggableSpecsToCanvasItems(itemSpec.defaultContent as DraggableItemSpec[], newItemId);
       } else if(typeof itemSpec.defaultContent === 'string') {
         newElementItem.content = itemSpec.defaultContent;
       }
       newItem = newElementItem;
    } else if (itemSpec.type === ItemType.Component && 'componentType' in itemSpec.itemDefinition) {
      const newComponentItem: ComponentCanvasItem = {
        id: newItemId,
        parentId: targetParentId,
        type: ItemType.Component,
        name: itemSpec.name,
        componentType: itemSpec.itemDefinition.componentType,
        props: { ...itemSpec.defaultProps },
      };
      if (Array.isArray(itemSpec.defaultContent)) {
         newComponentItem.content = convertDraggableSpecsToCanvasItems(itemSpec.defaultContent as DraggableItemSpec[], newItemId);
       }
       newItem = newComponentItem;
    } else {
      console.error("Invalid itemSpec provided to addItemToActivePage:", itemSpec);
      return; 
    }
    
    setPages(prevPages => {
      const newPages = prevPages.map(page => {
        if (page.id === activePageId) {
          if (targetParentId === activePageId) {
            const newChildren = [...page.children];
            if (index !== undefined) {
                newChildren.splice(index, 0, newItem);
            } else {
                newChildren.push(newItem);
            }
            return { ...page, children: newChildren };
          } else { 
            const updatedChildren = findAndInsert(page.children, targetParentId, newItem, index ?? 0);
            return { ...page, children: updatedChildren };
          }
        }
        return page;
      });
      const newHistory = [...history.slice(0, historyIndex + 1), newPages];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      return newPages;
    });
    setSelectedItem(newItem.id);
  }, [activePageId, history, historyIndex]);

  const moveItem = useCallback((draggedItemId: string, targetParentId: string, targetIndex: number) => {
      if (!activePageId) return;

      setPages(prevPages => {
          const newPages = prevPages.map(page => {
              if (page.id !== activePageId) return page;
              
              const { items: childrenWithoutDragged, foundItem } = findAndRemove(page.children, draggedItemId);
              if (!foundItem) return page;

              let newChildren;
              if (targetParentId === activePageId) {
                  newChildren = [...childrenWithoutDragged];
                  newChildren.splice(targetIndex, 0, { ...foundItem, parentId: targetParentId });
              } else {
                  newChildren = findAndInsert(childrenWithoutDragged, targetParentId, foundItem, targetIndex);
              }

              return { ...page, children: newChildren };
          });
          const newHistory = [...history.slice(0, historyIndex + 1), newPages];
          setHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);
          return newPages;
      });
  }, [activePageId, history, historyIndex]);


  const updateItemProps = useCallback((itemId: string, pageIdContext: string | null, newProps: Record<string, any>) => {
    const targetPageId = pageIdContext || activePageId;
    if (!targetPageId) return;
  
    setPages(prevPages => {
      const newPages = prevPages.map(page => {
        if (page.id === targetPageId) {
          if (page.id === itemId) {
            const { name, path, ...restProps } = newProps;
            const updatedPage = { ...page };
            if (name !== undefined) updatedPage.name = name;
            if (path !== undefined) updatedPage.path = path;
            updatedPage.props = { ...updatedPage.props, ...restProps };
            return updatedPage;
          }
          const updatedChildren = updateItemRecursive<AnyCanvasItem>(page.children, itemId, item => {
            const { name, ...restProps } = newProps;
            const updatedItem = { ...item };
            if (name !== undefined) updatedItem.name = name;
            updatedItem.props = { ...updatedItem.props, ...restProps };
            return updatedItem;
          });
          return { ...page, children: updatedChildren };
        }
        return page;
      });
      const newHistory = [...history.slice(0, historyIndex + 1), newPages];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      return newPages;
    });
  }, [activePageId, history, historyIndex]);

  const updateItemContent = useCallback((itemId: string, pageIdContext: string | null, newContent: string) => {
    const targetPageId = pageIdContext || activePageId;
    if (!targetPageId) return;
    
    setPages(prevPages => {
      const newPages = prevPages.map(page => {
        if (page.id === targetPageId) {
          const updatedChildren = updateItemRecursive<AnyCanvasItem>(page.children, itemId, item => {
            if (item.type === ItemType.Element && (typeof item.content === 'string' || item.content === undefined)) {
              return { ...item, content: newContent };
            }
            return item; 
          });
          return { ...page, children: updatedChildren };
        }
        return page;
      });
      const newHistory = [...history.slice(0, historyIndex + 1), newPages];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      return newPages;
    });
  }, [activePageId, history, historyIndex]);


  const deleteItem = useCallback((itemId: string, pageIdContext: string | null) => {
    const targetPageId = pageIdContext || activePageId;
    if (!targetPageId) return;
    
    setPages(prevPages => {
        let isPageDeleted = false;
        const newPages = prevPages
        .filter(page => {
            if (page.id === itemId) {
                isPageDeleted = true;
                return false;
            }
            return true;
        })
        .map(page => {
            if (page.id === targetPageId) {
                const updatedChildren = deleteItemRecursive(page.children, itemId);
                return { ...page, children: updatedChildren };
            }
            return page;
        });
        
        if (selectedItemId === itemId) {
            setSelectedItemIdState(null);
        }
        
        if (isPageDeleted && activePageId === itemId) {
            setActivePageIdState(newPages.length > 0 ? newPages[0].id : null);
        }

        const newHistory = [...history.slice(0, historyIndex + 1), newPages];
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);

        return newPages;
    });
  }, [activePageId, selectedItemId, history, historyIndex]);

  const saveComponent = useCallback((name: string) => {
    if (!selectedItemId || !activePageId) {
        alert("Please select an item on the canvas to save.");
        return;
    }
    
    const page = pages.find(p => p.id === activePageId);
    if (!page) return;

    const findItemInTree = (items: AnyCanvasItem[], id: string): AnyCanvasItem | null => {
        for (const item of items) {
            if (item.id === id) return item;
            if (item.content && Array.isArray(item.content)) {
                const found = findItemInTree(item.content, id);
                if (found) return found;
            }
        }
        return null;
    };
    
    const itemToSave = findItemInTree(page.children, selectedItemId);
    if (!itemToSave) {
        alert("Selected item could not be found for saving.");
        return;
    }

    const newComponentSpec = convertCanvasItemToSpec(itemToSave);
    newComponentSpec.name = name; // Override name with user input

    setUserComponents(prev => [...prev, newComponentSpec]);

  }, [selectedItemId, activePageId, pages]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setPages(history[newIndex]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setPages(history[newIndex]);
    }
  }, [history, historyIndex]);
  
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

   useEffect(() => {
    if (activePageId && !pages.find(p => p.id === activePageId)) {
      const newActivePageId = pages.length > 0 ? pages[0].id : null;
      setActivePageIdState(newActivePageId);
      setSelectedItemIdState(newActivePageId);
    }
  }, [pages, activePageId]);


  const contextValue: AppContextType = {
    projects,
    activeProjectId,
    pages,
    activePageId,
    selectedItemId,
    activeSidebarTab,
    zoomLevel,
    userComponents,
    isPreviewMode,
    isCodeViewVisible,
    history,
    historyIndex,
    createProject,
    loadProject,
    unloadProject,
    setActiveSidebarTab,
    addPage,
    setActivePageId,
    setSelectedItem,
    addItemToActivePage,
    moveItem,
    updateItemProps,
    updateItemContent,
    deleteItem,
    saveComponent,
    togglePreviewMode,
    toggleCodeView,
    undo,
    redo,
    canUndo,
    canRedo,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
