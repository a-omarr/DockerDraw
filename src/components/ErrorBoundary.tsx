import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, error: null, showDetails: false };

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[DockerDraw] Uncaught error:', error, info.componentStack);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleClearData = () => {
        try {
            localStorage.removeItem('dockerdraw-store');
            localStorage.removeItem('dockerdraw-onboarding-complete');
        } catch {
            // ignore
        }
        window.location.reload();
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="max-w-md w-full text-center space-y-6">
                    {/* Icon */}
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle size={32} className="text-destructive" />
                    </div>

                    {/* Copy */}
                    <div className="space-y-2">
                        <h1 className="text-xl font-bold text-foreground tracking-tight">
                            Something went wrong
                        </h1>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            DockerDraw ran into an unexpected error. You can try reloading the page, or clear saved data if the problem persists.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={this.handleReload}
                            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                        >
                            <RefreshCw size={16} />
                            Reload Page
                        </button>
                        <button
                            onClick={this.handleClearData}
                            className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                            <Trash2 size={14} />
                            Clear Saved Data &amp; Reload
                        </button>
                    </div>

                    {/* Error details (collapsible) */}
                    {this.state.error && (
                        <div className="pt-4 border-t">
                            <button
                                onClick={() => this.setState((s) => ({ showDetails: !s.showDetails }))}
                                className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer"
                            >
                                {this.state.showDetails ? 'Hide' : 'Show'} error details
                            </button>
                            {this.state.showDetails && (
                                <pre className="mt-3 p-4 rounded-lg bg-muted text-left text-[11px] font-mono text-muted-foreground overflow-auto max-h-48 leading-relaxed">
                                    {this.state.error.message}
                                    {'\n\n'}
                                    {this.state.error.stack}
                                </pre>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
