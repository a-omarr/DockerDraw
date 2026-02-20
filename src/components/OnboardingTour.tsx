import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TourStep {
    target: string;        // CSS selector for the element to highlight
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
    {
        target: '[data-tour="service-library"]',
        title: 'Service Library',
        description: 'Browse pre-configured services like PostgreSQL, Redis, and Nginx. Click a service to add it to your canvas.',
        position: 'right',
    },
    {
        target: '[data-tour="canvas"]',
        title: 'Your Canvas',
        description: 'Services you add appear here as cards. Click a card to configure it, or drag to reorder.',
        position: 'bottom',
    },
    {
        target: '[data-tour="yaml-preview"]',
        title: 'Live YAML Preview',
        description: 'Your docker-compose.yml updates in real-time as you build your stack. Toggle it with the button in the status bar.',
        position: 'top',
    },
    {
        target: '[data-tour="download-btn"]',
        title: 'Export & Download',
        description: 'When you\'re ready, download your docker-compose.yml with one click. That\'s it — you\'re done!',
        position: 'bottom',
    },
];

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

interface OnboardingTourProps {
    isActive: boolean;
    onEnd: () => void;
}

export function OnboardingTour({ isActive, onEnd }: OnboardingTourProps) {
    const [stepIndex, setStepIndex] = useState(0);
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
    const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});

    const step = TOUR_STEPS[stepIndex];
    const isLast = stepIndex === TOUR_STEPS.length - 1;
    const isFirst = stepIndex === 0;

    // Position tooltip near the target element
    useEffect(() => {
        if (!isActive || !step) return;

        const positionTooltip = () => {
            const el = document.querySelector(step.target);
            if (!el) {
                // Target not visible — skip to next step or end
                if (!isLast) setStepIndex((i) => i + 1);
                else onEnd();
                return;
            }

            const rect = el.getBoundingClientRect();
            const tooltipW = 320;
            const tooltipH = 180;
            const gap = 16;

            let top = 0;
            let left = 0;
            let aTop = 0;
            let aLeft = 0;
            let arrowRotation = '';

            switch (step.position) {
                case 'right':
                    top = rect.top + rect.height / 2 - tooltipH / 2;
                    left = rect.right + gap;
                    aTop = tooltipH / 2 - 6;
                    aLeft = -10;
                    arrowRotation = 'rotate(90deg)';
                    break;
                case 'left':
                    top = rect.top + rect.height / 2 - tooltipH / 2;
                    left = rect.left - tooltipW - gap;
                    aTop = tooltipH / 2 - 6;
                    aLeft = tooltipW - 2;
                    arrowRotation = 'rotate(-90deg)';
                    break;
                case 'bottom':
                    top = rect.bottom + gap;
                    left = rect.left + rect.width / 2 - tooltipW / 2;
                    aTop = -10;
                    aLeft = tooltipW / 2 - 6;
                    arrowRotation = 'rotate(180deg)';
                    break;
                case 'top':
                    top = rect.top - tooltipH - gap;
                    left = rect.left + rect.width / 2 - tooltipW / 2;
                    aTop = tooltipH - 2;
                    aLeft = tooltipW / 2 - 6;
                    arrowRotation = 'rotate(0deg)';
                    break;
            }

            // Clamp within viewport
            top = Math.max(8, Math.min(top, window.innerHeight - tooltipH - 8));
            left = Math.max(8, Math.min(left, window.innerWidth - tooltipW - 8));

            setTooltipStyle({
                position: 'fixed',
                top,
                left,
                width: tooltipW,
                zIndex: 10001,
            });
            setArrowStyle({
                position: 'absolute',
                top: aTop,
                left: aLeft,
                transform: arrowRotation,
            });
        };

        positionTooltip();
        window.addEventListener('resize', positionTooltip);
        return () => window.removeEventListener('resize', positionTooltip);
    }, [isActive, stepIndex, step, isLast, onEnd]);

    // Reset step on open
    useEffect(() => {
        if (isActive) setStepIndex(0);
    }, [isActive]);

    // Keyboard: Escape to close, Enter to advance
    useEffect(() => {
        if (!isActive) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onEnd();
            else if (e.key === 'Enter') {
                e.preventDefault();
                if (stepIndex >= TOUR_STEPS.length - 1) onEnd();
                else setStepIndex((i) => i + 1);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isActive, stepIndex, onEnd]);

    if (!isActive || !step) return null;

    const handleNext = () => {
        if (isLast) onEnd();
        else setStepIndex((i) => i + 1);
    };

    const handlePrev = () => {
        if (!isFirst) setStepIndex((i) => i - 1);
    };

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/40 z-[10000] transition-opacity"
                onClick={onEnd}
            />

            {/* Tooltip */}
            <div
                style={tooltipStyle}
                className="rounded-xl bg-white border border-border shadow-2xl p-5 animate-fade-in-up"
            >
                {/* Arrow */}
                <div style={arrowStyle}>
                    <svg width="12" height="12" viewBox="0 0 12 12">
                        <polygon points="6,0 12,12 0,12" fill="white" stroke="hsl(var(--border))" strokeWidth="1" />
                    </svg>
                </div>

                {/* Close */}
                <button
                    onClick={onEnd}
                    className="absolute top-3 right-3 text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer"
                >
                    <X size={14} />
                </button>

                {/* Step indicator */}
                <div className="flex items-center gap-1.5 mb-3">
                    {TOUR_STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all ${i === stepIndex
                                ? 'w-6 bg-primary'
                                : i < stepIndex
                                    ? 'w-1.5 bg-primary/40'
                                    : 'w-1.5 bg-muted'
                                }`}
                        />
                    ))}
                    <span className="ml-auto text-[10px] text-muted-foreground font-medium">
                        {stepIndex + 1}/{TOUR_STEPS.length}
                    </span>
                </div>

                {/* Content */}
                <h3 className="text-sm font-bold text-foreground mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {step.description}
                </p>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={onEnd}
                        className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer"
                    >
                        Skip tour
                    </button>
                    <div className="flex items-center gap-2">
                        {!isFirst && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1 text-xs"
                                onClick={handlePrev}
                            >
                                <ChevronLeft size={12} />
                                Back
                            </Button>
                        )}
                        <Button
                            size="sm"
                            className="h-7 gap-1 text-xs shadow-sm"
                            onClick={handleNext}
                        >
                            {isLast ? (
                                <>
                                    <Sparkles size={12} />
                                    Get Started
                                </>
                            ) : (
                                <>
                                    Next
                                    <ChevronRight size={12} />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
