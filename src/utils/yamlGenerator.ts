import yaml from 'js-yaml';
import type { Service, ComposeConfig, EnvironmentPreset } from '../types';

export function generateDockerCompose(
    services: Service[],
    networkName = 'app_network',
    preset: EnvironmentPreset = 'development',
    _projectName = 'my-project'
): string {
    if (services.length === 0) {
        return `# Add services to generate your docker-compose.yml\nversion: '3.8'\n\nservices: {}\n`;
    }

    const serviceMap: ComposeConfig['services'] = {};

    services.forEach((service) => {
        const envRecord: Record<string, string> = {};
        service.environment.forEach((e) => {
            envRecord[e.key] = e.value;
        });

        const entry: ComposeConfig['services'][string] = {
            image: service.image,
        };

        if (service.buildContext) {
            entry.build = service.buildContext;
            delete entry.image;
        }

        // Ports — only expose in development (or all in prod for explicitly mapped)
        if (service.ports.length > 0) {
            if (preset === 'development') {
                entry.ports = service.ports.map(
                    (p) => `${p.host}:${p.container}${p.protocol === 'udp' ? '/udp' : ''}`
                );
            } else {
                // Production: expose ports but they are intentional
                entry.ports = service.ports.map(
                    (p) => `${p.host}:${p.container}${p.protocol === 'udp' ? '/udp' : ''}`
                );
            }
        }

        if (Object.keys(envRecord).length > 0) {
            entry.environment = envRecord;
        }

        if (service.volumes.length > 0) {
            entry.volumes = service.volumes.map(
                (v) => `${v.host}:${v.container}${v.mode === 'ro' ? ':ro' : ''}`
            );
        }

        if (service.networks.length > 0) {
            entry.networks = service.networks;
        } else {
            entry.networks = [networkName];
        }

        if (service.dependsOn.length > 0) {
            entry.depends_on = service.dependsOn;
        }

        if (service.command) {
            entry.command = service.command;
        }

        // Restart policy
        if (preset === 'production') {
            entry.restart = 'unless-stopped';
        } else if (service.restart && service.restart !== 'no') {
            entry.restart = service.restart;
        }

        // Health check (production)
        if (preset === 'production' && service.healthCheck) {
            entry.healthcheck = {
                test: service.healthCheck.test,
                interval: service.healthCheck.interval,
                timeout: service.healthCheck.timeout,
                retries: service.healthCheck.retries,
            };
        }

        // Resource limits (production)
        if (preset === 'production' && service.resources) {
            entry.deploy = {
                resources: {
                    limits: {
                        cpus: service.resources.cpus,
                        memory: service.resources.memory,
                    },
                },
            };
        }

        serviceMap[service.name] = entry;
    });

    // Collect named volumes (those not starting with ./ or /)
    const namedVolumes: string[] = [];
    services.forEach((s) => {
        s.volumes.forEach((v) => {
            if (!v.host.startsWith('./') && !v.host.startsWith('/') && !v.host.startsWith('~')) {
                namedVolumes.push(v.host);
            }
        });
    });

    // Collect all networks
    const allNetworks = new Set<string>([networkName]);
    services.forEach((s) => s.networks.forEach((n) => allNetworks.add(n)));

    const config: ComposeConfig = {
        version: '3.8',
        services: serviceMap,
        networks: {},
    };

    allNetworks.forEach((n) => {
        config.networks![n] = { driver: 'bridge' };
    });

    if (namedVolumes.length > 0) {
        config.volumes = {};
        namedVolumes.forEach((v) => {
            config.volumes![v] = {};
        });
    }

    try {
        return yaml.dump(config, {
            lineWidth: -1,
            noRefs: true,
            quotingType: '"',
        });
    } catch (e) {
        return `# Error generating YAML: ${e}`;
    }
}
