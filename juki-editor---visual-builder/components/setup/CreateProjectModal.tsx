import React, { useState, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ProjectSettings } from '../../types';
import { X } from 'lucide-react';

// Shadcn/ui inspired components using Tailwind CSS
const Label: React.FC<{ htmlFor: string; children: React.ReactNode; className?: string }> = ({ htmlFor, children, className }) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
    {children}
  </label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`flex h-10 w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm ring-offset-slate-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${props.className}`}
  />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className={`flex min-h-[80px] w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm ring-offset-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${props.className}`}
  />
);

const Switch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; id: string; }> = ({ checked, onChange, id }) => (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" id={id} checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
);

const SetupToggle: React.FC<{ label: string; id: string; checked: boolean; onChange: (checked: boolean) => void; description: string; }> = ({ label, id, checked, onChange, description }) => (
    <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-lg border border-slate-700">
        <div>
            <label htmlFor={id} className="font-semibold text-slate-200 cursor-pointer">{label}</label>
            <p className="text-xs text-slate-400">{description}</p>
        </div>
        <Switch id={id} checked={checked} onChange={onChange} />
    </div>
);

// Regex for valid Next.js project names (similar to directory names)
const NEXTJS_NAME_REGEX = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

const CreateProjectModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { createProject, projects } = useAppContext();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [nameError, setNameError] = useState('');
    const [settings, setSettings] = useState<ProjectSettings>({
        useGitHub: false,
        useTypeScript: true,
        useESLint: true,
        useAlias: true,
    });

    const validateName = useCallback((value: string) => {
        if (!value) {
            setNameError('Project name is required.');
            return false;
        }
        if (projects.some(p => p.name.toLowerCase() === value.toLowerCase())) {
            setNameError('A project with this name already exists.');
            return false;
        }
        if (!NEXTJS_NAME_REGEX.test(value)) {
            setNameError('Invalid project name. Use lowercase letters, numbers, and dashes.');
            return false;
        }
        setNameError('');
        return true;
    }, [projects]);
    
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        validateName(newName);
    };

    const handleSettingChange = (key: keyof ProjectSettings, value: boolean) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateName(name)) {
            createProject(name, description, { ...settings, githubUrl: settings.useGitHub ? githubUrl : undefined });
        }
    };

    const isFormInvalid = !!nameError || !name.trim();

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-2xl transform transition-all"
                 onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold">Create New Project</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-2">
                            <Label htmlFor="projectName">Project Name *</Label>
                            <Input
                                id="projectName"
                                type="text"
                                value={name}
                                onChange={handleNameChange}
                                placeholder="my-awesome-app"
                                required
                                aria-invalid={!!nameError}
                                aria-describedby="name-error"
                            />
                            {nameError && <p id="name-error" className="text-sm text-red-500">{nameError}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="projectDescription">Description</Label>
                            <Textarea
                                id="projectDescription"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={2}
                                placeholder="A short description of what this project is about."
                            />
                        </div>
                        <div className="space-y-3 pt-2">
                           <h3 className="text-lg font-semibold border-b border-slate-700 pb-2 mb-3">Next.js Setup</h3>
                           <SetupToggle label="Initialize with GitHub" id="useGitHub" description="Create a new repository on GitHub." checked={settings.useGitHub} onChange={v => handleSettingChange('useGitHub', v)} />
                           {settings.useGitHub && (
                                <div className="pl-4 ml-4 border-l-2 border-slate-600 space-y-2 transition-all duration-300">
                                   <Label htmlFor="githubUrl">GitHub Repository URL</Label>
                                   <Input 
                                      id="githubUrl" 
                                      type="url" 
                                      value={githubUrl}
                                      onChange={(e) => setGithubUrl(e.target.value)}
                                      placeholder="https://github.com/user/repo" 
                                   />
                               </div>
                           )}
                           <SetupToggle label="TypeScript" id="useTypeScript" description="Use TypeScript for static type checking." checked={settings.useTypeScript} onChange={v => handleSettingChange('useTypeScript', v)} />
                           <SetupToggle label="ESLint" id="useESLint" description="Integrate ESLint for code linting." checked={settings.useESLint} onChange={v => handleSettingChange('useESLint', v)} />
                           <SetupToggle label="Path Alias" id="useAlias" description="Configure path alias (e.g., @/*)." checked={settings.useAlias} onChange={v => handleSettingChange('useAlias', v)} />
                        </div>
                    </div>
                    <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md border border-slate-600 hover:bg-slate-700">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isFormInvalid}>Create Project</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectModal;