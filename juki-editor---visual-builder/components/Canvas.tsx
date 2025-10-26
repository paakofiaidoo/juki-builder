import React, { useRef, useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import RenderCanvasItem from './canvas/RenderCanvasItem';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { DragItemTypes } from '../types';

const Canvas: React.FC = () => {
  const { pages, activePageId, zoomLevel, setSelectedItem, selectedItemId } = useAppContext();
  const ref = useRef<HTMLDivElement>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const activePage = pages.find(p => p.id === activePageId);
  
  useEffect(() => {
    const el = ref.current;
    if (!el || !activePageId) return;

    return dropTargetForElements({
      element: el,
      getData: ({ input }) => {
        // When dropping on the canvas, we add to the end of the root children list
        const index = activePage?.children.length ?? 0;
        return { id: activePageId, type: 'page-root', index };
      },
      canDrop: ({ source }) => {
        return source.data.type === DragItemTypes.SIDEBAR_ITEM || source.data.type === DragItemTypes.CANVAS_ITEM;
      },
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: () => setIsDraggedOver(false),
    });

  }, [activePageId, activePage?.children.length]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && activePage) {
      setSelectedItem(activePage.id);
    }
  };

  if (!activePage) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-800/30 p-4">
        <div className="text-center text-slate-500">
          <h2 className="text-2xl font-semibold mb-2">No Page Selected</h2>
          <p>Select a page from the left sidebar or create a new one to start building.</p>
        </div>
      </div>
    );
  }

  const isPageSelected = selectedItemId === activePageId;
  const pageSelectedClasses = isPageSelected ? "outline outline-2 outline-offset-2 outline-blue-500" : "";
  const pageClassName = activePage.props?.className || '';
  const isOverClasses = isDraggedOver ? 'outline outline-2 outline-dashed outline-green-500' : '';

  return (
    <div 
      className="flex-1 bg-slate-800/60 p-4 overflow-auto" 
      onClick={handleCanvasClick}
      style={{ cursor: 'default' }} 
    >
      <div 
        ref={ref}
        className={`mx-auto bg-white dark:bg-slate-900 shadow-2xl rounded-lg transition-all duration-300 ease-in-out relative ${pageClassName} ${pageSelectedClasses} ${isOverClasses}`}
        style={{ 
          transform: `scale(${zoomLevel})`, 
          transformOrigin: 'top left',
          width: '100%', 
          minHeight: 'calc(100vh - 120px)' 
        }}
      >
        {activePage.children.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed border-slate-700 rounded-md relative p-4 pointer-events-none">
            {isDraggedOver && <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-400 rounded-lg z-10" />}
             <h1 className="text-5xl font-extrabold text-slate-100">Welcome to Juki Editor</h1>
             <p className="text-lg text-slate-400 mt-2">This is a visual editor for building web interfaces. Drag components from the left sidebar onto the canvas to get started.</p>
          </div>
        ) : (
          activePage.children.map((item, index) => (
            <RenderCanvasItem key={item.id} item={item} pageId={activePage.id} index={index} depth={0} />
          ))
        )}
      </div>
    </div>
  );
};

export default Canvas;