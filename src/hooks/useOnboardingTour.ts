import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'dockerdraw-onboarding-complete';

function hasCompletedTour(): boolean {
    try {
        return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
        return false;
    }
}

function markTourComplete() {
    try {
        localStorage.setItem(STORAGE_KEY, 'true');
    } catch { /* ignore */ }
}

export function useOnboardingTour() {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        // Auto-start on first visit (slight delay for the page to render)
        if (!hasCompletedTour()) {
            const timer = setTimeout(() => setIsActive(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    const startTour = useCallback(() => setIsActive(true), []);
    const endTour = useCallback(() => {
        setIsActive(false);
        markTourComplete();
    }, []);

    return { isActive, startTour, endTour };
}
