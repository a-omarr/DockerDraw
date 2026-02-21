import {
    Upload,
    Save,
    LayoutTemplate,
    FolderOpen,
    Search,
    HelpCircle,
    FileCode,
    Menu,
    Share2,
    Check,
} from 'lucide-react';
import { SiDocker, SiVite } from 'react-icons/si';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { UndoRedoButtons } from './UndoRedoButtons';
import type { EnvironmentPreset } from '../../types';

interface CompactMenuProps {
    isMobile: boolean;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
    environmentPreset: EnvironmentPreset;
    onPresetChange: (preset: EnvironmentPreset) => void;
    onShowCommandPalette: () => void;
    onShowTemplateGallery: () => void;
    onShowImportModal: () => void;
    onShowSaveModal: () => void;
    onShowLoadModal: () => void;
    showYAMLPanel: boolean;
    onToggleYAMLPanel: () => void;
    hasSavedProjects: boolean;
    onStartTour?: () => void;
    onShare: () => void;
    shareCopied: boolean;
    isShareDisabled: boolean;
}

export function CompactMenu({
    isMobile,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    environmentPreset,
    onPresetChange,
    onShowCommandPalette,
    onShowTemplateGallery,
    onShowImportModal,
    onShowSaveModal,
    onShowLoadModal,
    showYAMLPanel,
    onToggleYAMLPanel,
    hasSavedProjects,
    onStartTour,
    onShare,
    shareCopied,
    isShareDisabled,
}: CompactMenuProps) {
    return (
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
                <div className="px-1 py-1">
                    <UndoRedoButtons
                        canUndo={canUndo}
                        canRedo={canRedo}
                        onUndo={onUndo}
                        onRedo={onRedo}
                        className="w-full"
                    />
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => onPresetChange(environmentPreset === 'development' ? 'production' : 'development')}
                    className="py-2.5"
                >
                    {environmentPreset === 'development' ? <SiDocker size={14} className="mr-2.5 text-orange-600" /> : <SiVite size={14} className="mr-2.5 text-emerald-600" />}
                    Switch to {environmentPreset === 'development' ? 'Production' : 'Development'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onShowCommandPalette} className="py-2.5">
                    <Search size={14} className="mr-2.5" />
                    Command Palette
                    <kbd className="ml-auto text-[10px] font-mono opacity-50">Ctrl+K</kbd>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onShowTemplateGallery} className="py-2.5">
                    <LayoutTemplate size={14} className="mr-2.5" />
                    Templates
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onShowImportModal} className="py-2.5">
                    <Upload size={14} className="mr-2.5" />
                    Import YAML
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onShowSaveModal} className="py-2.5">
                    <Save size={14} className="mr-2.5" />
                    Save Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleYAMLPanel} className="py-2.5">
                    <FileCode size={14} className={cn("mr-2.5", showYAMLPanel && "text-primary")} />
                    {showYAMLPanel ? "Hide YAML Code" : "View YAML Code"}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={onShare}
                    className="py-2.5"
                    disabled={isShareDisabled}
                >
                    {shareCopied ? (
                        <Check size={14} className="mr-2.5 text-green-500" />
                    ) : (
                        <Share2 size={14} className="mr-2.5" />
                    )}
                    {shareCopied ? 'Copied!' : 'Share Project'}
                </DropdownMenuItem>
                {hasSavedProjects && (
                    <DropdownMenuItem onClick={onShowLoadModal} className="py-2.5">
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
    );
}
