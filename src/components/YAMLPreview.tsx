import { useState } from 'react';
import { Copy, Check, Download, AlertTriangle, Lightbulb } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useAppStore } from '../store/useAppStore';

export function YAMLPreview() {
    const { yamlOutput, warnings, setShowSuccessModal } = useAppStore();
    const [copied, setCopied] = useState(false);
    const [showWarnings, setShowWarnings] = useState(true);

    const warningCount = warnings.filter((w) => w.type === 'warning' || w.type === 'error').length;
    const tipCount = warnings.filter((w) => w.type === 'tip').length;

    const handleCopy = () => {
        navigator.clipboard.writeText(yamlOutput).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleDownload = () => {
        const blob = new Blob([yamlOutput], { type: 'text/yaml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'docker-compose.yml';
        a.click();
        URL.revokeObjectURL(url);
        setShowSuccessModal(true);
    };

    return (
        <div
            className="flex flex-col"
            style={{
                height: 320,
                background: 'var(--bg-secondary)',
                borderTop: '1px solid var(--border-color)',
            }}
        >
            {/* Header bar */}
            <div
                className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
                style={{ borderBottom: '1px solid var(--border-color)' }}
            >
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                        📄 docker-compose.yml
                    </span>
                    {/* Warning badges */}
                    {warningCount > 0 && (
                        <button
                            onClick={() => setShowWarnings((v) => !v)}
                            className="flex items-center gap-1. px-2 py-0.5 rounded-full text-xs font-medium transition-all"
                            style={{
                                background: 'rgba(251, 146, 60, 0.15)',
                                color: '#fb923c',
                                border: '1px solid rgba(251, 146, 60, 0.3)',
                            }}
                        >
                            <AlertTriangle size={10} />
                            {warningCount} warning{warningCount !== 1 ? 's' : ''}
                        </button>
                    )}
                    {tipCount > 0 && (
                        <button
                            onClick={() => setShowWarnings((v) => !v)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                                background: 'rgba(52, 211, 153, 0.1)',
                                color: 'var(--accent-green)',
                                border: '1px solid rgba(52, 211, 153, 0.3)',
                            }}
                        >
                            <Lightbulb size={10} />
                            {tipCount} tip{tipCount !== 1 ? 's' : ''}
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {/* Copy */}
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                        style={{
                            background: copied ? 'rgba(52, 211, 153, 0.15)' : 'var(--bg-tertiary)',
                            border: copied ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid var(--border-color)',
                            color: copied ? 'var(--accent-green)' : 'var(--text-secondary)',
                        }}
                    >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                    {/* Download */}
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                        style={{
                            background: 'linear-gradient(135deg, #4f8ef7, #22d3ee)',
                            color: 'white',
                        }}
                    >
                        <Download size={12} />
                        Download
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Monaco editor */}
                <div className="flex-1 overflow-hidden">
                    <Editor
                        height="100%"
                        language="yaml"
                        value={yamlOutput}
                        theme="vs-dark"
                        options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            fontSize: 12,
                            lineNumbers: 'on',
                            wordWrap: 'on',
                            padding: { top: 8, bottom: 8 },
                            scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        }}
                    />
                </div>

                {/* Warnings panel */}
                {showWarnings && warnings.length > 0 && (
                    <div
                        className="flex-shrink-0 overflow-y-auto"
                        style={{
                            width: 280,
                            borderLeft: '1px solid var(--border-color)',
                            background: 'var(--bg-primary)',
                        }}
                    >
                        <div className="p-3 space-y-2">
                            {warnings.map((w) => (
                                <div
                                    key={w.id}
                                    className="p-2.5 rounded-xl text-xs"
                                    style={{
                                        background: w.type === 'tip'
                                            ? 'rgba(52, 211, 153, 0.05)'
                                            : w.type === 'error'
                                                ? 'rgba(248, 113, 113, 0.05)'
                                                : 'rgba(251, 146, 60, 0.05)',
                                        border: w.type === 'tip'
                                            ? '1px solid rgba(52, 211, 153, 0.15)'
                                            : w.type === 'error'
                                                ? '1px solid rgba(248, 113, 113, 0.15)'
                                                : '1px solid rgba(251, 146, 60, 0.15)',
                                    }}
                                >
                                    <div className="flex items-start gap-1.5">
                                        <span className="flex-shrink-0 mt-0.5">
                                            {w.type === 'tip' ? '💡' : w.type === 'error' ? '🔴' : '⚠️'}
                                        </span>
                                        <div>
                                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{w.message}</p>
                                            {w.action && (
                                                <p className="mt-1 italic" style={{ color: 'var(--text-muted)' }}>
                                                    {w.action}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
