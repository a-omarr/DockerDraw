import yaml from 'js-yaml';
import type { Service, EnvVar, Port, Volume, ComposeConfig } from '../types';
import { resolveDependencyNamesToIds } from './serviceUtils';

const MAX_YAML_SIZE = 100 * 1024; // 100 KB
const MAX_SERVICES = 50;
const MAX_NAME_LENGTH = 64;

/** Strip HTML tags (prevents XSS via service names rendered into the DOM) */
function stripHtml(str: string): string {
    return str.replace(/<[^>]*>/g, '');
}

/** Sanitize a service name to safe characters only */
export function sanitizeName(raw: string): string {
    const stripped = stripHtml(raw);
    const safe = stripped.replace(/[^a-zA-Z0-9_.-]/g, '_');
    return safe.slice(0, MAX_NAME_LENGTH) || 'service';
}

/** Sanitize any string value (env vars, commands, image names) */
export function sanitizeValue(raw: unknown): string {
    const str = String(raw ?? '');
    // Remove <script> blocks and stray HTML tags
    return str
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]*>/g, '');
}

export function parseYAMLToServices(yamlString: string): { services: Service[]; network: string } {
    // ── Size guard ──────────────────────────────────
    if (yamlString.length > MAX_YAML_SIZE) {
        throw new Error(`YAML input is too large (${(yamlString.length / 1024).toFixed(0)} KB). Maximum allowed is ${MAX_YAML_SIZE / 1024} KB.`);
    }

    let config: ComposeConfig;
    try {
        config = yaml.load(yamlString) as ComposeConfig;
    } catch {
        throw new Error('Invalid YAML format. Please check your syntax.');
    }

    if (!config || typeof config !== 'object' || !config.services) {
        throw new Error('No services found in the YAML file.');
    }

    // ── Service count guard ─────────────────────────
    const serviceKeys = Object.keys(config.services);
    if (serviceKeys.length > MAX_SERVICES) {
        throw new Error(`Too many services (${serviceKeys.length}). Maximum allowed is ${MAX_SERVICES}.`);
    }

    const networkName =
        config.networks ? Object.keys(config.networks)[0] || 'app_network' : 'app_network';

    const services: Service[] = Object.entries(config.services).map(([name, svc]) => {
        // Parse ports
        const ports: Port[] = (svc.ports || []).map((p) => {
            const str = String(p);
            const parts = str.split(':');
            if (parts.length === 2) {
                return { host: parseInt(parts[0]), container: parseInt(parts[1]) };
            }
            const n = parseInt(str);
            return { host: n, container: n };
        });

        // Parse environment
        const environment: EnvVar[] = [];
        if (svc.environment) {
            if (Array.isArray(svc.environment)) {
                svc.environment.forEach((e) => {
                    const idx = e.indexOf('=');
                    if (idx !== -1) {
                        environment.push({ key: sanitizeValue(e.slice(0, idx)), value: sanitizeValue(e.slice(idx + 1)), isSecret: false });
                    }
                });
            } else {
                Object.entries(svc.environment).forEach(([k, v]) => {
                    const isSecret =
                        k.toLowerCase().includes('password') ||
                        k.toLowerCase().includes('secret') ||
                        k.toLowerCase().includes('token') ||
                        k.toLowerCase().includes('key');
                    environment.push({ key: sanitizeValue(k), value: sanitizeValue(v), isSecret });
                });
            }
        }

        // Parse volumes
        const volumes: Volume[] = (svc.volumes || []).map((v) => {
            const str = String(v);
            const parts = str.split(':');
            if (parts.length >= 2) {
                return {
                    host: sanitizeValue(parts[0]),
                    container: sanitizeValue(parts[1]),
                    mode: parts[2] === 'ro' ? 'ro' : 'rw',
                };
            }
            return { host: sanitizeValue(str), container: sanitizeValue(str) };
        });

        // Parse depends_on
        let dependsOn: string[] = [];
        if (svc.depends_on) {
            if (Array.isArray(svc.depends_on)) {
                dependsOn = svc.depends_on as string[];
            } else if (typeof svc.depends_on === 'object') {
                dependsOn = Object.keys(svc.depends_on);
            }
        }

        // Parse networks
        const networks: string[] = svc.networks || [networkName];

        // Guess templateId from image
        const image = String(svc.image || '');
        let templateId = 'nodejs';
        if (image.startsWith('postgres')) templateId = 'postgresql';
        else if (image.startsWith('mysql')) templateId = 'mysql';
        else if (image.startsWith('mongo')) templateId = 'mongodb';
        else if (image.startsWith('redis')) templateId = 'redis';
        else if (image.startsWith('nginx')) templateId = 'nginx';
        else if (image.startsWith('rabbitmq')) templateId = 'rabbitmq';
        else if (image.startsWith('python')) templateId = 'python';
        else if (image.startsWith('elasticsearch')) templateId = 'elasticsearch';
        else if (image.startsWith('grafana')) templateId = 'grafana';
        else if (image.startsWith('minio')) templateId = 'minio';

        return {
            id: crypto.randomUUID(),
            name: sanitizeName(name),
            templateId,
            image: svc.image ? sanitizeValue(svc.image) : 'unknown:latest',
            ports,
            environment,
            volumes,
            networks,
            dependsOn,
            command: svc.command ? sanitizeValue(svc.command) : undefined,
            restart: (svc.restart as Service['restart']) || 'no',
        };
    });

    const resolvedServices = resolveDependencyNamesToIds(services);
    return { services: resolvedServices, network: networkName };
}
