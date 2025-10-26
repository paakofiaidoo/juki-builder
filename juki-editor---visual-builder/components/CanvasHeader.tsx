import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Eye, Code, Maximize, RefreshCw, Undo2, Redo2, Home } from 'lucide-react';

const HeaderButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  isActive?: boolean;
  title: string;
  disabled?: boolean;
}> = ({ onClick, children, isActive = false, title, disabled = false }) => (
  <button
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`flex items-center px-3 py-1.5 text-xs rounded-md space-x-2 ${
      isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
);

const CanvasHeader: React.FC = () => {
  const { isPreviewMode, togglePreviewMode, toggleCodeView, undo, redo, canUndo, canRedo, unloadProject } = useAppContext();

  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-between p-2 bg-slate-800 border-b border-slate-700 shrink-0">
      <div className="flex items-center space-x-2">
        <HeaderButton onClick={unloadProject} title="Back to Projects">
          <Home size={14} />
        </HeaderButton>
        <HeaderButton onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <Undo2 size={14} />
        </HeaderButton>
        <HeaderButton onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
          <Redo2 size={14} />
        </HeaderButton>
      </div>
      <div className="flex items-center space-x-2">
        <HeaderButton onClick={togglePreviewMode} isActive={isPreviewMode} title="Preview Mode">
          <Eye size={14} />
          <span>Preview</span>
        </HeaderButton>
        <HeaderButton onClick={toggleCodeView} title="View Code">
          <Code size={14} />
          <span>Code</span>
        </HeaderButton>
        <HeaderButton onClick={handleFullScreen} title="Toggle Fullscreen">
          <Maximize size={14} />
        </HeaderButton>
        <HeaderButton onClick={handleRefresh} title="Refresh Page">
          <RefreshCw size={14} />
        </HeaderButton>
      </div>
    </div>
  );
};

export default CanvasHeader;
