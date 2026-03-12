import {
    Layers,
    Upload,
    Save,
    FolderOpen,
    LayoutTemplate,
    Download,
    ChevronDown,
    PanelLeftOpen,
    PanelLeftClose,
    FileCode,
    Share2,
    Check,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStore } from 'zustand';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { useAppActions } from '../../hooks/useAppActions';
import { ProjectNameEditor } from './ProjectNameEditor';
import { UndoRedoButtons } from './UndoRedoButtons';
import { EnvironmentPresetToggle } from './EnvironmentPresetToggle';
import { CompactMenu } from './CompactMenu';
import { encodeServicesToURL } from '../../utils/shareUrl';
import { useState } from 'react';

export function Header() {
    const {
        projectName,
        setProjectName,
        environmentPreset,
        setEnvironmentPreset,
        setModalVisibility,
        savedProjects,
        showLibrary,
        toggleLibrary,
        showYAMLPanel,
        toggleYAMLPanel,
        services,
        isDirty,
    } = useAppStore();

    const [shareCopied, setShareCopied] = useState(false);

    const handleShare = () => {
        try {
            const url = encodeServicesToURL(services);
            navigator.clipboard.writeText(url).then(() => {
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2000);
            });
        } catch (e: any) {
            alert(e.message || 'Failed to generate share link');
        }
    };

    const { pastStates, futureStates } = useStore((useAppStore as any).temporal) as any;
    const canUndo = pastStates.length > 0;
    const canRedo = futureStates.length > 0;

    const { handleDownload, handleUndo, handleRedo } = useAppActions();

    // Trigger mobile-style compact nav when < 1350px
    const isCompact = useMediaQuery('(max-width: 1350px)');
    const isMobile = useMediaQuery('(max-width: 639px)');

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
                    <ProjectNameEditor
                        projectName={projectName}
                        onSave={setProjectName}
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {!isCompact && (
                    <>
                        <UndoRedoButtons
                            canUndo={canUndo}
                            canRedo={canRedo}
                            onUndo={handleUndo}
                            onRedo={handleRedo}
                        />

                        <div className="h-4 w-[1px] bg-border mx-1" />

                        <EnvironmentPresetToggle
                            value={environmentPreset}
                            onChange={setEnvironmentPreset}
                        />

                        <div className="h-4 w-[1px] bg-border mx-1" />

                        {/* Templates & Load Group */}
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 gap-2 text-muted-foreground hover:bg-muted/50"
                                onClick={() => setModalVisibility('showTemplateGallery', true)}
                            >
                                <LayoutTemplate size={14} />
                                <span>Templates</span>
                            </Button>

                            {savedProjects.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 gap-2 text-muted-foreground hover:bg-muted/50"
                                    onClick={() => setModalVisibility('showLoadModal', true)}
                                >
                                    <FolderOpen size={14} />
                                    <span>Load</span>
                                </Button>
                            )}
                        </div>

                        <div className="h-4 w-[1px] bg-border mx-1" />

                        {/* Save & Export Group */}
                        <div className="flex items-center gap-1">
                            <div className="flex items-center">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 gap-2 text-muted-foreground pr-2 border-r border-border/50 hover:bg-muted/50 rounded-r-none"
                                    onClick={() => setModalVisibility('showSaveModal', true)}
                                >
                                    <Save size={14} />
                                    <span>Save</span>
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-9 px-1.5 text-muted-foreground hover:bg-muted/50 rounded-l-none"
                                        >
                                            <ChevronDown size={14} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="center">
                                        <DropdownMenuItem onClick={() => setModalVisibility('showImportModal', true)} className="py-2.5">
                                            <Upload size={14} className="mr-2.5" />
                                            Import YAML
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 gap-2 text-muted-foreground hover:bg-muted/50 disabled:opacity-50"
                                onClick={handleShare}
                                disabled={!isDirty || services.length === 0}
                                title={!isDirty ? "Make changes to enable sharing" : "Share this configuration via URL"}
                            >
                                {shareCopied ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
                                <span>{shareCopied ? 'Copied!' : 'Share'}</span>
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-9 gap-2 transition-all px-3 ml-1",
                                    showYAMLPanel
                                        ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary font-medium"
                                        : "text-muted-foreground hover:bg-muted/50"
                                )}
                                onClick={toggleYAMLPanel}
                                title={showYAMLPanel ? "Hide YAML Code" : "Show YAML Code"}
                            >
                                <FileCode size={14} />
                                <span>YAML Code</span>
                            </Button>

                        </div>
                    </>
                )}

                {/* Compact/Mobile overflow menu */}
                {isCompact && (
                    <CompactMenu
                        isMobile={isMobile}
                        canUndo={canUndo}
                        canRedo={canRedo}
                        onUndo={handleUndo}
                        onRedo={handleRedo}
                        environmentPreset={environmentPreset}
                        onPresetChange={setEnvironmentPreset}
                        onShowCommandPalette={() => setModalVisibility('showCommandPalette', true)}
                        onShowTemplateGallery={() => setModalVisibility('showTemplateGallery', true)}
                        onShowImportModal={() => setModalVisibility('showImportModal', true)}
                        onShowSaveModal={() => setModalVisibility('showSaveModal', true)}
                        onShowLoadModal={() => setModalVisibility('showLoadModal', true)}
                        showYAMLPanel={showYAMLPanel}
                        onToggleYAMLPanel={toggleYAMLPanel}
                        hasSavedProjects={savedProjects.length > 0}
                        onShare={handleShare}
                        shareCopied={shareCopied}
                        isShareDisabled={!isDirty || services.length === 0}
                    />
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
