import { CheckCircle, Terminal } from 'lucide-react';
import { Modal } from './TemplateGallery';
import { useAppStore } from '../store/useAppStore';

export function DownloadSuccessModal() {
    const { setShowSuccessModal, projectName } = useAppStore();

    const steps = [
        { step: 1, text: 'Move the file to your project directory', code: null },
        { step: 2, text: 'Create a .env file for secrets (optional)', code: 'POSTGRES_PASSWORD=your_secure_password' },
        { step: 3, text: 'Start your stack', code: 'docker-compose up -d' },
        { step: 4, text: 'Check running services', code: 'docker-compose ps' },
        { step: 5, text: 'View logs', code: 'docker-compose logs -f' },
    ];

    return (
        <Modal title="Download Successful!" onClose={() => setShowSuccessModal(false)} maxWidth={500}>
            <div className="flex items-center gap-3 p-4 rounded-xl mb-5" style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                <CheckCircle size={28} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
                <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--accent-green)' }}>docker-compose.yml downloaded</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Your {projectName} stack is ready to use.</p>
                </div>
            </div>

            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Next Steps</h3>

            <div className="space-y-2.5">
                {steps.map(({ step, text, code }) => (
                    <div key={step} className="flex items-start gap-3">
                        <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                            style={{ background: 'rgba(79, 142, 247, 0.2)', color: 'var(--accent-blue)' }}
                        >
                            {step}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{text}</p>
                            {code && (
                                <div
                                    className="flex items-center gap-2 mt-1.5 px-3 py-2 rounded-lg"
                                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
                                >
                                    <Terminal size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                    <code className="text-xs" style={{ color: 'var(--accent-green)', fontFamily: 'monospace' }}>
                                        {code}
                                    </code>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full mt-5 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #4f8ef7, #22d3ee)', color: 'white' }}
            >
                Got it!
            </button>
        </Modal>
    );
}
