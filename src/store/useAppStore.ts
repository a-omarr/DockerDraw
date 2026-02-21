import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import type {
    Service,
    EnvironmentPreset,
    SavedProject,
    ValidationWarning,
    PortConflict,
} from '../types';
import type { ServiceTemplate } from '../types';

import { serviceTemplates } from '../data/serviceTemplates';
import { generateDockerCompose } from '../utils/yamlGenerator';
import { detectPortConflicts } from '../utils/portConflict';
import { validateServices } from '../utils/validation';

function createServiceFromTemplate(template: ServiceTemplate): Service {
    return {
        id: crypto.randomUUID(),
        name: template.id.replace(/[^a-z0-9]/g, '_'),
        templateId: template.id,
        image: template.defaultImage,
        ports: template.defaultPorts.map((p) => ({ ...p })),
        environment: template.defaultEnvironment.map((e) => ({ ...e })),
        volumes: template.defaultVolumes.map((v) => ({ ...v })),
        networks: [template.defaultNetwork],
        dependsOn: [],
        restart: 'no',
        buildContext: template.defaultBuildContext,
        dockerfile: template.defaultDockerfile,
        buildTarget: template.defaultBuildTarget,
        buildArgs: template.defaultBuildArgs ? { ...template.defaultBuildArgs } : undefined,
    };
}

function computeDerived(services: Service[], networkName: string, environmentPreset: EnvironmentPreset) {
    return {
        yamlOutput: generateDockerCompose(services, networkName, environmentPreset),
        warnings: validateServices(services),
        portConflicts: detectPortConflicts(services),
    };
}

interface AppState {
    // Project
    projectName: string;
    networkName: string;
    environmentPreset: EnvironmentPreset;

    // Services
    services: Service[];
    selectedServiceId: string | null;

    // UI
    showYAMLPanel: boolean;
    showLibrary: boolean;
    showTemplateGallery: boolean;
    showImportModal: boolean;
    showSaveModal: boolean;
    showLoadModal: boolean;
    showSuccessModal: boolean;
    showCommandPalette: boolean;
    showAddServiceModal: boolean;

    // Derived
    yamlOutput: string;
    warnings: ValidationWarning[];
    portConflicts: PortConflict[];

    // Saved projects
    savedProjects: SavedProject[];

    // Actions
    setProjectName: (name: string) => void;
    setNetworkName: (name: string) => void;
    setEnvironmentPreset: (preset: EnvironmentPreset) => void;

    addService: (templateId: string) => void;
    removeService: (id: string) => void;
    updateService: (id: string, updates: Partial<Service>) => void;
    selectService: (id: string | null) => void;
    reorderServices: (activeId: string, overId: string) => void;
    clearAllServices: () => void;
    duplicateService: (id: string) => void;

    toggleYAMLPanel: () => void;
    toggleLibrary: () => void;
    setShowYAMLPanel: (show: boolean) => void;
    setShowLibrary: (show: boolean) => void;
    setShowTemplateGallery: (show: boolean) => void;
    setShowImportModal: (show: boolean) => void;
    setShowSaveModal: (show: boolean) => void;
    setShowLoadModal: (show: boolean) => void;
    setShowSuccessModal: (show: boolean) => void;
    setShowCommandPalette: (show: boolean) => void;
    setShowAddServiceModal: (show: boolean) => void;

    saveProject: (name: string) => void;
    loadProject: (id: string) => void;
    deleteProject: (id: string) => void;
    importFromYAML: (services: Service[], network: string) => void;
    loadTemplate: (services: Omit<Service, 'id'>[]) => void;

    refreshDerived: () => void;
}

export const useAppStore = create<AppState>()(
    temporal(
        persist(
            (set, get) => ({
                projectName: 'my-project',
                networkName: 'app_network',
                environmentPreset: 'development',

                services: [],
                selectedServiceId: null,

                showYAMLPanel: false,
                showLibrary: false,
                showTemplateGallery: false,
                showImportModal: false,
                showSaveModal: false,
                showLoadModal: false,
                showSuccessModal: false,
                showCommandPalette: false,
                showAddServiceModal: false,

                yamlOutput: '',
                warnings: [],
                portConflicts: [],

                savedProjects: [],

                setProjectName: (name) => {
                    const s = get();
                    set({ projectName: name, ...computeDerived(s.services, s.networkName, s.environmentPreset) });
                },
                setNetworkName: (name) => {
                    const s = get();
                    set({ networkName: name, ...computeDerived(s.services, name, s.environmentPreset) });
                },
                setEnvironmentPreset: (preset) => {
                    const s = get();
                    const updated = s.services.map((svc) => {
                        if (preset === 'production') {
                            return { ...svc, restart: 'unless-stopped' as const, ports: svc.ports.map((p) => ({ ...p })) };
                        } else {
                            return { ...svc, restart: 'no' as const };
                        }
                    });
                    set({ environmentPreset: preset, services: updated, ...computeDerived(updated, s.networkName, preset) });
                },

                addService: (templateId) => {
                    const template = serviceTemplates.find((t) => t.id === templateId);
                    if (!template) return;
                    const newService = createServiceFromTemplate(template);
                    const s = get();
                    const existingNames = s.services.map((svc) => svc.name);
                    if (existingNames.includes(newService.name)) {
                        let count = 2;
                        while (existingNames.includes(`${newService.name}_${count}`)) count++;
                        newService.name = `${newService.name}_${count}`;
                    }
                    const newServices = [...s.services, newService];
                    set({ services: newServices, ...computeDerived(newServices, s.networkName, s.environmentPreset) });
                },

                removeService: (id) => {
                    const s = get();
                    const newServices = s.services
                        .filter((svc) => svc.id !== id)
                        .map((svc) => ({ ...svc, dependsOn: svc.dependsOn.filter((depId) => depId !== id) }));
                    set({
                        services: newServices,
                        selectedServiceId: s.selectedServiceId === id ? null : s.selectedServiceId,
                        ...computeDerived(newServices, s.networkName, s.environmentPreset),
                    });
                },

                updateService: (id, updates) => {
                    const s = get();
                    const newServices = s.services.map((svc) => (svc.id === id ? { ...svc, ...updates } : svc));
                    set({ services: newServices, ...computeDerived(newServices, s.networkName, s.environmentPreset) });
                },

                selectService: (id) => set({ selectedServiceId: id }),

                reorderServices: (activeId, overId) => {
                    const s = get();
                    const oldIndex = s.services.findIndex((svc) => svc.id === activeId);
                    const newIndex = s.services.findIndex((svc) => svc.id === overId);
                    if (oldIndex === -1 || newIndex === -1) return;
                    const reordered = [...s.services];
                    const [moved] = reordered.splice(oldIndex, 1);
                    reordered.splice(newIndex, 0, moved);
                    set({ services: reordered, ...computeDerived(reordered, s.networkName, s.environmentPreset) });
                },

                clearAllServices: () => {
                    const s = get();
                    set({ services: [], selectedServiceId: null, ...computeDerived([], s.networkName, s.environmentPreset) });
                },

                duplicateService: (id) => {
                    const s = get();
                    const original = s.services.find((svc) => svc.id === id);
                    if (!original) return;
                    const copy: Service = {
                        ...original,
                        id: crypto.randomUUID(),
                        name: `${original.name}_copy`,
                        ports: original.ports.map((p) => ({ ...p, host: p.host + 1 })),
                    };
                    const newServices = [...s.services, copy];
                    set({ services: newServices, ...computeDerived(newServices, s.networkName, s.environmentPreset) });
                },

                toggleYAMLPanel: () => set((state) => ({ showYAMLPanel: !state.showYAMLPanel })),
                toggleLibrary: () => set((state) => ({ showLibrary: !state.showLibrary })),
                setShowYAMLPanel: (show) => set({ showYAMLPanel: show }),
                setShowLibrary: (show) => set({ showLibrary: show }),
                setShowTemplateGallery: (show) => set({ showTemplateGallery: show }),
                setShowImportModal: (show) => set({ showImportModal: show }),
                setShowSaveModal: (show) => set({ showSaveModal: show }),
                setShowLoadModal: (show) => set({ showLoadModal: show }),
                setShowSuccessModal: (show) => set({ showSuccessModal: show }),
                setShowCommandPalette: (show) => set({ showCommandPalette: show }),
                setShowAddServiceModal: (show) => set({ showAddServiceModal: show }),

                saveProject: (name) => {
                    const { services, networkName, environmentPreset, savedProjects } = get();
                    const now = new Date().toISOString();
                    const existing = savedProjects.find((p) => p.name === name);
                    if (existing) {
                        set({
                            savedProjects: savedProjects.map((p) =>
                                p.id === existing.id ? { ...p, services, network: networkName, preset: environmentPreset, updatedAt: now } : p
                            ),
                        });
                    } else {
                        const project: SavedProject = {
                            id: crypto.randomUUID(),
                            name,
                            services,
                            network: networkName,
                            preset: environmentPreset,
                            createdAt: now,
                            updatedAt: now,
                        };
                        set((state) => ({ savedProjects: [...state.savedProjects, project] }));
                    }
                },

                loadProject: (id) => {
                    const s = get();
                    const project = s.savedProjects.find((p) => p.id === id);
                    if (!project) return;
                    set({
                        services: project.services,
                        networkName: project.network,
                        environmentPreset: project.preset,
                        selectedServiceId: null,
                        ...computeDerived(project.services, project.network, project.preset),
                    });
                },

                deleteProject: (id) => {
                    set((state) => ({ savedProjects: state.savedProjects.filter((p) => p.id !== id) }));
                },

                importFromYAML: (services, network) => {
                    const s = get();
                    set({ services, networkName: network, selectedServiceId: null, ...computeDerived(services, network, s.environmentPreset) });
                },

                loadTemplate: (services) => {
                    const s = get();
                    const newServices = services.map((svc) => ({ ...svc, id: crypto.randomUUID() }));
                    set({ services: newServices, selectedServiceId: null, ...computeDerived(newServices, s.networkName, s.environmentPreset) });
                },

                refreshDerived: () => {
                    const { services, networkName, environmentPreset } = get();
                    const yaml = generateDockerCompose(services, networkName, environmentPreset);
                    const warnings = validateServices(services);
                    const portConflicts = detectPortConflicts(services);
                    set({ yamlOutput: yaml, warnings, portConflicts });
                },
            }),
            {
                name: 'dockerdraw-store',
                storage: {
                    getItem: (name: string) => {
                        try {
                            const str = localStorage.getItem(name);
                            return str ? JSON.parse(str) : null;
                        } catch {
                            // Corrupted data — wipe and start fresh
                            try { localStorage.removeItem(name); } catch { /* ignore */ }
                            return null;
                        }
                    },
                    setItem: (name: string, value: unknown) => {
                        try {
                            localStorage.setItem(name, JSON.stringify(value));
                        } catch {
                            // Quota exceeded or unavailable — silently skip
                        }
                    },
                    removeItem: (name: string) => {
                        try { localStorage.removeItem(name); } catch { /* ignore */ }
                    },
                },
                partialize: (state) => ({
                    savedProjects: state.savedProjects,
                }),
            }
        ),
        {
            limit: 30,
            partialize: (state) => ({
                services: state.services,
                projectName: state.projectName,
                networkName: state.networkName,
                environmentPreset: state.environmentPreset,
            }),
            equality: (pastState, currentState) =>
                JSON.stringify(pastState) === JSON.stringify(currentState),
        }
    )
);
