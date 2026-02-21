import { useMemo } from 'react';
import {
    LayoutTemplate,
    Upload,
    Save,
    FolderOpen,
    Download,
    Undo2,
    Redo2,
    FileCode,
    Library,
    Trash2,
    Plus,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { serviceTemplates } from '../data/serviceTemplates';
import type { CommandItem } from '../types';
import { useAppActions } from './useAppActions';

export function useCommandList(search: string) {
    const {
        setShowTemplateGallery,
        setShowImportModal,
        setShowSaveModal,
        setShowLoadModal,
        toggleYAMLPanel,
        toggleLibrary,
        addService,
        clearAllServices,
        services,
    } = useAppStore();

    const { handleDownload, handleUndo, handleRedo } = useAppActions();

    const commands: CommandItem[] = useMemo(() => {
        const base: CommandItem[] = [
            {
                id: 'templates',
                label: 'Browse Templates',
                icon: <LayoutTemplate size={16} />,
                category: 'Navigation',
                action: () => setShowTemplateGallery(true),
            },
            {
                id: 'import',
                label: 'Import YAML',
                icon: <Upload size={16} />,
                category: 'Navigation',
                action: () => setShowImportModal(true),
            },
            {
                id: 'save',
                label: 'Save Project',
                icon: <Save size={16} />,
                shortcut: '⌘S',
                category: 'Project',
                action: () => setShowSaveModal(true),
            },
            {
                id: 'load',
                label: 'Load Project',
                icon: <FolderOpen size={16} />,
                category: 'Project',
                action: () => setShowLoadModal(true),
            },
            {
                id: 'download',
                label: 'Download docker-compose.yml',
                icon: <Download size={16} />,
                category: 'Project',
                action: handleDownload,
            },
            {
                id: 'undo',
                label: 'Undo',
                icon: <Undo2 size={16} />,
                shortcut: '⌘Z',
                category: 'Edit',
                action: handleUndo,
            },
            {
                id: 'redo',
                label: 'Redo',
                icon: <Redo2 size={16} />,
                shortcut: '⌘⇧Z',
                category: 'Edit',
                action: handleRedo,
            },
            {
                id: 'toggle-yaml',
                label: 'Toggle YAML Preview',
                icon: <FileCode size={16} />,
                category: 'View',
                action: toggleYAMLPanel,
            },
            {
                id: 'toggle-library',
                label: 'Toggle Service Library',
                icon: <Library size={16} />,
                category: 'View',
                action: toggleLibrary,
            },
        ];

        // Add "Clear All" only if there are services
        if (services.length > 0) {
            base.push({
                id: 'clear-all',
                label: 'Clear All Services',
                icon: <Trash2 size={16} />,
                category: 'Edit',
                action: clearAllServices,
            });
        }

        // Add all service templates as "Add <service>"
        const serviceCommands: CommandItem[] = serviceTemplates.map((t) => ({
            id: `add-${t.id}`,
            label: `Add ${t.name}`,
            icon: t.Icon ? <t.Icon size={16} style={{ color: t.color }} /> : <Plus size={16} />,
            category: 'Add Service',
            action: () => addService(t.id),
        }));

        return [...base, ...serviceCommands];
    }, [services.length, handleDownload, handleUndo, handleRedo]);

    const filtered = useMemo(() => {
        if (!search.trim()) return commands;
        const q = search.toLowerCase();
        return commands.filter(
            (c) =>
                c.label.toLowerCase().includes(q) ||
                c.category.toLowerCase().includes(q)
        );
    }, [search, commands]);

    // Group by category
    const grouped = useMemo(() => {
        const map = new Map<string, CommandItem[]>();
        filtered.forEach((item) => {
            if (!map.has(item.category)) map.set(item.category, []);
            map.get(item.category)!.push(item);
        });
        return map;
    }, [filtered]);

    return {
        filtered,
        grouped,
    };
}
