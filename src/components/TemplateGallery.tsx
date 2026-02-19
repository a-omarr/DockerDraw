import { useState } from 'react';
import { X, Search, Star, Zap } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { builtinTemplates } from '../data/builtinTemplates';
import { serviceTemplates } from '../data/serviceTemplates';

export function TemplateGallery() {
    const { setShowTemplateGallery, loadTemplate } = useAppStore();
    const [search, setSearch] = useState('');

    const filtered = builtinTemplates.filter(
        (t) =>
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.description.toLowerCase().includes(search.toLowerCase()) ||
            t.tags.some((tag) => tag.includes(search.toLowerCase()))
    );

    const handleLoad = (templateId: string) => {
        const template = builtinTemplates.find((t) => t.id === templateId);
        if (template) {
            loadTemplate(template.services as any[]);
            setShowTemplateGallery(false);
        }
    };

    return (
        <Modal title="Template Gallery" onClose={() => setShowTemplateGallery(false)}>
            {/* Search */}
            <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
            >
                <Search size={15} style={{ color: 'var(--text-muted)' }} />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search templates..."
                    className="bg-transparent text-sm outline-none flex-1"
                    style={{ color: 'var(--text-primary)' }}
                    autoFocus
                />
            </div>

            {/* Templates grid */}
            <div className="space-y-3">
                {filtered.map((template) => {

                    return (
                        <div
                            key={template.id}
                            className="p-4 rounded-2xl transition-all cursor-pointer"
                            style={{
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-color)',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(79, 142, 247, 0.5)';
                                (e.currentTarget as HTMLElement).style.background = 'rgba(79, 142, 247, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)';
                                (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)';
                            }}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                            {template.name}
                                        </h3>
                                        <span
                                            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                                            style={{
                                                background: 'rgba(251, 146, 60, 0.1)',
                                                color: '#fb923c',
                                            }}
                                        >
                                            <Star size={9} />
                                            {template.uses.toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                                        {template.description}
                                    </p>
                                    {/* Service emojis preview */}
                                    <div className="flex items-center gap-1.5 flex-wrap mb-3">
                                        {template.services.map((s, i) => {
                                            const t = serviceTemplates.find((st) => st.id === s.templateId);
                                            return (
                                                <div
                                                    key={i}
                                                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
                                                    style={{
                                                        background: 'var(--bg-card)',
                                                        border: '1px solid var(--border-color)',
                                                        color: 'var(--text-secondary)',
                                                    }}
                                                >
                                                    <span>{t?.emoji || '📦'}</span>
                                                    <span>{s.name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {template.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-xs px-2 py-0.5 rounded-full"
                                                style={{
                                                    background: 'var(--bg-card)',
                                                    color: 'var(--text-muted)',
                                                    border: '1px solid var(--border-color)',
                                                }}
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleLoad(template.id)}
                                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 mt-1"
                                    style={{
                                        background: 'linear-gradient(135deg, #4f8ef7, #22d3ee)',
                                        color: 'white',
                                    }}
                                >
                                    <Zap size={12} />
                                    Use
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Modal>
    );
}

export function Modal({
    title,
    onClose,
    children,
    maxWidth = 560,
}: {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    maxWidth?: number;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="w-full rounded-2xl animate-bounce-in flex flex-col"
                style={{
                    maxWidth,
                    maxHeight: '85vh',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                }}
            >
                {/* Modal header */}
                <div
                    className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                    style={{ borderBottom: '1px solid var(--border-color)' }}
                >
                    <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{title}</h2>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                        <X size={16} />
                    </button>
                </div>
                {/* Modal body */}
                <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
            </div>
        </div>
    );
}
