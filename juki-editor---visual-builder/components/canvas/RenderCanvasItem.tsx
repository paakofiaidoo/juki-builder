import React, { useRef, useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { componentRegistry } from '../registry';
import { AnyCanvasItem, ElementCanvasItem, ComponentCanvasItem, ItemType, DragItemTypes, Instruction } from '../../types';
import SelectionWidget from './SelectionWidget';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { getInstruction, attachInstruction } from '../../utils/pragmatic-dnd';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';

interface RenderCanvasItemProps {
  item: AnyCanvasItem;
  pageId: string;
  index: number;
  depth: number;
}

const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

const RenderCanvasItem: React.FC<RenderCanvasItemProps> = ({ item, pageId, index, depth }) => {
  const { setSelectedItem, selectedItemId, isPreviewMode } = useAppContext();
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dropIndicator, setDropIndicator] = useState<Instruction | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSelect = (e: React.MouseEvent) => {
    if (isPreviewMode) return;
    e.stopPropagation(); 
    setSelectedItem(item.id);
  };
  
  const canHaveChildren = item.type === ItemType.Component || (item.type === ItemType.Element && (item.tag === 'div' || item.tag === 'section' || item.tag === 'main'));

  useEffect(() => {
    const element = ref.current;
    if (!element || isPreviewMode) return;

    return combine(
      draggable({
        element,
        getData: () => ({ id: item.id, type: DragItemTypes.CANVAS_ITEM }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        element,
        canDrop: ({ source }) => {
             // A more robust check for descendant dropping would be needed for deeper nesting protection
            return source.data.id !== item.id;
        },
        getData: (args) => {
          return attachInstruction({ id: item.id }, {
            ...args,
            canHaveChildren,
            currentLevel: depth,
          });
        },
        onDragEnter: (args) => {
          setDropIndicator(getInstruction(args.self.data, canHaveChildren));
        },
        onDrag: (args) => {
          setDropIndicator(getInstruction(args.self.data, canHaveChildren));
        },
        onDragLeave: () => {
          setDropIndicator(null);
        },
        onDrop: (args) => {
          const instruction = getInstruction(args.self.data, canHaveChildren);
          console.log('dropped with instruction', instruction);
          setDropIndicator(null);
        },
      })
    );
  }, [item, isPreviewMode, canHaveChildren, depth]);


  const isSelected = selectedItemId === item.id;

  const edge =
    dropIndicator === 'reorder-above'
      ? 'top'
      : dropIndicator === 'reorder-below'
      ? 'bottom'
      : dropIndicator === 'reparent'
      ? 'top' // Reparenting will show indicator on top of the container
      : null;

  const baseClasses = isPreviewMode ? "cursor-default" : "";
  const hoverClasses = isSelected || isPreviewMode ? '' : "hover:outline hover:outline-1 hover:outline-blue-400/50";
  
  const renderChildren = (content: string | AnyCanvasItem[] | undefined) => {
     if (Array.isArray(content)) {
         return content.map((child, i) => <RenderCanvasItem key={child.id} item={child} pageId={pageId} index={i} depth={depth + 1} />)
     }
     return content;
  }
  
  const renderSelectionWidget = () => {
      if (isSelected && !isPreviewMode && isMounted && ref.current) {
          return <SelectionWidget element={ref.current} item={item} />;
      }
      return null;
  }

  const renderItem = () => {
    const isVoid = item.type === ItemType.Element && VOID_ELEMENTS.has(String((item as ElementCanvasItem).tag));
    // FIX: The type for `wrapperProps` was changed to correctly include the `ref` property,
    // which is not part of `React.HTMLAttributes`. This resolves the TypeScript error.
    const wrapperProps: React.AllHTMLAttributes<HTMLDivElement> = {
        ref: ref,
        onClick: handleSelect,
        'data-is-dragging': isDragging,
        style: { 
            position: 'relative', 
            // opacity will be handled by the [data-is-dragging] attribute selector
        },
        className: `${item.props.className || ''} ${baseClasses} ${hoverClasses}`,
    };
    
    // For void elements, we need a wrapper to attach the ref and event handlers
    if (isVoid) {
        delete wrapperProps.className;
        const elementProps = {
            ...item.props,
            className: `${item.props.className || ''} ${baseClasses} ${hoverClasses}`,
        };
        return (
            <div {...wrapperProps} style={{...wrapperProps.style, display: 'inline-block'}}>
                {React.createElement((item as ElementCanvasItem).tag, elementProps)}
                {edge && <DropIndicator edge={edge} />}
                {renderSelectionWidget()}
            </div>
        )
    }

    if (item.type === ItemType.Element) {
        return React.createElement(
            (item as ElementCanvasItem).tag,
            wrapperProps,
            renderChildren((item as ElementCanvasItem).content),
            <DropIndicator edge={edge} />,
            renderSelectionWidget()
        );
    }
    
    if (item.type === ItemType.Component) {
        const compItem = item as ComponentCanvasItem;
        const Component = componentRegistry[compItem.componentType];

        if (!Component) {
            return <div {...wrapperProps} className={`${wrapperProps.className} text-red-500 bg-red-900/20 p-2 rounded`}>Component "{compItem.componentType}" not found.</div>
        }
        
        return (
            <div {...wrapperProps}>
                <Component {...item.props}>{renderChildren(compItem.content)}</Component>
                {edge && <DropIndicator edge={edge} />}
                {renderSelectionWidget()}
            </div>
        );
    }

    return <div className="text-red-500">Unknown item type</div>;
  };

  return renderItem();
};

export default RenderCanvasItem;