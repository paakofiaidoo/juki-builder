import React, { useState, useEffect, ChangeEvent } from 'react';
import { useAppContext } from '../context/AppContext';
import { PageItem, ItemType, AnyCanvasItem, ElementCanvasItem } from '../types';
import { Trash2, Edit3, Settings, Type, Brush, Plus, X, Component } from 'lucide-react';
import { manageTailwindClass } from '../utils/tailwind-helpers';
import AutocompleteInput from './shared/AutocompleteInput';
import { TAILWIND_CLASSES } from '../utils/tailwind-classes';

const InspectorPanel: React.FC = () => {
  const { selectedItemId, pages, activePageId, updateItemProps, updateItemContent, deleteItem } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'props' | 'styles'>('props');
  const [editableProps, setEditableProps] = useState<Record<string, any>>({});
  const [editableContent, setEditableContent] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [newPropKey, setNewPropKey] = useState('');
  const [newPropValue, setNewPropValue] = useState('');

  const selectedItem = React.useMemo(() => {
    if (!selectedItemId) return null;
    
    const page = pages.find(p => p.id === activePageId);
    if (!page) {
        const directPageMatch = pages.find(p => p.id === selectedItemId);
        if (directPageMatch && directPageMatch.type === ItemType.Page) return directPageMatch;
        return null;
    }

    if (selectedItemId === activePageId || selectedItemId === page.id) {
      return page;
    }
    
    const findInTree = (items: AnyCanvasItem[]): AnyCanvasItem | null => {
      for (const item of items) {
        if (item.id === selectedItemId) return item;
        if (item.content && Array.isArray(item.content)) {
          const found = findInTree(item.content);
          if (found) return found;
        }
      }
      return null;
    };
    return findInTree(page.children);
  }, [selectedItemId, pages, activePageId]);

  useEffect(() => {
    if (selectedItem) {
      setItemName(selectedItem.name);
      const props = (selectedItem as AnyCanvasItem | PageItem).props || {};
      setEditableProps(props);
      if (selectedItem.type === ItemType.Element) { 
        const canvasItem = selectedItem as ElementCanvasItem;
        if (typeof canvasItem.content === 'string') {
          setEditableContent(canvasItem.content);
        } else {
          setEditableContent(''); 
        }
      } else if (selectedItem.type === ItemType.Page) {
        const pageItem = selectedItem as PageItem;
        setEditableProps({ path: pageItem.path, ...props });
        setEditableContent('');
      }
    } else {
      setEditableProps({});
      setEditableContent('');
      setItemName('');
    }
  }, [selectedItem]);

  const handlePropChange = (key: string, value: string | number | boolean) => {
    const newProps = { ...editableProps, [key]: value };
    setEditableProps(newProps);
    if (selectedItemId) {
      updateItemProps(selectedItemId, activePageId, { [key]: value });
    }
  };
  
  const handleNameChange = (newName: string) => {
    setItemName(newName);
    if (selectedItemId) {
        updateItemProps(selectedItemId, activePageId, { name: newName });
    }
  }

  const handleContentChange = (newContent: string) => {
    setEditableContent(newContent);
    if (selectedItemId && selectedItem && selectedItem.type === ItemType.Element) {
       const elementItem = selectedItem as ElementCanvasItem;
       if (typeof elementItem.content === 'string' || elementItem.content === undefined) {
           updateItemContent(selectedItemId, activePageId, newContent);
       }
    }
  };

  const handleDelete = () => {
    if (selectedItemId) {
      deleteItem(selectedItemId, activePageId);
    }
  };

  const handleStyleChange = (classGroupRegex: RegExp, newClass: string) => {
    const currentClassName = editableProps.className || '';
    const newClassName = manageTailwindClass(currentClassName, classGroupRegex, newClass);
    handlePropChange('className', newClassName);
  };
  
  const handleClassNameChange = (newClassName: string) => {
    handlePropChange('className', newClassName);
  }

  const getStyleValue = (classGroupRegex: RegExp, prefix: string = ''): string => {
    const className = editableProps.className || '';
    const match = className.match(classGroupRegex);
    if (match && match[0]) {
        return prefix ? match[0].replace(prefix, '') : match[0];
    }
    return '';
  };
  
  const handleAddProp = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPropKey.trim() && !editableProps.hasOwnProperty(newPropKey)) {
        handlePropChange(newPropKey, newPropValue);
        setNewPropKey('');
        setNewPropValue('');
    }
  }

  const handleDeleteProp = (keyToDelete: string) => {
    const { [keyToDelete]: _, ...rest } = editableProps;
    setEditableProps(rest);
     if (selectedItemId) {
      const newPropsPayload = { ... (selectedItem as AnyCanvasItem).props };
      delete newPropsPayload[keyToDelete];
      updateItemProps(selectedItemId, activePageId, newPropsPayload);
    }
  }
  
  if (!selectedItem) {
    return (
      <div className="w-80 bg-slate-800 border-l border-slate-700 p-4 flex flex-col h-full shrink-0">
        <div className="text-center text-slate-500 pt-10 flex flex-col items-center justify-center flex-grow">
          <Settings size={48} className="mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Inspector</h3>
          <p className="text-sm">Select an item on the canvas or a page to see its properties.</p>
        </div>
      </div>
    );
  }

  const renderPropsControls = () => {
    let propsToRender = { ...editableProps };
    if (selectedItem.type === ItemType.Page) {
        delete propsToRender.className; 
    }

    return (
        <>
        {Object.keys(propsToRender).filter(k => k !== 'className' && (selectedItem.type !== ItemType.Page || k === 'path')).map(key => (
              <div key={key} className="mb-3 grid grid-cols-10 items-center gap-1">
                <label htmlFor={`prop-${key}`} className="col-span-3 block text-xs font-medium text-slate-400 capitalize truncate">{key}</label>
                <input type="text" id={`prop-${key}`} value={propsToRender[key] ?? ''} onChange={(e) => handlePropChange(key, e.target.value)} className="col-span-6 w-full p-2 text-sm bg-slate-800 border border-slate-600 rounded"/>
                {key !== 'path' && (
                  <button onClick={() => handleDeleteProp(key)} className="col-span-1 text-red-500 hover:text-red-400 p-1 flex justify-center items-center" title={`Delete prop ${key}`}>
                    <X size={16} />
                  </button>
                )}
              </div>
        ))}
         <form onSubmit={handleAddProp} className="mt-4 pt-4 border-t border-slate-700 space-y-2">
             <h4 className="text-sm font-semibold text-slate-300">Add New Prop</h4>
             <input type="text" placeholder="Property Name" value={newPropKey} onChange={e => setNewPropKey(e.target.value)} className="w-full p-2 text-sm bg-slate-700 border border-slate-600 rounded"/>
             <input type="text" placeholder="Property Value" value={newPropValue} onChange={e => setNewPropValue(e.target.value)} className="w-full p-2 text-sm bg-slate-700 border border-slate-600 rounded"/>
             <button type="submit" className="w-full p-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded flex items-center justify-center">
                 <Plus size={16} className="mr-1" /> Add Prop
             </button>
         </form>
        </>
    )
  }

  const renderStyleControls = () => {
    const flexDirRegex = /flex-(row|col|row-reverse|col-reverse)/;
    const justifyRegex = /justify-(start|end|center|between|around|evenly)/;
    const alignRegex = /items-(start|end|center|baseline|stretch)/;
    const gapRegex = /gap-x?-\[?\d+px\]?|gap-x?-\d+/;
    const paddingRegex = /p[xytrbl]?-\[?\d+px\]?|p[xytrbl]?-\d+/;
    const marginRegex = /m[xytrbl]?-\[?\d+px\]?|m[xytrbl]?-\d+/;

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400">ClassName</label>
                <AutocompleteInput
                  value={editableProps.className || ''}
                  onChange={handleClassNameChange}
                  suggestions={TAILWIND_CLASSES}
                />
            </div>

            <h4 className="text-sm font-semibold text-slate-300 mb-2 border-b border-slate-700 pb-2">Layout</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <label className="text-xs text-slate-400">Flex Direction</label>
                <select value={getStyleValue(flexDirRegex)} onChange={e => handleStyleChange(flexDirRegex, e.target.value)} className="w-full p-1 text-xs bg-slate-700 border border-slate-600 rounded">
                    <option value="">Default</option><option value="flex-row">Row</option><option value="flex-col">Column</option>
                </select>
                <label className="text-xs text-slate-400">Justify Content</label>
                <select value={getStyleValue(justifyRegex)} onChange={e => handleStyleChange(justifyRegex, e.target.value)} className="w-full p-1 text-xs bg-slate-700 border border-slate-600 rounded">
                    <option value="">Default</option><option value="justify-start">Start</option><option value="justify-center">Center</option><option value="justify-end">End</option><option value="justify-between">Between</option>
                </select>
                <label className="text-xs text-slate-400">Align Items</label>
                 <select value={getStyleValue(alignRegex)} onChange={e => handleStyleChange(alignRegex, e.target.value)} className="w-full p-1 text-xs bg-slate-700 border border-slate-600 rounded">
                    <option value="">Default</option><option value="items-start">Start</option><option value="items-center">Center</option><option value="items-end">End</option>
                </select>
                 <label className="text-xs text-slate-400">Gap</label>
                <input type="text" value={getStyleValue(gapRegex, 'gap-')} onChange={e => handleStyleChange(gapRegex, e.target.value ? `gap-${e.target.value}`: '')} className="w-full p-1 text-xs bg-slate-700 border border-slate-600 rounded" />
            </div>
            <h4 className="text-sm font-semibold text-slate-300 mb-2 border-b border-slate-700 pb-2 pt-2">Spacing</h4>
             <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                 <label className="text-xs text-slate-400">Padding</label>
                <input type="text" value={getStyleValue(/p-\d+/, 'p-')} onChange={e => handleStyleChange(/p[xytrbl]?-\d+/, e.target.value ? `p-${e.target.value}` : '')} className="w-full p-1 text-xs bg-slate-700 border border-slate-600 rounded" />
                 <label className="text-xs text-slate-400">Margin</label>
                <input type="text" value={getStyleValue(/m-\d+/, 'm-')} onChange={e => handleStyleChange(/m[xytrbl]?-\d+/, e.target.value ? `m-${e.target.value}` : '')} className="w-full p-1 text-xs bg-slate-700 border border-slate-600 rounded" />
            </div>
        </div>
    );
  };

  const getIconForItemType = () => {
    switch(selectedItem.type) {
        case ItemType.Page: return <Edit3 size={18} className="mr-2 text-green-400"/>;
        case ItemType.Component: return <Component size={18} className="mr-2 text-purple-400"/>;
        case ItemType.Element: return <Type size={18} className="mr-2 text-blue-400"/>;
        default: return <Settings size={18} className="mr-2 text-slate-400" />;
    }
  }

  return (
    <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between shrink-0">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center">
            {getIconForItemType()}
            Inspector
        </h2>
          <button onClick={handleDelete} className="text-red-500 hover:text-red-400 p-1" title="Delete Item">
              <Trash2 size={18} />
          </button>
      </div>

      <div className="flex-grow p-4 overflow-y-auto">
        <div className="mb-4">
          <label htmlFor="itemName" className="block text-xs font-medium text-slate-400 mb-1">Name</label>
          <input
            type="text"
            id="itemName"
            value={itemName}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full p-2 text-sm bg-slate-700 border border-slate-600 rounded"
          />
        </div>
          <div className="mb-4">
              <div className="flex border-b border-slate-700 mb-3">
                  <button onClick={() => setActiveTab('props')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'props' ? 'border-b-2 border-blue-500 text-white' : 'text-slate-400'}`}>
                      <Settings size={14} className="inline mr-1" />Props
                  </button>
                  <button onClick={() => setActiveTab('styles')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'styles' ? 'border-b-2 border-blue-500 text-white' : 'text-slate-400'}`}>
                      <Brush size={14} className="inline mr-1" />Styles
                  </button>
              </div>
          </div>
        

        {activeTab === 'props' && (
          <>
            {selectedItem.type === ItemType.Element && typeof (selectedItem as ElementCanvasItem).content === 'string' && (
              <div>
                <label htmlFor="itemContent" className="block text-xs font-medium text-slate-400 mb-1">Content (Text)</label>
                <textarea id="itemContent" value={editableContent} onChange={(e) => handleContentChange(e.target.value)} rows={3} className="w-full p-2 text-sm bg-slate-800 border border-slate-600 rounded"/>
              </div>
            )}
            {renderPropsControls()}
          </>
        )}
        {activeTab === 'styles' && renderStyleControls()}
      </div>
    </div>
  );
};

export default InspectorPanel;