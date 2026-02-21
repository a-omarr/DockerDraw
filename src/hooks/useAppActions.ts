import { useAppStore } from '../store/useAppStore';

export function useAppActions() {
    const {
        yamlOutput,
        setShowSuccessModal,
    } = useAppStore();

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

    const handleUndo = () => {
        const temporal = (useAppStore as any).temporal.getState();
        temporal.pause();
        temporal.undo();
        (useAppStore.getState() as any).refreshDerived();
        temporal.resume();
    };

    const handleRedo = () => {
        const temporal = (useAppStore as any).temporal.getState();
        temporal.pause();
        temporal.redo();
        (useAppStore.getState() as any).refreshDerived();
        temporal.resume();
    };

    return {
        handleDownload,
        handleUndo,
        handleRedo,
    };
}
