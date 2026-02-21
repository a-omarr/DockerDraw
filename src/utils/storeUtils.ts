import { generateDockerCompose } from './yamlGenerator';
import { detectPortConflicts } from './portConflict';
import { validateServices } from './validation';
import type { Service, EnvironmentPreset } from '../types';

export function computeDerived(services: Service[], networkName: string, environmentPreset: EnvironmentPreset) {
    return {
        yamlOutput: generateDockerCompose(services, networkName, environmentPreset),
        warnings: validateServices(services),
        portConflicts: detectPortConflicts(services),
        totalPorts: services.reduce((acc, s) => acc + s.ports.length, 0),
        totalVolumes: services.reduce((acc, s) => acc + s.volumes.length, 0),
        totalEnvVars: services.reduce((acc, s) => acc + s.environment.length, 0),
    };
}
