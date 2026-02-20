import { Layers } from 'lucide-react';

export function LoadingScreen() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
            {/* Logo */}
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
                <Layers size={24} className="text-primary/60" />
            </div>

            {/* Shimmer bar */}
            <div className="w-36 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                    className="h-full w-1/2 rounded-full bg-primary/40"
                    style={{
                        animation: 'shimmer-slide 1.2s ease-in-out infinite',
                    }}
                />
            </div>

            <p className="text-xs text-muted-foreground/60 font-medium tracking-wide">
                Loading workspace…
            </p>

            <style>{`
                @keyframes shimmer-slide {
                    0%   { transform: translateX(-150%); }
                    100% { transform: translateX(350%); }
                }
            `}</style>
        </div>
    );
}
