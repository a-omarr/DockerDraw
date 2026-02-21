import type { TourStep } from '../../types';

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '../../store/useAppStore';

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
        position: 'top',
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

interface OnboardingTourProps {
    isActive: boolean;
    onEnd: () => void;
}

export function OnboardingTour({ isActive, onEnd }: OnboardingTourProps) {
    const { setShowLibrary, setShowYAMLPanel } = useAppStore();
    const [stepIndex, setStepIndex] = useState(0);
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
    const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
    const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});

    const step = TOUR_STEPS[stepIndex];
    const isLast = stepIndex === TOUR_STEPS.length - 1;
    const isFirst = stepIndex === 0;

    // Open panels associated with the current step
    useEffect(() => {
        if (!isActive || !step) return;

        const isMobile = window.innerWidth < 768;

        if (step.target === '[data-tour="service-library"]') {
            setShowLibrary(true);
            if (isMobile) setShowYAMLPanel(false);
        } else if (step.target === '[data-tour="canvas"]') {
            if (isMobile) {
                setShowLibrary(false);
                setShowYAMLPanel(false);
            }
        } else if (step.target === '[data-tour="yaml-preview"]') {
            setShowYAMLPanel(true);
            if (isMobile) setShowLibrary(false);
        }
    }, [isActive, step, setShowLibrary, setShowYAMLPanel]);

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
            const isMobile = window.innerWidth < 768;
            const tooltipW = isMobile ? Math.min(320, window.innerWidth - 32) : 320;
            const tooltipH = 180;
            const gap = 16;

            let top = 0;
            let left = 0;
            let aTop = 0;
            let aLeft = 0;
            let arrowRotation = '';
            let showArrow = !isMobile;

            if (isMobile) {
                left = (window.innerWidth - tooltipW) / 2;
                const targetCenterY = rect.top + rect.height / 2;
                // If target is in top half, put tooltip near bottom, else near top
                if (targetCenterY < window.innerHeight / 2) {
                    top = window.innerHeight - tooltipH - 24;
                } else {
                    top = 80;
                }
            } else {
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
                transition: 'top 0.3s ease-in-out, left 0.3s ease-in-out'
            });
            setSpotlightStyle({
                position: 'fixed',
                top: Math.max(0, rect.top - 4),
                left: Math.max(0, rect.left - 4),
                width: rect.width + 8,
                height: rect.height + 8,
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
                borderRadius: '8px',
                pointerEvents: 'none',
                zIndex: 10000,
                transition: 'all 0.3s ease-in-out'
            });
            if (showArrow) {
                setArrowStyle({
                    position: 'absolute',
                    top: aTop,
                    left: aLeft,
                    transform: arrowRotation,
                    display: 'block'
                });
            } else {
                setArrowStyle({ display: 'none' });
            }
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
            {/* Overlay click catcher (transparent) */}
            <div
                className="fixed inset-0 z-[9999] cursor-pointer"
                onClick={onEnd}
            />

            {/* Spotlight cut-out */}
            <div style={spotlightStyle} />

            {/* Tooltip */}
            <div
                style={tooltipStyle}
                className="rounded-xl bg-background border border-border shadow-2xl p-5 animate-fade-in-up"
            >
                {/* Arrow */}
                <div style={arrowStyle}>
                    <svg width="12" height="12" viewBox="0 0 12 12">
                        <polygon points="6,0 12,12 0,12" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1" />
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
