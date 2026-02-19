import type { Service, PortConflict } from '../types';

export function detectPortConflicts(services: Service[]): PortConflict[] {
    const portMap = new Map<number, string[]>();

    services.forEach((service) => {
        service.ports.forEach((port) => {
            const existing = portMap.get(port.host) || [];
            portMap.set(port.host, [...existing, service.id]);
        });
    });

    const conflicts: PortConflict[] = [];
    portMap.forEach((serviceIds, port) => {
        if (serviceIds.length > 1) {
            const serviceNames = serviceIds.map(
                (id) => services.find((s) => s.id === id)?.name ?? id
            );
            conflicts.push({
                port,
                serviceIds,
                serviceNames,
                suggestions: generatePortSuggestions(port, portMap),
            });
        }
    });

    return conflicts;
}

function generatePortSuggestions(port: number, portMap: Map<number, string[]>): number[] {
    const usedPorts = new Set(portMap.keys());
    const suggestions: number[] = [];

    // Try nearby ports first
    for (let delta = 1; delta <= 100 && suggestions.length < 3; delta++) {
        const candidate = port + delta;
        if (!usedPorts.has(candidate) && candidate <= 65535) {
            suggestions.push(candidate);
        }
    }

    return suggestions;
}

export function isPortAvailable(port: number, services: Service[], excludeServiceId?: string): boolean {
    return !services.some(
        (s) =>
            s.id !== excludeServiceId &&
            s.ports.some((p) => p.host === port)
    );
}
