import { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { serviceTemplates } from '../data/serviceTemplates';
import type { ServiceCategory, ServiceTemplate } from '../types';

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
    database: '🗄️ Databases',
    cache: '⚡ Caching',
    webserver: '🌐 Web Servers',
    queue: '📨 Message Queues',
    app: '🚀 App Servers',
    monitoring: '📊 Monitoring',
};

const CATEGORY_ORDER: ServiceCategory[] = ['app', 'database', 'cache', 'webserver', 'queue', 'monitoring'];

export function ServiceLibrary() {
    const { addService, services } = useAppStore();
    const [search, setSearch] = useState('');
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

    const filtered = serviceTemplates.filter(
        (t) =>
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.description.toLowerCase().includes(search.toLowerCase()) ||
            t.tags.some((tag) => tag.includes(search.toLowerCase()))
    );

    const grouped = CATEGORY_ORDER.reduce<Record<string, ServiceTemplate[]>>((acc, cat) => {
        const items = filtered.filter((t) => t.category === cat);
        if (items.length > 0) acc[cat] = items;
        return acc;
    }, {});

    const getServiceCount = (templateId: string) =>
        services.filter((s) => s.templateId === templateId).length;

    const toggleCategory = (cat: string) => {
        setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
    };

    return (
        <aside
            className="flex flex-col h-full"
            style={{
                width: 220,
                minWidth: 220,
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border-color)',
                overflowY: 'auto',
            }}
        >
            {/* Header */}
            <div
                className="px-3 pt-4 pb-3 sticky top-0 z-10"
                style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}
            >
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                    Services
                </p>
                <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                >
                    <Search size={13} style={{ color: 'var(--text-muted)' }} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search..."
                        className="bg-transparent text-sm outline-none w-full"
                        style={{ color: 'var(--text-primary)' }}
                    />
                </div>
            </div>

            {/* Service groups */}
            <div className="flex-1 px-2 py-2 space-y-1">
                {Object.entries(grouped).map(([category, templates]) => (
                    <div key={category}>
                        <button
                            onClick={() => toggleCategory(category)}
                            className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors mb-1"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                        >
                            <span>{CATEGORY_LABELS[category as ServiceCategory] || category}</span>
                            {collapsed[category] ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
                        </button>
                        {!collapsed[category] && (
                            <div className="space-y-1">
                                {templates.map((template) => {
                                    const count = getServiceCount(template.id);
                                    return (
                                        <ServiceLibraryCard
                                            key={template.id}
                                            template={template}
                                            count={count}
                                            onAdd={() => addService(template.id)}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
                {Object.keys(grouped).length === 0 && (
                    <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                        <p className="text-2xl mb-2">🔍</p>
                        <p className="text-xs">No services match your search</p>
                    </div>
                )}
            </div>
        </aside>
    );
}

function ServiceLibraryCard({
    template,
    count,
    onAdd,
}: {
    template: ServiceTemplate;
    count: number;
    onAdd: () => void;
}) {
    return (
        <button
            onClick={onAdd}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all service-card-hover group"
            style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
            }}
        >
            <div
                className="flex items-center justify-center w-8 h-8 rounded-lg text-base flex-shrink-0 transition-transform group-hover:scale-110"
                style={{ background: `${template.color}22` }}
            >
                {template.emoji}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {template.name}
                    </span>
                    {count > 0 && (
                        <span
                            className="text-xs px-1.5 py-0.5 rounded-full font-medium ml-1"
                            style={{
                                background: 'rgba(79, 142, 247, 0.2)',
                                color: 'var(--accent-blue)',
                                fontSize: 10,
                            }}
                        >
                            {count}
                        </span>
                    )}
                </div>
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {template.defaultImage}
                </p>
            </div>
        </button>
    );
}
