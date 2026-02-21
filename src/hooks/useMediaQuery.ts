import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        return false;
    });

    useEffect(() => {
        const mql = window.matchMedia(query);
        const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
        mql.addEventListener('change', handler);
        setMatches(mql.matches);
        return () => mql.removeEventListener('change', handler);
    }, [query]);

    return matches;
}

/** Below 640px */
export function useIsMobile() {
    return useMediaQuery('(max-width: 639px)');
}

/** Below 1024px */
export function useIsTablet() {
    return useMediaQuery('(max-width: 1023px)');
}
