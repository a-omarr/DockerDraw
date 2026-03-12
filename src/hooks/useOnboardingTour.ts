import { useState, useCallback } from 'react';

const STORAGE_KEY = 'dockerdraw-onboarding-complete';

function markTourComplete() {
    try {
        localStorage.setItem(STORAGE_KEY, 'true');
    } catch { /* ignore */ }
}

export function useOnboardingTour() {
    const [isActive, setIsActive] = useState(false);

    // Auto-start disabled as per user request

    const startTour = useCallback(() => setIsActive(true), []);
    const endTour = useCallback(() => {
        setIsActive(false);
        markTourComplete();
    }, []);

    return { isActive, startTour, endTour };
}
