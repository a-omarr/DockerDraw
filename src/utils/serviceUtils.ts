import type { Service, ServiceTemplate } from '../types';

export function createServiceFromTemplate(template: ServiceTemplate): Service {
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

/**
 * Resolves name-based dependencies to ID-based dependencies.
 * This is useful when loading templates or importing YAML where 'dependsOn' 
 * might contain service names instead of stable UUIDs.
 */
export function resolveDependencyNamesToIds(services: Service[]): Service[] {
    // Create a map of name -> id for all services in the current set
    const nameToIdMap = new Map<string, string>();
    services.forEach((s) => {
        nameToIdMap.set(s.name, s.id);
    });

    // Update dependsOn for each service
    return services.map((svc) => {
        const resolvedDependsOn = svc.dependsOn.map((dep) => {
            // If the dependency is already an ID (exists in nameToIdMap values), keep it
            // Otherwise, check if it's a name and resolve it to an ID
            const isAlreadyId = services.some((s) => s.id === dep);
            if (isAlreadyId) return dep;

            return nameToIdMap.get(dep) || dep;
        });

        // Remove duplicates and self-dependencies
        const uniqueDependsOn = Array.from(new Set(resolvedDependsOn)).filter((id) => id !== svc.id);

        return {
            ...svc,
            dependsOn: uniqueDependsOn,
        };
    });
}
