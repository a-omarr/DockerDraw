import { useState } from 'react';
import {
    Layers,
    Upload,
    Save,
    FolderOpen,
    LayoutTemplate,
    Download,
    ChevronDown,
    Undo2,
    Redo2,
    Search,
    Menu,
    PanelLeftOpen,
    PanelLeftClose,
    HelpCircle,
    FileCode,
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
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useStore } from 'zustand';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

export function Header({ onStartTour }: { onStartTour?: () => void }) {
    const {
        projectName,
        setProjectName,
        environmentPreset,
        setEnvironmentPreset,
        setShowTemplateGallery,
        setShowImportModal,
        setShowSaveModal,
        setShowLoadModal,
        setShowCommandPalette,
        savedProjects,
        yamlOutput,
        setShowSuccessModal,
        showLibrary,
        toggleLibrary,
        showYAMLPanel,
        toggleYAMLPanel,
    } = useAppStore();

    const { pastStates, futureStates } = useStore(useAppStore.temporal);
    const canUndo = pastStates.length > 0;
    const canRedo = futureStates.length > 0;

    // Trigger mobile-style compact nav when < 1350px
    const isCompact = useMediaQuery('(max-width: 1350px)');
    const isMobile = useMediaQuery('(max-width: 639px)');

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

    const handleUndo = () => {
        const temporal = useAppStore.temporal.getState();
        temporal.pause();
        temporal.undo();
        useAppStore.getState().refreshDerived();
        temporal.resume();
    };

    const handleRedo = () => {
        const temporal = useAppStore.temporal.getState();
        temporal.pause();
        temporal.redo();
        useAppStore.getState().refreshDerived();
        temporal.resume();
    };

    return (
        <header className="flex items-center justify-between px-3 sm:px-6 py-3 border-b bg-background h-14 sticky top-0 z-50">
            {/* Left: Logo + Project Name */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Library toggle on compact sizes */}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 shrink-0", !isCompact && "hidden")}
                    onClick={toggleLibrary}
                    title={showLibrary ? 'Hide Library' : 'Show Library'}
                >
                    {showLibrary ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
                </Button>

                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0">
                    <Layers size={16} className="text-primary-foreground" />
                </div>
                <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-lg font-bold tracking-tight hidden sm:inline">DockerDraw</span>
                    <span className="text-lg font-bold tracking-tight sm:hidden">DD</span>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest hidden md:inline">
                        v1.0
                    </span>
                </div>

                {/* Project name */}
                <div className="ml-2 sm:ml-4 pl-2 sm:pl-4 border-l min-w-0">
                    {editingName ? (
                        <Input
                            autoFocus
                            value={tempName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempName(e.target.value)}
                            onBlur={handleNameSubmit}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleNameSubmit()}
                            className="h-8 w-32 sm:w-48 text-sm font-medium"
                        />
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 font-medium text-muted-foreground hover:text-foreground max-w-[120px] sm:max-w-[200px]"
                            onClick={() => { setTempName(projectName); setEditingName(true); }}
                            title="Click to rename project"
                        >
                            <SiOpencontainersinitiative size={14} className="mr-2 text-primary/70 shrink-0" />
                            <span className="truncate">{projectName}</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {!isCompact && (
                    <>
                        {/* Undo/Redo */}
                        <div className="flex items-center gap-0.5">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground"
                                onClick={handleUndo}
                                disabled={!canUndo}
                                title="Undo (Ctrl+Z)"
                            >
                                <Undo2 size={14} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground"
                                onClick={handleRedo}
                                disabled={!canRedo}
                                title="Redo (Ctrl+Shift+Z)"
                            >
                                <Redo2 size={14} />
                            </Button>
                        </div>

                        <div className="h-4 w-[1px] bg-border mx-1" />

                        {/* Environment Preset Toggle */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`h-9 gap-2 font-medium text-sm ${environmentPreset === 'development'
                                        ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800'
                                        : 'border-orange-200 bg-orange-50/50 text-orange-700 hover:bg-orange-50 hover:text-orange-800'
                                        }`}
                                >
                                    {environmentPreset === 'development' ? (
                                        <SiVite size={14} className="text-emerald-600" />
                                    ) : (
                                        <SiDocker size={14} className="text-orange-600" />
                                    )}
                                    <span>
                                        {environmentPreset === 'development' ? 'Development' : 'Production'}
                                    </span>
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

                        {/* Desktop action buttons */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 gap-2 text-muted-foreground"
                            onClick={() => setShowTemplateGallery(true)}
                        >
                            <LayoutTemplate size={14} />
                            <span>Templates</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 gap-2 text-muted-foreground"
                            onClick={() => setShowImportModal(true)}
                        >
                            <Upload size={14} />
                            <span>Import</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 gap-2 text-muted-foreground"
                            onClick={() => setShowSaveModal(true)}
                        >
                            <Save size={14} />
                            <span>Save</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-9 gap-2 transition-all px-3",
                                showYAMLPanel
                                    ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary font-medium"
                                    : "text-muted-foreground hover:bg-muted"
                            )}
                            onClick={toggleYAMLPanel}
                            title={showYAMLPanel ? "Hide YAML Code" : "Show YAML Code"}
                        >
                            <FileCode size={14} />
                            <span>YAML Code</span>
                        </Button>

                        {savedProjects.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 gap-2 text-muted-foreground"
                                onClick={() => setShowLoadModal(true)}
                            >
                                <FolderOpen size={14} />
                                <span>Load</span>
                            </Button>
                        )}

                        {/* Command Palette trigger */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 gap-2 text-muted-foreground"
                            onClick={() => setShowCommandPalette(true)}
                            title="Command Palette (Ctrl+K)"
                        >
                            <Search size={14} />
                            <kbd className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border/50">
                                Ctrl+K
                            </kbd>
                        </Button>

                        {onStartTour && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 gap-2 text-muted-foreground"
                                onClick={onStartTour}
                                title="Take a tour"
                            >
                                <HelpCircle size={14} />
                                <span>Tour</span>
                            </Button>
                        )}
                    </>
                )}

                {/* Compact/Mobile overflow menu */}
                {isCompact && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant={isMobile ? "ghost" : "outline"}
                                size={isMobile ? "icon" : "sm"}
                                className={cn("h-9 text-muted-foreground", isMobile ? "w-9" : "px-3 gap-2 font-medium bg-muted/40")}
                            >
                                <Menu size={isMobile ? 18 : 14} />
                                {!isMobile && <span>Menu</span>}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 overflow-hidden">
                            <div className="flex items-center px-1 py-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 justify-center rounded-sm h-8"
                                    onClick={handleUndo}
                                    disabled={!canUndo}
                                >
                                    <Undo2 size={14} />
                                </Button>
                                <div className="w-[1px] h-4 bg-border mx-1" />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 justify-center rounded-sm h-8"
                                    onClick={handleRedo}
                                    disabled={!canRedo}
                                >
                                    <Redo2 size={14} />
                                </Button>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setEnvironmentPreset(environmentPreset === 'development' ? 'production' : 'development')} className="py-2.5">
                                {environmentPreset === 'development' ? <SiDocker size={14} className="mr-2.5 text-orange-600" /> : <SiVite size={14} className="mr-2.5 text-emerald-600" />}
                                Switch to {environmentPreset === 'development' ? 'Production' : 'Development'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setShowCommandPalette(true)} className="py-2.5">
                                <Search size={14} className="mr-2.5" />
                                Command Palette
                                <kbd className="ml-auto text-[10px] font-mono opacity-50">Ctrl+K</kbd>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowTemplateGallery(true)} className="py-2.5">
                                <LayoutTemplate size={14} className="mr-2.5" />
                                Templates
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowImportModal(true)} className="py-2.5">
                                <Upload size={14} className="mr-2.5" />
                                Import YAML
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setShowSaveModal(true)} className="py-2.5">
                                <Save size={14} className="mr-2.5" />
                                Save Project
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={toggleYAMLPanel} className="py-2.5">
                                <FileCode size={14} className={cn("mr-2.5", showYAMLPanel && "text-primary")} />
                                {showYAMLPanel ? "Hide YAML Code" : "View YAML Code"}
                            </DropdownMenuItem>
                            {savedProjects.length > 0 && (
                                <DropdownMenuItem onClick={() => setShowLoadModal(true)} className="py-2.5">
                                    <FolderOpen size={14} className="mr-2.5" />
                                    Load Project
                                </DropdownMenuItem>
                            )}
                            {onStartTour && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={onStartTour} className="py-2.5">
                                        <HelpCircle size={14} className="mr-2.5" />
                                        Take a Tour
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                <Button
                    size="sm"
                    className="h-9 gap-2 ml-1 sm:ml-2 shadow-sm shrink-0"
                    onClick={handleDownload}
                    data-tour="download-btn"
                >
                    <Download size={14} />
                    <span className="hidden sm:inline">Download</span>
                </Button>
            </div>
        </header>
    );
}
