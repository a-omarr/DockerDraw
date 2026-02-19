import type { Service, ValidationWarning } from '../types';

const WEAK_PASSWORDS = ['changeme', 'password', '123456', 'admin', 'secret', 'pass', 'test'];

export function validateServices(services: Service[]): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    services.forEach((service) => {
        // Check for weak passwords
        service.environment.forEach((env) => {
            const key = env.key.toLowerCase();
            if (
                (key.includes('password') || key.includes('pass') || key.includes('secret')) &&
                WEAK_PASSWORDS.includes(env.value.toLowerCase())
            ) {
                warnings.push({
                    id: `weak-pass-${service.id}-${env.key}`,
                    type: 'warning',
                    serviceId: service.id,
                    message: `Service "${service.name}": ${env.key} is a commonly guessed password. Consider using a stronger value.`,
                    action: 'Use .env file for secrets in production',
                });
            }
        });

        // Node.js app without volume mount
        if (
            service.templateId === 'nodejs' &&
            service.volumes.length === 0
        ) {
            warnings.push({
                id: `no-volume-${service.id}`,
                type: 'warning',
                serviceId: service.id,
                message: `Service "${service.name}": No source code volume mounted. File changes require a rebuild.`,
                action: 'Add a volume like ./app:/usr/src/app',
            });
        }

        // Python app without volume mount
        if (
            service.templateId === 'python' &&
            service.volumes.length === 0
        ) {
            warnings.push({
                id: `no-volume-${service.id}`,
                type: 'warning',
                serviceId: service.id,
                message: `Service "${service.name}": No source code volume mounted. File changes require a rebuild.`,
            });
        }

        // Service with no network
        if (service.networks.length === 0) {
            warnings.push({
                id: `no-network-${service.id}`,
                type: 'warning',
                serviceId: service.id,
                message: `Service "${service.name}": No network defined. Services won't be able to communicate.`,
            });
        }

        // Database without persistent volume
        const dbTemplates = ['postgresql', 'mysql', 'mongodb', 'elasticsearch'];
        if (dbTemplates.includes(service.templateId) && service.volumes.length === 0) {
            warnings.push({
                id: `no-db-volume-${service.id}`,
                type: 'warning',
                serviceId: service.id,
                message: `Service "${service.name}": Database has no volume. All data will be lost when the container stops.`,
                action: 'Add a volume to persist data',
            });
        }
    });

    // Tips
    if (services.length > 0) {
        warnings.push({
            id: 'tip-env-file',
            type: 'tip',
            message: 'Use a .env file to store secrets instead of hardcoding them in docker-compose.yml.',
        });
    }

    if (services.some((s) => s.templateId === 'redis')) {
        warnings.push({
            id: 'tip-redis-cache',
            type: 'tip',
            message: 'Redis is stateless by default — no volume needed for a pure cache use case.',
        });
    }

    return warnings;
}
