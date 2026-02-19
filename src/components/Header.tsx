import { useState } from 'react';
import {
    Layers,
    Upload,
    Save,
    FolderOpen,
    LayoutTemplate,
    Download,
    ChevronDown,
} from 'lucide-react';
import {
    SiDocker,
    SiOpencontainersinitiative,
    SiVite
} from 'react-icons/si';
import { useAppStore } from '../store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
        <header className="flex items-center justify-between px-6 py-3 border-b bg-background h-14 sticky top-0 z-50">
            {/* Logo */}
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                    <Layers size={16} className="text-primary-foreground" />
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold tracking-tight">DockerDraw</span>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest hidden sm:inline">
                        v1.0
                    </span>
                </div>

                {/* Project name */}
                <div className="ml-4 pl-4 border-l">
                    {editingName ? (
                        <Input
                            autoFocus
                            value={tempName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempName(e.target.value)}
                            onBlur={handleNameSubmit}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleNameSubmit()}
                            className="h-8 w-48 text-sm font-medium"
                        />
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 font-medium text-muted-foreground hover:text-foreground"
                            onClick={() => { setTempName(projectName); setEditingName(true); }}
                            title="Click to rename project"
                        >
                            <SiOpencontainersinitiative size={14} className="mr-2 text-primary/70" />
                            {projectName}
                        </Button>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {/* Environment Preset Toggle */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={`h-9 gap-2 font-medium ${environmentPreset === 'development'
                                ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800'
                                : 'border-orange-200 bg-orange-50/50 text-orange-700 hover:bg-orange-50 hover:text-orange-800'
                                }`}
                        >
                            {environmentPreset === 'development' ? (
                                <SiVite size={14} className="text-emerald-600" />
                            ) : (
                                <SiDocker size={14} className="text-orange-600" />
                            )}
                            {environmentPreset === 'development' ? 'Development' : 'Production'}
                            <ChevronDown size={12} className="opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        {(['development', 'production'] as const).map((preset) => (
                            <DropdownMenuItem
                                key={preset}
                                onClick={() => setEnvironmentPreset(preset)}
                                className="flex flex-col items-start gap-0.5"
                            >
                                <div className="flex items-center gap-2 font-medium capitalize">
                                    {preset === 'development' ? (
                                        <SiVite size={12} className="text-emerald-600" />
                                    ) : (
                                        <SiDocker size={12} className="text-orange-600" />
                                    )}
                                    {preset}
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                    {preset === 'development'
                                        ? 'Hot reload, verbose logs, exposed ports'
                                        : 'Restart policies, resource limits, health checks'}
                                </span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-4 w-[1px] bg-border mx-1" />

                {/* Action Buttons */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-2 text-muted-foreground"
                    onClick={() => setShowTemplateGallery(true)}
                >
                    <LayoutTemplate size={14} />
                    <span className="hidden lg:inline">Templates</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-2 text-muted-foreground"
                    onClick={() => setShowImportModal(true)}
                >
                    <Upload size={14} />
                    <span className="hidden lg:inline">Import</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-2 text-muted-foreground"
                    onClick={() => setShowSaveModal(true)}
                >
                    <Save size={14} />
                    <span className="hidden lg:inline">Save</span>
                </Button>

                {savedProjects.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 gap-2 text-muted-foreground"
                        onClick={() => setShowLoadModal(true)}
                    >
                        <FolderOpen size={14} />
                        <span className="hidden lg:inline">Load</span>
                    </Button>
                )}

                <Button
                    size="sm"
                    className="h-9 gap-2 ml-2 shadow-sm"
                    onClick={handleDownload}
                >
                    <Download size={14} />
                    Download
                </Button>
            </div>
        </header>
    );
}
