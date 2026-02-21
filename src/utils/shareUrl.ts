import type { Service } from '../types';
import { getTemplateById } from '../data/serviceTemplates';

const PARAM = 's';
const SIZE_LIMIT = 4000;
const CURRENT_VERSION = 1;

/**
 * Compact key mapping to reduce URL length
 */
const KEY_MAP: Record<string, string> = {
    id: 'i',
    name: 'n',
    templateId: 't',
    image: 'im',
    ports: 'p',
    environment: 'e',
    volumes: 'vo',
    networks: 'ne',
    dependsOn: 'd',
    command: 'c',
    restart: 'r',
    healthCheck: 'hc',
    resources: 're',
    buildContext: 'bc',
    dockerfile: 'df',
    buildTarget: 'bt',
    buildArgs: 'ba',
};

const REVERSE_KEY_MAP = Object.fromEntries(
    Object.entries(KEY_MAP).map(([k, v]) => [v, k])
);

/**
 * Deep equality for comparing with defaults
 */
function isDeepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
        if (!keysB.includes(key) || !isDeepEqual(a[key], b[key])) return false;
    }
    return true;
}

export function encodeServicesToURL(services: Service[]): string {
    const compactServices = services.map(service => {
        const template = getTemplateById(service.templateId);
        const compact: any = {};

        // Always include id and templateId
        compact[KEY_MAP.id] = service.id;
        compact[KEY_MAP.templateId] = service.templateId;

        // Conditionally include other fields if they differ from defaults
        if (service.name !== template?.name) compact[KEY_MAP.name] = service.name;
        if (service.image !== template?.defaultImage) compact[KEY_MAP.image] = service.image;

        if (!isDeepEqual(service.ports, template?.defaultPorts)) compact[KEY_MAP.ports] = service.ports;
        if (!isDeepEqual(service.environment, template?.defaultEnvironment)) compact[KEY_MAP.environment] = service.environment;
        if (!isDeepEqual(service.volumes, template?.defaultVolumes)) compact[KEY_MAP.volumes] = service.volumes;
        if (!isDeepEqual(service.networks, [template?.defaultNetwork].filter(Boolean))) compact[KEY_MAP.networks] = service.networks;

        if (service.dependsOn.length > 0) compact[KEY_MAP.dependsOn] = service.dependsOn;
        if (service.command) compact[KEY_MAP.command] = service.command;
        if (service.restart && service.restart !== 'no') compact[KEY_MAP.restart] = service.restart;
        if (service.healthCheck) compact[KEY_MAP.healthCheck] = service.healthCheck;
        if (service.resources) compact[KEY_MAP.resources] = service.resources;

        if (service.buildContext !== template?.defaultBuildContext) compact[KEY_MAP.buildContext] = service.buildContext;
        if (service.dockerfile !== template?.defaultDockerfile) compact[KEY_MAP.dockerfile] = service.dockerfile;
        if (service.buildTarget !== template?.defaultBuildTarget) compact[KEY_MAP.buildTarget] = service.buildTarget;
        if (!isDeepEqual(service.buildArgs, template?.defaultBuildArgs)) compact[KEY_MAP.buildArgs] = service.buildArgs;

        return compact;
    });

    const payload = {
        v: CURRENT_VERSION,
        s: compactServices
    };

    const json = JSON.stringify(payload);
    const encoded = btoa(encodeURIComponent(json));

    if (encoded.length > SIZE_LIMIT) {
        throw new Error('Stack too large to share via URL. Use Save/Load instead.');
    }

    return `${window.location.origin}${window.location.pathname}#${PARAM}=${encoded}`;
}

export function decodeServicesFromURL(): Service[] | null {
    try {
        const hash = window.location.hash;
        const match = hash.match(new RegExp(`#${PARAM}=([^&]+)`));
        if (!match) return null;

        const json = decodeURIComponent(atob(match[1]));
        const parsed = JSON.parse(json);

        // Handle legacy format (direct array)
        if (Array.isArray(parsed)) {
            return parsed as Service[];
        }

        // Handle versioned compact format
        if (parsed.v === 1 && Array.isArray(parsed.s)) {
            return parsed.s.map((compact: any) => {
                // Expand keys
                const expanded: any = {};
                for (const [key, value] of Object.entries(compact)) {
                    const fullKey = REVERSE_KEY_MAP[key] || key;
                    expanded[fullKey] = value;
                }

                const template = getTemplateById(expanded.templateId);
                if (!template) return expanded as Service;

                // Fill defaults
                return {
                    id: expanded.id,
                    templateId: expanded.templateId,
                    name: expanded.name ?? template.name,
                    image: expanded.image ?? template.defaultImage,
                    ports: expanded.ports ?? [...template.defaultPorts],
                    environment: expanded.environment ?? [...template.defaultEnvironment],
                    volumes: expanded.volumes ?? [...template.defaultVolumes],
                    networks: expanded.networks ?? [template.defaultNetwork].filter(Boolean),
                    dependsOn: expanded.dependsOn ?? [],
                    command: expanded.command,
                    restart: expanded.restart ?? 'no',
                    healthCheck: expanded.healthCheck,
                    resources: expanded.resources,
                    buildContext: expanded.buildContext ?? template.defaultBuildContext,
                    dockerfile: expanded.dockerfile ?? template.defaultDockerfile,
                    buildTarget: expanded.buildTarget ?? template.defaultBuildTarget,
                    buildArgs: expanded.buildArgs ?? template.defaultBuildArgs,
                } as Service;
            });
        }

        return null;
    } catch {
        return null;
    }
}

export function clearURLState() {
    const url = new URL(window.location.href);
    url.hash = '';
    window.history.replaceState(null, '', url.pathname + url.search);
}
