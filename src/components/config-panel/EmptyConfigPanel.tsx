import { Terminal } from 'lucide-react';

export function EmptyConfigPanel() {
    return (
        <div className="hidden lg:flex flex-col items-center justify-center h-full w-96 border-l bg-muted/10">
            <div className="text-center px-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <Terminal size={32} className="text-muted-foreground/30" />
                </div>
                <div>
                    <p className="text-sm font-bold text-foreground">No service selected</p>
                    <p className="text-xs text-muted-foreground mt-1">Select a service on the canvas to configure its properties</p>
                </div>
            </div>
        </div>
    );
}
