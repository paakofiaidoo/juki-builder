import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateReactCode } from '../utils/code-generator';
import { PageItem, AnyCanvasItem, ItemType } from '../types';
import { X, Copy } from 'lucide-react';

const CodeModal: React.FC = () => {
    const { toggleCodeView, selectedItemId, activePageId, pages } = useAppContext();
    const [copySuccess, setCopySuccess] = useState('');

    const generatedCode = useMemo(() => {
        if (!activePageId) return '// No active page selected.';
        
        const activePage = pages.find(p => p.id === activePageId);
        if (!activePage) return '// Active page not found.';

        if (selectedItemId && selectedItemId !== activePageId) {
             const findInTree = (items: AnyCanvasItem[], id: string): AnyCanvasItem | null => {
                for (const item of items) {
                    if (item.id === id) return item;
                    if (item.content && Array.isArray(item.content)) {
                    const found = findInTree(item.content, id);
                    if (found) return found;
                    }
                }
                return null;
            };
            const selectedItem = findInTree(activePage.children, selectedItemId);
            if (selectedItem) {
                // To generate code for a single component, we wrap it in a mock page structure
                const mockPage: PageItem = { ...activePage, name: selectedItem.name, children: [selectedItem] };
                return generateReactCode(mockPage);
            }
        }
        
        return generateReactCode(activePage);

    }, [selectedItemId, activePageId, pages]);

    const [editableCode, setEditableCode] = useState(generatedCode);

    useEffect(() => {
        setEditableCode(generatedCode);
    }, [generatedCode]);

    const handleCopy = () => {
        navigator.clipboard.writeText(editableCode).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Failed to copy');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    return (
        <div className="code-modal" onClick={toggleCodeView}>
            <div className="code-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-slate-700 shrink-0">
                    <h3 className="text-lg font-semibold">Generated Code</h3>
                    <div className="flex items-center space-x-4">
                        <button onClick={handleCopy} className="flex items-center text-sm px-3 py-1.5 bg-slate-600 hover:bg-slate-500 rounded-md">
                            <Copy size={14} className="mr-2" />
                            {copySuccess || 'Copy'}
                        </button>
                        <button onClick={toggleCodeView} className="p-1 text-slate-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className="flex-grow overflow-hidden bg-slate-900">
                    <textarea
                        className="w-full h-full p-4 bg-transparent text-slate-100 font-mono text-sm resize-none border-0 focus:outline-none"
                        value={editableCode}
                        onChange={(e) => setEditableCode(e.target.value)}
                        spellCheck="false"
                    />
                </div>
            </div>
        </div>
    );
};

export default CodeModal;