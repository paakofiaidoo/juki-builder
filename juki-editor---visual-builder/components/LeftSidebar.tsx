import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { SidebarTabId, DraggableItemSpec, DragItemTypes, PageItem, EditorAccordionId } from '../types';
import { SIDEBAR_TABS, EDITOR_ACCORDION_SECTIONS, ELEMENT_ITEMS, COMPONENT_ITEMS } from '../constants';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import DomTreeItem from './sidebar/DomTreeItem';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

const DraggableSidebarItem: React.FC<{ item: DraggableItemSpec }> = ({ item }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return draggable({
      element: el,
      getData: () => ({ type: DragItemTypes.SIDEBAR_ITEM, spec: item }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [item]);

  return (
    <div
      ref={ref}
      data-is-dragging={isDragging}
      className="flex items-center p-2 mb-2 bg-slate-700/50 rounded-md hover:bg-slate-700"
    >
      <item.icon className="h-4 w-4 mr-2" />
      <span className="text-sm">{item.name}</span>
    </div>
  );
};

const Accordion: React.FC<{ title: string; icon: React.FC<any>; children: React.ReactNode, id: string, openSections: string[], toggleSection: (id: string) => void }> = ({ title, icon: Icon, children, id, openSections, toggleSection }) => {
  const isOpen = openSections.includes(id);
  return (
    <div className="border-b border-slate-700">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-700/50"
      >
        <div className="flex items-center">
            <Icon className="h-4 w-4 mr-2" />
            <span className="font-semibold text-sm">{title}</span>
        </div>
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {isOpen && <div className="p-3 bg-slate-800/50">{children}</div>}
    </div>
  );
};


const LeftSidebar: React.FC = () => {
  const { 
    activeSidebarTab, setActiveSidebarTab, 
    pages, activePageId, setActivePageId, addPage, deleteItem,
    userComponents, selectedItemId, setSelectedItem
  } = useAppContext();
  const [openSections, setOpenSections] = useState<string[]>([EditorAccordionId.Pages, EditorAccordionId.Elements]);

  const toggleSection = (id: string) => {
    setOpenSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleAddPage = () => {
    const pageName = prompt('Enter new page name:', 'New Page');
    if (pageName) {
      addPage(pageName, `/${pageName.toLowerCase().replace(/\s+/g, '-')}`);
    }
  };
  
  const renderEditorTab = () => {
    return (
      <div className="flex-grow overflow-y-auto">
        {EDITOR_ACCORDION_SECTIONS.map(section => {
            if (section.disabled) return null;
            return (
                <Accordion key={section.id} title={section.name} icon={section.icon} id={section.id} openSections={openSections} toggleSection={toggleSection}>
                  {section.id === EditorAccordionId.Pages && (
                     <>
                      {pages.map((page: PageItem) => (
                        <div key={page.id} 
                           className={`flex items-center justify-between p-2 mb-1 rounded-md cursor-pointer ${activePageId === page.id ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
                           onClick={() => setActivePageId(page.id)}>
                            <span className="text-sm truncate">{page.name}</span>
                            {pages.length > 1 && (
                                <button onClick={(e) => { e.stopPropagation(); deleteItem(page.id, null); }} className="p-1 text-red-500 hover:text-red-400 opacity-50 hover:opacity-100">
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                      ))}
                      <button onClick={handleAddPage} className="w-full flex items-center justify-center mt-2 p-2 text-sm bg-green-600 hover:bg-green-700 rounded">
                        <Plus size={16} className="mr-1"/> Add Page
                      </button>
                    </>
                  )}
                  {section.id === EditorAccordionId.Elements && ELEMENT_ITEMS.map(item => <DraggableSidebarItem key={item.id} item={item} />)}
                  {section.id === EditorAccordionId.Components && (
                    <>
                      {COMPONENT_ITEMS.map(item => <DraggableSidebarItem key={item.id} item={item} />)}
                      {userComponents.length > 0 && <h4 className="text-xs font-bold uppercase text-slate-400 mt-4 mb-2">My Components</h4>}
                      {userComponents.map(item => <DraggableSidebarItem key={item.id} item={item} />)}
                    </>
                  )}
                </Accordion>
            );
        })}
      </div>
    );
  };
  
  const renderCodePilotTab = () => {
    // Placeholder for Code Pilot Tab content
    return <div className="p-4 text-slate-400">Code Pilot feature coming soon.</div>
  }

  const renderDomTreeTab = () => {
    const activePage = pages.find(p => p.id === activePageId);

    if (!activePage) {
        return <div className="p-4 text-slate-400 text-sm">Select a page to see its element tree.</div>;
    }

    const isPageSelected = selectedItemId === activePage.id;

    return (
        <div className="flex-grow overflow-y-auto p-2">
            <div 
                onClick={() => setSelectedItem(activePage.id)}
                className={`flex items-center text-sm p-1.5 rounded cursor-pointer ${isPageSelected ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}
            >
                <span className="font-semibold truncate">{activePage.name} (Page)</span>
            </div>
            <div className="mt-1 border-l-2 border-slate-700 ml-2">
                {activePage.children.map(child => (
                    <DomTreeItem key={child.id} item={child} depth={1} />
                ))}
            </div>
        </div>
    );
  };
  
  const renderContent = () => {
    switch (activeSidebarTab) {
      case SidebarTabId.Editor:
        return renderEditorTab();
      case SidebarTabId.DomTree:
        return renderDomTreeTab();
      case SidebarTabId.CodePilot:
        return renderCodePilotTab();
      default:
        return <div className="p-4 text-slate-400">Select a tab</div>;
    }
  };


  return (
    <aside className="w-72 bg-slate-800 border-r border-slate-700 flex flex-col shrink-0">
      <div className="flex items-center justify-center p-3 border-b border-slate-700">
        <h1 className="text-xl font-bold text-slate-100">Juki Editor</h1>
      </div>
      <div className="flex">
        {SIDEBAR_TABS.map(tab => (
          <button
            key={tab.id}
            disabled={tab.disabled}
            onClick={() => setActiveSidebarTab(tab.id)}
            className={`flex-1 flex flex-col items-center p-3 text-xs ${
              activeSidebarTab === tab.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'
            } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={tab.name}
          >
            <tab.icon className="h-5 w-5 mb-1" />
            {tab.name}
          </button>
        ))}
      </div>
      <div className="flex-grow flex flex-col overflow-hidden">
        {renderContent()}
      </div>
    </aside>
  );
};

export default LeftSidebar;