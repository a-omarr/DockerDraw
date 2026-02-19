import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
    duplicateService: (id: string) => void;

    toggleYAMLPanel: () => void;
    toggleLibrary: () => void;
    setShowTemplateGallery: (show: boolean) => void;
    setShowImportModal: (show: boolean) => void;
    setShowSaveModal: (show: boolean) => void;
    setShowLoadModal: (show: boolean) => void;
    setShowSuccessModal: (show: boolean) => void;

    saveProject: (name: string) => void;
    loadProject: (id: string) => void;
    deleteProject: (id: string) => void;
    importFromYAML: (services: Service[], network: string) => void;
    loadTemplate: (services: Omit<Service, 'id'>[]) => void;

    refreshDerived: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            projectName: 'my-project',
            networkName: 'app_network',
            environmentPreset: 'development',

            services: [],
            selectedServiceId: null,

            showYAMLPanel: true,
            showLibrary: true,
            showTemplateGallery: false,
            showImportModal: false,
            showSaveModal: false,
            showLoadModal: false,
            showSuccessModal: false,

            yamlOutput: '',
            warnings: [],
            portConflicts: [],

            savedProjects: [],

            setProjectName: (name) => {
                set({ projectName: name });
                get().refreshDerived();
            },
            setNetworkName: (name) => {
                set({ networkName: name });
                get().refreshDerived();
            },
            setEnvironmentPreset: (preset) => {
                // Apply preset changes to all services
                const { services } = get();
                const updated = services.map((s) => {
                    if (preset === 'production') {
                        return {
                            ...s,
                            restart: 'unless-stopped' as const,
                            ports: s.ports.map((p) => ({ ...p })),
                        };
                    } else {
                        return { ...s, restart: 'no' as const };
                    }
                });
                set({ environmentPreset: preset, services: updated });
                get().refreshDerived();
            },

            addService: (templateId) => {
                const template = serviceTemplates.find((t) => t.id === templateId);
                if (!template) return;
                const newService = createServiceFromTemplate(template);
                // Ensure unique name
                const { services } = get();
                const existingNames = services.map((s) => s.name);
                if (existingNames.includes(newService.name)) {
                    let count = 2;
                    while (existingNames.includes(`${newService.name}_${count}`)) count++;
                    newService.name = `${newService.name}_${count}`;
                }
                set((state) => ({ services: [...state.services, newService] }));
                get().refreshDerived();
            },

            removeService: (id) => {
                set((state) => ({
                    services: state.services
                        .filter((s) => s.id !== id)
                        .map((s) => ({
                            ...s,
                            dependsOn: s.dependsOn.filter((dep) => {
                                const depService = state.services.find((sv) => sv.id === id);
                                return dep !== depService?.name;
                            }),
                        })),
                    selectedServiceId: state.selectedServiceId === id ? null : state.selectedServiceId,
                }));
                get().refreshDerived();
            },

            updateService: (id, updates) => {
                set((state) => ({
                    services: state.services.map((s) => (s.id === id ? { ...s, ...updates } : s)),
                }));
                get().refreshDerived();
            },

            selectService: (id) => set({ selectedServiceId: id }),

            duplicateService: (id) => {
                const { services } = get();
                const original = services.find((s) => s.id === id);
                if (!original) return;
                const copy: Service = {
                    ...original,
                    id: crypto.randomUUID(),
                    name: `${original.name}_copy`,
                    ports: original.ports.map((p) => ({ ...p, host: p.host + 1 })),
                };
                set((state) => ({ services: [...state.services, copy] }));
                get().refreshDerived();
            },

            toggleYAMLPanel: () => set((state) => ({ showYAMLPanel: !state.showYAMLPanel })),
            toggleLibrary: () => set((state) => ({ showLibrary: !state.showLibrary })),
            setShowTemplateGallery: (show) => set({ showTemplateGallery: show }),
            setShowImportModal: (show) => set({ showImportModal: show }),
            setShowSaveModal: (show) => set({ showSaveModal: show }),
            setShowLoadModal: (show) => set({ showLoadModal: show }),
            setShowSuccessModal: (show) => set({ showSuccessModal: show }),

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
                const { savedProjects } = get();
                const project = savedProjects.find((p) => p.id === id);
                if (!project) return;
                set({
                    services: project.services,
                    networkName: project.network,
                    environmentPreset: project.preset,
                    selectedServiceId: null,
                });
                get().refreshDerived();
            },

            deleteProject: (id) => {
                set((state) => ({ savedProjects: state.savedProjects.filter((p) => p.id !== id) }));
            },

            importFromYAML: (services, network) => {
                set({ services, networkName: network, selectedServiceId: null });
                get().refreshDerived();
            },

            loadTemplate: (services) => {
                const newServices = services.map((s) => ({ ...s, id: crypto.randomUUID() }));
                set({ services: newServices, selectedServiceId: null });
                get().refreshDerived();
            },

            refreshDerived: () => {
                const { services, networkName, environmentPreset, projectName } = get();
                const yaml = generateDockerCompose(services, networkName, environmentPreset, projectName);
                const warnings = validateServices(services);
                const portConflicts = detectPortConflicts(services);
                set({ yamlOutput: yaml, warnings, portConflicts });
            },
        }),
        {
            name: 'dockerdraw-store',
            partialize: (state) => ({
                savedProjects: state.savedProjects,
            }),
        }
    )
);
