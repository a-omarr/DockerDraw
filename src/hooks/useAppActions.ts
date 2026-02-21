import { useAppStore } from '../store/useAppStore';
import { downloadYAML } from '../utils/downloadYAML';

export function useAppActions() {
    const {
        yamlOutput,
        setModalVisibility,
    } = useAppStore();

    const handleDownload = () => {
        downloadYAML(yamlOutput);
        setModalVisibility('showSuccessModal', true);
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
