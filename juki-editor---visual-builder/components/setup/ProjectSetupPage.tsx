import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Project } from '../../types';
import CreateProjectModal from './CreateProjectModal';
import { FolderGit, FilePlus, ArrowRight } from 'lucide-react';

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    const { loadProject } = useAppContext();
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex flex-col justify-between hover:border-blue-500 transition-colors duration-200 group">
            <div>
                <h3 className="text-xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{project.name}</h3>
                <p className="text-slate-400 mt-2 h-12 overflow-hidden text-ellipsis">{project.description}</p>
            </div>
            <button
                onClick={() => loadProject(project.id)}
                className="mt-6 w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
            >
                Open Editor <ArrowRight size={16} className="ml-2" />
            </button>
        </div>
    );
};


const ProjectSetupPage: React.FC = () => {
    const { projects } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="bg-slate-900 text-slate-100 min-h-screen">
            <header className="p-6 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center">
                    <FolderGit size={32} className="text-blue-400" />
                    <h1 className="text-3xl font-bold ml-4">Juki Builder</h1>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                >
                    <FilePlus size={18} className="mr-2" />
                    New Project
                </button>
            </header>
            <main className="p-8">
                {projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {projects.map(p => <ProjectCard key={p.id} project={p} />)}
                    </div>
                ) : (
                    <div className="text-center py-20 flex flex-col items-center justify-center">
                        <h2 className="text-2xl font-semibold text-slate-400">No projects yet!</h2>
                        <p className="text-slate-500 mt-2 mb-6">Click "New Project" to get started on your next creation.</p>
                         <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-colors"
                        >
                            <FilePlus size={18} className="mr-2" />
                            Create Your First Project
                        </button>
                    </div>
                )}
            </main>
            {isModalOpen && <CreateProjectModal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default ProjectSetupPage;