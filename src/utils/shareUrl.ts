import type { Service } from '../types';

const PARAM = 's';
const SIZE_LIMIT = 1500;

export function encodeServicesToURL(services: Service[]): string {
    const json = JSON.stringify(services);
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

        // Basic guard
        if (!Array.isArray(parsed)) return null;
        return parsed as Service[];
    } catch {
        return null;
    }
}

export function clearURLState() {
    const url = new URL(window.location.href);
    url.hash = '';
    window.history.replaceState(null, '', url.pathname + url.search);
}
