import { useState } from 'react';
import {
    Layers,
    Upload,
    Save,
    FolderOpen,
    LayoutTemplate,
    Download,
    Settings2,
    ChevronDown,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function Header() {
    const {
        projectName,
        setProjectName,
        environmentPreset,
        setEnvironmentPreset,
        setShowTemplateGallery,
        setShowImportModal,
        setShowSaveModal,
        setShowLoadModal,
        savedProjects,
        yamlOutput,
        setShowSuccessModal,
    } = useAppStore();

    const [editingName, setEditingName] = useState(false);
    const [tempName, setTempName] = useState(projectName);
    const [showPresetMenu, setShowPresetMenu] = useState(false);

    const handleNameSubmit = () => {
        setProjectName(tempName || 'my-project');
        setEditingName(false);
    };

    const handleDownload = () => {
        const blob = new Blob([yamlOutput], { type: 'text/yaml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'docker-compose.yml';
        a.click();
        URL.revokeObjectURL(url);
        setShowSuccessModal(true);
    };

    return (
        <header
            className="flex items-center justify-between px-5 py-3 border-b"
            style={{
                background: 'linear-gradient(135deg, #13172a 0%, #1a1d2e 100%)',
                borderColor: 'var(--border-color)',
                minHeight: 56,
            }}
        >
            {/* Logo */}
            <div className="flex items-center gap-3">
                <div
                    className="flex items-center justify-center w-9 h-9 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #4f8ef7, #22d3ee)' }}
                >
                    <Layers size={18} className="text-white" />
                </div>
                <div>
                    <span className="text-lg font-bold gradient-text">DockerDraw</span>
                    <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                        Compose Builder
                    </span>
                </div>

                {/* Project name */}
                <div className="ml-4 pl-4" style={{ borderLeft: '1px solid var(--border-color)' }}>
                    {editingName ? (
                        <input
                            autoFocus
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onBlur={handleNameSubmit}
                            onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                            className="px-2 py-1 rounded-lg text-sm font-medium outline-none"
                            style={{
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--accent-blue)',
                                color: 'var(--text-primary)',
                                width: 180,
                            }}
                        />
                    ) : (
                        <button
                            onClick={() => { setTempName(projectName); setEditingName(true); }}
                            className="px-2 py-1 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
                            style={{ color: 'var(--text-secondary)' }}
                            title="Click to rename project"
                        >
                            📁 {projectName}
                        </button>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">

                {/* Environment Preset Toggle */}
                <div className="relative">
                    <button
                        onClick={() => setShowPresetMenu((v) => !v)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                        style={{
                            background: environmentPreset === 'development'
                                ? 'rgba(52, 211, 153, 0.15)'
                                : 'rgba(251, 146, 60, 0.15)',
                            border: environmentPreset === 'development'
                                ? '1px solid rgba(52, 211, 153, 0.5)'
                                : '1px solid rgba(251, 146, 60, 0.5)',
                            color: environmentPreset === 'development' ? '#34d399' : '#fb923c',
                        }}
                    >
                        <Settings2 size={14} />
                        {environmentPreset === 'development' ? '⚙ Development' : '🚀 Production'}
                        <ChevronDown size={12} />
                    </button>
                    {showPresetMenu && (
                        <div
                            className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-50 shadow-2xl"
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                minWidth: 200,
                            }}
                        >
                            {(['development', 'production'] as const).map((preset) => (
                                <button
                                    key={preset}
                                    onClick={() => { setEnvironmentPreset(preset); setShowPresetMenu(false); }}
                                    className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors"
                                    style={{
                                        background: environmentPreset === preset ? 'var(--bg-tertiary)' : 'transparent',
                                        color: 'var(--text-primary)',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = environmentPreset === preset ? 'var(--bg-tertiary)' : 'transparent')}
                                >
                                    <span>{preset === 'development' ? '⚙' : '🚀'}</span>
                                    <div>
                                        <div className="text-sm font-medium capitalize">{preset}</div>
                                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                            {preset === 'development' ? 'Hot reload, verbose logs, exposed ports' : 'Restart policies, resource limits, health checks'}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Templates */}
                <button
                    onClick={() => setShowTemplateGallery(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:opacity-90"
                    style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                    }}
                    title="Browse Templates"
                >
                    <LayoutTemplate size={15} />
                    <span className="hidden sm:inline">Templates</span>
                </button>

                {/* Import */}
                <button
                    onClick={() => setShowImportModal(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:opacity-90"
                    style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                    }}
                    title="Import YAML"
                >
                    <Upload size={15} />
                    <span className="hidden sm:inline">Import</span>
                </button>

                {/* Save */}
                <button
                    onClick={() => setShowSaveModal(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:opacity-90"
                    style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                    }}
                    title="Save Project"
                >
                    <Save size={15} />
                    <span className="hidden sm:inline">Save</span>
                </button>

                {/* Load */}
                {savedProjects.length > 0 && (
                    <button
                        onClick={() => setShowLoadModal(true)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:opacity-90"
                        style={{
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-secondary)',
                        }}
                        title="Load Project"
                    >
                        <FolderOpen size={15} />
                        <span className="hidden sm:inline">Load</span>
                    </button>
                )}

                {/* Download */}
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                    style={{
                        background: 'linear-gradient(135deg, #4f8ef7, #22d3ee)',
                        color: 'white',
                    }}
                >
                    <Download size={15} />
                    Download
                </button>
            </div>
        </header>
    );
}
