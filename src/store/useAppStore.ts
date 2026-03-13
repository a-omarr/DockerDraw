import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import type {
    Service,
    EnvironmentPreset,
    SavedProject,
    ValidationWarning,
    PortConflict,
    AuditFinding,
} from '../types';
import type { ChatMessage } from '../types/chat';

import { serviceTemplates } from '../data/serviceTemplates';
import { resolveDependencyNamesToIds, createServiceFromTemplate } from '../utils/serviceUtils';
import { computeDerived } from '../utils/storeUtils';

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
    showChatPanel: boolean;
    showAuditModal: boolean;

    // AI Audit
    isAuditing: boolean;
    auditFindings: AuditFinding[];

    // AI Chat
    chatMessages: ChatMessage[];
    isChatLoading: boolean;
    groqApiKey: string | null;

    // Derived
    yamlOutput: string;
    warnings: ValidationWarning[];
    portConflicts: PortConflict[];
    totalPorts: number;
    totalVolumes: number;
    totalEnvVars: number;

    // Saved projects
    savedProjects: SavedProject[];

    isDirty: boolean;

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
    toggleChatPanel: () => void;
    setModalVisibility: (modal: 'showYAMLPanel' | 'showLibrary' | 'showTemplateGallery' | 'showImportModal' | 'showSaveModal' | 'showLoadModal' | 'showSuccessModal' | 'showCommandPalette' | 'showAddServiceModal' | 'showChatPanel' | 'showAuditModal', show: boolean) => void;

    // Audit Actions
    performAudit: () => Promise<void>;
    applyAuditFix: (findingId: string) => void;
    dismissAuditFinding: (findingId: string) => void;

    // Chat Actions
    addChatMessage: (msg: ChatMessage) => void;
    setChatLoading: (loading: boolean) => void;
    setGroqApiKey: (key: string | null) => void;
    clearChat: () => void;

    saveProject: (name: string) => void;
    loadProject: (id: string) => void;
    deleteProject: (id: string) => void;
    importFromYAML: (services: Service[], network: string) => void;
    loadTemplate: (services: Omit<Service, 'id'>[]) => void;
    setIsDirty: (isDirty: boolean) => void;

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
                showChatPanel: false,
                showAuditModal: false,

                isAuditing: false,
                auditFindings: [],

                chatMessages: [],
                isChatLoading: false,
                groqApiKey: null,

                yamlOutput: '',
                warnings: [],
                portConflicts: [],
                totalPorts: 0,
                totalVolumes: 0,
                totalEnvVars: 0,
                isDirty: false,

                savedProjects: [],

                setProjectName: (name) => {
                    const s = get();
                    set({ projectName: name, isDirty: true, ...computeDerived(s.services, s.networkName, s.environmentPreset) });
                },
                setNetworkName: (name) => {
                    const s = get();
                    set({ networkName: name, isDirty: true, ...computeDerived(s.services, name, s.environmentPreset) });
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
                    set({ environmentPreset: preset, services: updated, isDirty: true, ...computeDerived(updated, s.networkName, preset) });
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
                    set({
                        services: newServices,
                        selectedServiceId: newService.id,
                        showYAMLPanel: true,
                        showLibrary: false, // Auto-close library on mobile
                        isDirty: true,
                        ...computeDerived(newServices, s.networkName, s.environmentPreset)
                    });
                },

                removeService: (id) => {
                    const s = get();
                    const newServices = s.services
                        .filter((svc) => svc.id !== id)
                        .map((svc) => ({ ...svc, dependsOn: svc.dependsOn.filter((depId) => depId !== id) }));
                    set({
                        services: newServices,
                        selectedServiceId: s.selectedServiceId === id ? null : s.selectedServiceId,
                        isDirty: true,
                        ...computeDerived(newServices, s.networkName, s.environmentPreset),
                    });
                },

                updateService: (id, updates) => {
                    const s = get();
                    const newServices = s.services.map((svc) => (svc.id === id ? { ...svc, ...updates } : svc));
                    set({ services: newServices, isDirty: true, ...computeDerived(newServices, s.networkName, s.environmentPreset) });
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
                    set({ services: reordered, isDirty: true, ...computeDerived(reordered, s.networkName, s.environmentPreset) });
                },

                clearAllServices: () => {
                    const s = get();
                    set({ services: [], selectedServiceId: null, isDirty: true, ...computeDerived([], s.networkName, s.environmentPreset) });
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
                    set({ services: newServices, isDirty: true, ...computeDerived(newServices, s.networkName, s.environmentPreset) });
                },

                toggleYAMLPanel: () => set((state) => ({ showYAMLPanel: !state.showYAMLPanel })),
                toggleLibrary: () => set((state) => ({ showLibrary: !state.showLibrary })),
                toggleChatPanel: () => set((state) => ({ showChatPanel: !state.showChatPanel })),
                setModalVisibility: (modal, show) => set({ [modal]: show }),

                addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
                setChatLoading: (loading) => set({ isChatLoading: loading }),
                setGroqApiKey: (key) => set({ groqApiKey: key }),
                clearChat: () => set({ chatMessages: [] }),

                saveProject: (name) => {
                    const { services, networkName, environmentPreset, savedProjects } = get();
                    const now = new Date().toISOString();
                    const existing = savedProjects.find((p) => p.name === name);
                    if (existing) {
                        set({
                            savedProjects: savedProjects.map((p) =>
                                p.id === existing.id ? { ...p, services, network: networkName, preset: environmentPreset, updatedAt: now } : p
                            ),
                            isDirty: false,
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
                        set((state) => ({ savedProjects: [...state.savedProjects, project], isDirty: false }));
                    }
                },

                loadProject: (id) => {
                    const s = get();
                    const project = s.savedProjects.find((p) => p.id === id);
                    if (!project) return;
                    set({
                        projectName: project.name,
                        services: project.services,
                        networkName: project.network,
                        environmentPreset: project.preset,
                        selectedServiceId: null,
                        isDirty: false,
                        ...computeDerived(project.services, project.network, project.preset),
                    });
                },

                deleteProject: (id) => {
                    set((state) => ({ savedProjects: state.savedProjects.filter((p) => p.id !== id) }));
                },

                importFromYAML: (services, network) => {
                    const s = get();
                    set({
                        services,
                        networkName: network,
                        selectedServiceId: services.length > 0 ? services[0].id : null,
                        showYAMLPanel: true,
                        isDirty: false,
                        ...computeDerived(services, network, s.environmentPreset)
                    });
                },

                loadTemplate: (services) => {
                    const s = get();
                    const renamedServices = services.map((svc) => ({ ...svc, id: crypto.randomUUID() }));
                    const resolvedServices = resolveDependencyNamesToIds(renamedServices as Service[]);
                    set({
                        services: resolvedServices,
                        selectedServiceId: resolvedServices.length > 0 ? resolvedServices[0].id : null,
                        showYAMLPanel: true,
                        showLibrary: false, // Auto-close library on mobile
                        isDirty: true,
                        ...computeDerived(resolvedServices, s.networkName, s.environmentPreset)
                    });
                },

                refreshDerived: () => {
                    const { services, networkName, environmentPreset } = get();
                    set({ ...computeDerived(services, networkName, environmentPreset) });
                },

                setIsDirty: (isDirty) => set({ isDirty }),

                performAudit: async () => {
                    const { services, yamlOutput } = get();
                    if (services.length === 0) return;

                    set({ isAuditing: true, showAuditModal: true, auditFindings: [] });

                    try {
                        const response = await fetch('/api/chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                messages: [{ 
                                    role: 'user', 
                                    content: 'Please audit my current docker-compose configuration for security, performance, and best practices. Return your findings ONLY as a JSON array of objects. Each object must have: id (unique string), title, message, severity (critical|warning|info), category (Security|Best Practice|Performance), serviceId (optional), fixAvailable (boolean), fixDescription (string, optional), and fixData (optional Partial<Service> object with fields to update).' 
                                }],
                                yamlContext: yamlOutput
                            }),
                        });

                        const data = await response.json();
                        if (!response.ok) throw new Error(data.error || 'Audit failed');

                        // Clean JSON from markdown if needed
                        let content = data.content.trim();
                        if (content.startsWith('```json')) {
                            content = content.replace(/^```json/, '').replace(/```$/, '').trim();
                        } else if (content.startsWith('```')) {
                            content = content.replace(/^```/, '').replace(/```$/, '').trim();
                        }

                        const results = JSON.parse(content);
                        set({ auditFindings: Array.isArray(results) ? results : [] });
                    } catch (error) {
                        console.error('Audit Exception:', error);
                        set({ 
                          auditFindings: [{
                            id: 'error',
                            title: 'Audit Failed',
                            message: error instanceof Error ? error.message : 'An unexpected error occurred during audit.',
                            severity: 'critical',
                            category: 'Security',
                            fixAvailable: false
                          }]
                        });
                    } finally {
                        set({ isAuditing: false });
                    }
                },

                applyAuditFix: (findingId) => {
                    const s = get();
                    const finding = s.auditFindings.find(f => f.id === findingId);
                    if (!finding || !finding.fixAvailable || !finding.fixData) return;

                    if (finding.serviceId) {
                        s.updateService(finding.serviceId, finding.fixData);
                    } else {
                        // Global fix if applicable? (e.g. network name)
                        // For now we mostly support service-level fixes.
                    }

                    set({ auditFindings: s.auditFindings.filter(f => f.id !== findingId) });
                },

                dismissAuditFinding: (findingId) => {
                    set(state => ({ auditFindings: state.auditFindings.filter(f => f.id !== findingId) }));
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
                    groqApiKey: state.groqApiKey,
                    chatMessages: state.chatMessages,
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
