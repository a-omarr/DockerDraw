import { useState } from 'react';
import { Save, Folder, Trash2, Calendar, Check } from 'lucide-react';
import { Modal } from './TemplateGallery';
import { useAppStore } from '../store/useAppStore';

export function SaveModal() {
    const { setShowSaveModal, saveProject, projectName, services } = useAppStore();
    const [name, setName] = useState(projectName);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        saveProject(name || projectName);
        setSaved(true);
        setTimeout(() => setShowSaveModal(false), 800);
    };

    return (
        <Modal title="Save Project" onClose={() => setShowSaveModal(false)} maxWidth={420}>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Save your current {services.length} service configuration to load later.
            </p>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Project Name
            </label>
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="my-project"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="w-full px-3 py-3 rounded-xl text-sm outline-none mb-4"
                style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
            />
            <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
                style={{
                    background: saved ? 'rgba(52, 211, 153, 0.2)' : 'linear-gradient(135deg, #4f8ef7, #22d3ee)',
                    color: saved ? 'var(--accent-green)' : 'white',
                    border: saved ? '1px solid rgba(52, 211, 153, 0.4)' : 'none',
                }}
            >
                {saved ? <Check size={15} /> : <Save size={15} />}
                {saved ? 'Saved!' : 'Save Project'}
            </button>
        </Modal>
    );
}

export function LoadModal() {
    const { setShowLoadModal, loadProject, deleteProject, savedProjects } = useAppStore();

    return (
        <Modal title="Load Project" onClose={() => setShowLoadModal(false)} maxWidth={480}>
            {savedProjects.length === 0 ? (
                <div className="text-center py-8">
                    <Folder size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No saved projects yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {savedProjects.map((project) => (
                        <div
                            key={project.id}
                            className="flex items-center gap-3 p-4 rounded-xl"
                            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                                    {project.name}
                                </p>
                                <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                                    <Calendar size={10} />
                                    {new Date(project.updatedAt).toLocaleDateString()} · {project.services.length} services
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { loadProject(project.id); setShowLoadModal(false); }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                                    style={{ background: 'linear-gradient(135deg, #4f8ef7, #22d3ee)', color: 'white' }}
                                >
                                    Load
                                </button>
                                <button
                                    onClick={() => deleteProject(project.id)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                                    style={{ color: 'var(--text-muted)' }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Modal>
    );
}
