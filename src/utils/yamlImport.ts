import yaml from 'js-yaml';
import type { Service, EnvVar, Port, Volume, ComposeConfig } from '../types';

export function parseYAMLToServices(yamlString: string): { services: Service[]; network: string } {
    let config: ComposeConfig;
    try {
        config = yaml.load(yamlString) as ComposeConfig;
    } catch {
        throw new Error('Invalid YAML format. Please check your syntax.');
    }

    if (!config || typeof config !== 'object' || !config.services) {
        throw new Error('No services found in the YAML file.');
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
                        environment.push({ key: e.slice(0, idx), value: e.slice(idx + 1), isSecret: false });
                    }
                });
            } else {
                Object.entries(svc.environment).forEach(([k, v]) => {
                    const isSecret =
                        k.toLowerCase().includes('password') ||
                        k.toLowerCase().includes('secret') ||
                        k.toLowerCase().includes('key');
                    environment.push({ key: k, value: String(v), isSecret });
                });
            }
        }

        // Parse volumes
        const volumes: Volume[] = (svc.volumes || []).map((v) => {
            const str = String(v);
            const parts = str.split(':');
            if (parts.length >= 2) {
                return {
                    host: parts[0],
                    container: parts[1],
                    mode: parts[2] === 'ro' ? 'ro' : 'rw',
                };
            }
            return { host: str, container: str };
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
            name,
            templateId,
            image: svc.image ? String(svc.image) : 'unknown:latest',
            ports,
            environment,
            volumes,
            networks,
            dependsOn,
            command: svc.command ? String(svc.command) : undefined,
            restart: (svc.restart as Service['restart']) || 'no',
        };
    });

    return { services, network: networkName };
}
