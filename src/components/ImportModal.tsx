import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Modal } from './TemplateGallery';
import { useAppStore } from '../store/useAppStore';
import { parseYAMLToServices } from '../utils/yamlImport';

export function ImportModal() {
    const { setShowImportModal, importFromYAML } = useAppStore();
    const [yamlText, setYamlText] = useState('');
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const handleImport = () => {
        setError('');
        try {
            const { services, network } = parseYAMLToServices(yamlText);
            importFromYAML(services, network);
            setShowImportModal(false);
        } catch (e: any) {
            setError(e.message || 'Failed to parse YAML');
        }
    };

    const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setYamlText(ev.target?.result as string || '');
        reader.readAsText(file);
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setYamlText(ev.target?.result as string || '');
        reader.readAsText(file);
    };

    const sampleYaml = `version: '3.8'
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: changeme`;

    return (
        <Modal title="Import docker-compose.yml" onClose={() => setShowImportModal(false)}>
            {/* Drop zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => document.getElementById('file-input')?.click()}
                className="flex flex-col items-center justify-center p-6 rounded-xl mb-4 cursor-pointer transition-all"
                style={{
                    background: isDragging ? 'rgba(79, 142, 247, 0.1)' : 'var(--bg-tertiary)',
                    border: isDragging
                        ? '2px dashed var(--accent-blue)'
                        : '2px dashed var(--border-color)',
                }}
            >
                <Upload size={24} className="mb-2" style={{ color: isDragging ? 'var(--accent-blue)' : 'var(--text-muted)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Drop your docker-compose.yml here
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>or click to browse</p>
                <input id="file-input" type="file" accept=".yml,.yaml" className="hidden" onChange={handleFileInput} />
            </div>

            {/* Or paste */}
            <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or paste YAML</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
            </div>

            <textarea
                value={yamlText}
                onChange={(e) => setYamlText(e.target.value)}
                placeholder={sampleYaml}
                rows={10}
                className="w-full px-4 py-3 rounded-xl text-xs outline-none font-mono resize-none"
                style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    lineHeight: 1.6,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
            />

            {error && (
                <div
                    className="flex items-start gap-2 px-3 py-2.5 rounded-xl mt-3 text-xs"
                    style={{
                        background: 'rgba(248, 113, 113, 0.1)',
                        border: '1px solid rgba(248, 113, 113, 0.3)',
                        color: '#f87171',
                    }}
                >
                    <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                    {error}
                </div>
            )}

            <button
                onClick={handleImport}
                disabled={!yamlText.trim()}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
                style={{
                    background: 'linear-gradient(135deg, #4f8ef7, #22d3ee)',
                    color: 'white',
                }}
            >
                <FileText size={15} />
                Import & Visualize
            </button>
        </Modal>
    );
}
