import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { AnyCanvasItem } from '../../types';
import { manageTailwindClass } from '../../utils/tailwind-helpers';
import { X, Save } from 'lucide-react';

interface SelectionWidgetProps {
  element: HTMLElement;
  item: AnyCanvasItem;
}

const SelectionWidget: React.FC<SelectionWidgetProps> = ({ element, item }) => {
  const { deleteItem, updateItemProps, activePageId, saveComponent } = useAppContext();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const resizeState = useRef<{
    anchor: 'tl' | 'tr' | 'bl' | 'br';
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  useEffect(() => {
    if(element) {
        setDimensions({width: element.offsetWidth, height: element.offsetHeight});
    }
  }, [element]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    deleteItem(item.id, activePageId);
  };
  
  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const name = prompt("Enter a name for your new component:");
    if (name) {
        saveComponent(name);
    }
  };


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, anchor: 'tl' | 'tr' | 'bl' | 'br') => {
    e.stopPropagation();
    e.preventDefault();
    resizeState.current = {
      anchor,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: element.offsetWidth,
      startHeight: element.offsetHeight,
    };
    setDimensions({ width: element.offsetWidth, height: element.offsetHeight });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizeState.current) return;

    const dx = e.clientX - resizeState.current.startX;
    const dy = e.clientY - resizeState.current.startY;
    const { anchor, startWidth, startHeight } = resizeState.current;
    
    let newWidth = startWidth;
    let newHeight = startHeight;

    if (anchor.includes('r')) newWidth = startWidth + dx;
    if (anchor.includes('l')) newWidth = startWidth - dx;
    if (anchor.includes('b')) newHeight = startHeight + dy;
    if (anchor.includes('t')) newHeight = startHeight - dy;

    const finalWidth = Math.max(10, Math.round(newWidth));
    const finalHeight = Math.max(10, Math.round(newHeight));

    setDimensions({ width: finalWidth, height: finalHeight });

    const widthRegex = /^(max-|min-)?w-/;
    const heightRegex = /^(max-|min-)?h-/;

    const currentClassName = item.props.className || '';
    let newClassName = manageTailwindClass(currentClassName, widthRegex, `w-[${finalWidth}px]`);
    newClassName = manageTailwindClass(newClassName, heightRegex, `h-[${finalHeight}px]`);
    
    updateItemProps(item.id, activePageId, { className: newClassName });

  }, [item, activePageId, updateItemProps]);

  const handleMouseUp = useCallback(() => {
    resizeState.current = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);


  return (
    <>
      <div className="selection-border" />
      <div className="selection-action-button" onClick={handleDelete} title="Delete Element">
        <X size={14} />
      </div>
      <div className="selection-action-button-save" onClick={handleSave} title="Save as Component">
        <Save size={14} />
      </div>
      <div className="selection-anchor selection-anchor-tl" onMouseDown={(e) => handleMouseDown(e, 'tl')} />
      <div className="selection-anchor selection-anchor-tr" onMouseDown={(e) => handleMouseDown(e, 'tr')} />
      <div className="selection-anchor selection-anchor-bl" onMouseDown={(e) => handleMouseDown(e, 'bl')} />
      <div className="selection-anchor selection-anchor-br" onMouseDown={(e) => handleMouseDown(e, 'br')} />
      {resizeState.current && (
        <div className="absolute -bottom-6 right-0 bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none">
            W: {dimensions.width}px, H: {dimensions.height}px
        </div>
      )}
    </>
  );
};

export default SelectionWidget;