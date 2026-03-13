import type { IconType } from 'react-icons';
import type { ReactNode } from 'react';

export interface Port {
    host: number;
    container: number;
    protocol?: 'tcp' | 'udp';
}

export interface Volume {
    host: string;
    container: string;
    mode?: 'ro' | 'rw';
}

export interface EnvVar {
    key: string;
    value: string;
    isSecret?: boolean;
}

export interface HealthCheck {
    test: string;
    interval: string;
    timeout: string;
    retries: number;
}

export interface ResourceLimits {
    cpus: string;
    memory: string;
}

export type RestartPolicy = 'no' | 'always' | 'on-failure' | 'unless-stopped';

export interface Service {
    id: string;
    name: string;
    templateId: string;
    image: string;
    ports: Port[];
    environment: EnvVar[];
    volumes: Volume[];
    networks: string[];
    dependsOn: string[];
    command?: string;
    restart?: RestartPolicy;
    healthCheck?: HealthCheck;
    resources?: ResourceLimits;
    buildContext?: string;
    dockerfile?: string;
    buildTarget?: string;
    buildArgs?: Record<string, string>;
}

export interface ServiceTemplate {
    id: string;
    name: string;
    emoji: string;
    Icon?: IconType;
    category: ServiceCategory;
    description: string;
    defaultImage: string;
    availableVersions: string[];
    defaultPorts: Port[];
    defaultEnvironment: EnvVar[];
    defaultVolumes: Volume[];
    defaultNetwork: string;
    tags: string[];
    color: string;
    glowColor: string;
    defaultBuildContext?: string;
    defaultDockerfile?: string;
    defaultBuildTarget?: string;
    defaultBuildArgs?: Record<string, string>;
}

export type ServiceCategory =
    | 'database'
    | 'cache'
    | 'webserver'
    | 'queue'
    | 'app'
    | 'monitoring'
    | 'auth';

export interface ValidationWarning {
    id: string;
    type: 'warning' | 'tip' | 'error';
    message: string;
    serviceId?: string;
    action?: string;
}

export interface PortConflict {
    port: number;
    serviceIds: string[];
    serviceNames: string[];
    suggestions: number[];
}

export type EnvironmentPreset = 'development' | 'production';

export interface SavedProject {
    id: string;
    name: string;
    services: Service[];
    network: string;
    preset: EnvironmentPreset;
    createdAt: string;
    updatedAt: string;
}

export interface BuiltinTemplate {
    id: string;
    name: string;
    description: string;
    tags: string[];
    uses: number;
    services: Omit<Service, 'id'>[];
    network: string;
}

export interface ComposeConfig {
    version: string;
    services: Record<string, ComposeService>;
    networks?: Record<string, ComposeNetwork>;
    volumes?: Record<string, ComposeVolume>;
}

export interface ComposeService {
    image?: string;
    build?: string | { context: string; dockerfile?: string };
    ports?: string[];
    environment?: Record<string, string> | string[];
    volumes?: string[];
    networks?: string[];
    depends_on?: string[] | Record<string, { condition: string }>;
    restart?: string;
    command?: string;
    healthcheck?: {
        test: string | string[];
        interval?: string;
        timeout?: string;
        retries?: number;
    };
    deploy?: {
        resources: {
            limits: { cpus?: string; memory?: string };
        };
    };
}

export interface ComposeNetwork {
    driver?: string;
    external?: boolean;
}

export interface ComposeVolume {
    driver?: string;
    external?: boolean;
}

export interface CommandItem {
    id: string;
    label: string;
    icon: ReactNode;
    shortcut?: string;
    category: string;
    action: () => void;
}
export interface TourStep {
    target: string;        // CSS selector for the element to highlight
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}

export interface AuditFinding {
    id: string;
    title: string;
    message: string;
    severity: 'critical' | 'warning' | 'info';
    category: 'Security' | 'Best Practice' | 'Performance';
    serviceId?: string;
    fixAvailable: boolean;
    fixDescription?: string;
    fixData?: Partial<Service>;
}
