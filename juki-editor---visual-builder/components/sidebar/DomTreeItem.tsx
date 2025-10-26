import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { AnyCanvasItem, ItemType } from '../../types';
import { ChevronRight, ChevronDown, Type, Component as ComponentIcon, Box } from 'lucide-react';

interface DomTreeItemProps {
    item: AnyCanvasItem;
    depth: number;
}

const DomTreeItem: React.FC<DomTreeItemProps> = ({ item, depth }) => {
    const { selectedItemId, setSelectedItem } = useAppContext();
    const [isExpanded, setIsExpanded] = useState(true);

    const hasChildren = Array.isArray(item.content) && item.content.length > 0;
    const isSelected = selectedItemId === item.id;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };
    
    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedItem(item.id);
    };

    const getIcon = () => {
        if (item.type === ItemType.Component) return <ComponentIcon size={14} className="mr-2 shrink-0 text-purple-400" />;
        if (item.type === ItemType.Element) {
            if (item.tag === 'div') return <Box size={14} className="mr-2 shrink-0 text-sky-400" />;
            return <Type size={14} className="mr-2 shrink-0 text-blue-400" />;
        }
        return <div className="w-[14px] mr-2 shrink-0" />;
    };

    return (
        <div>
            <div 
                onClick={handleSelect}
                className={`flex items-center text-sm p-1.5 my-0.5 rounded cursor-pointer ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}
                style={{ paddingLeft: `${depth * 16}px` }}
            >
                <div className="flex items-center w-5 shrink-0">
                  {hasChildren && (
                      <button onClick={handleToggle} className="p-0.5 rounded hover:bg-slate-600">
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                  )}
                </div>

                {getIcon()}
                <span className="truncate">{item.name}</span>
            </div>
            {isExpanded && hasChildren && (
                <div className="border-l-2 border-slate-700 ml-2">
                    {(item.content as AnyCanvasItem[]).map(child => (
                        <DomTreeItem key={child.id} item={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DomTreeItem;
