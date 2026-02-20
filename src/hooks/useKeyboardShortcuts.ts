import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useKeyboardShortcuts() {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
            const store = useAppStore.getState();
            const mod = e.metaKey || e.ctrlKey;

            // Don't intercept shortcuts when a dialog/modal is open (let the dialog handle its own keys)
            const hasOpenDialog = document.querySelector('[role="alertdialog"]') ||
                (document.querySelector('[role="dialog"]') && !store.showCommandPalette);
            if (hasOpenDialog && e.key !== 'Escape') return;

            // Ctrl+Z → Undo
            if (mod && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                const temporal = useAppStore.temporal.getState();
                temporal.pause();
                temporal.undo();
                useAppStore.getState().refreshDerived();
                temporal.resume();
                return;
            }

            // Ctrl+Shift+Z or Ctrl+Y → Redo
            if ((mod && e.key === 'z' && e.shiftKey) || (mod && e.key === 'y')) {
                e.preventDefault();
                const temporal = useAppStore.temporal.getState();
                temporal.pause();
                temporal.redo();
                useAppStore.getState().refreshDerived();
                temporal.resume();
                return;
            }

            // Ctrl+S → Save
            if (mod && e.key === 's') {
                e.preventDefault();
                store.setShowSaveModal(true);
                return;
            }

            // Ctrl+K → Command Palette
            if (mod && e.key === 'k') {
                e.preventDefault();
                store.setShowCommandPalette(!store.showCommandPalette);
                return;
            }

            // Escape → Deselect / close command palette
            if (e.key === 'Escape') {
                if (store.showCommandPalette) {
                    store.setShowCommandPalette(false);
                } else if (store.selectedServiceId) {
                    store.selectService(null);
                }
                return;
            }

            // Delete / Backspace → Remove selected service (when not in input)
            if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput) {
                if (store.selectedServiceId) {
                    e.preventDefault();
                    store.removeService(store.selectedServiceId);
                }
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
}
