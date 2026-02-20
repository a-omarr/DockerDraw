import { useEffect } from 'react';
import { Header } from './components/Header';
import { ServiceLibrary } from './components/ServiceLibrary';
import { Canvas } from './components/Canvas';
import { ConfigPanel } from './components/ConfigPanel';
import { YAMLPreview } from './components/YAMLPreview';
import { TemplateGallery } from './components/TemplateGallery';
import { ImportModal } from './components/ImportModal';
import { SaveModal, LoadModal } from './components/SaveLoadModals';
import { DownloadSuccessModal } from './components/DownloadSuccessModal';
import { CommandPalette } from './components/CommandPalette';
import { StatusBar } from './components/StatusBar';
import { useAppStore } from './store/useAppStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useIsMobile, useIsTablet } from './hooks/useMediaQuery';

export default function App() {
  const {
    showYAMLPanel,
    showLibrary,
    showTemplateGallery,
    showImportModal,
    showSaveModal,
    showLoadModal,
    showSuccessModal,
    selectedServiceId,
    refreshDerived,
  } = useAppStore();

  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  // Global keyboard shortcuts
  useKeyboardShortcuts();

  // Initial YAML generation on mount
  useEffect(() => {
    refreshDerived();
  }, []);

  // On mobile/tablet, auto-hide panels
  const showLibrarySidebar = showLibrary && !isTablet;
  const showLibraryOverlay = showLibrary && isTablet;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top nav */}
      <Header />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: service library — sidebar on desktop, overlay on tablet/mobile */}
        {showLibrarySidebar && <ServiceLibrary />}
        {showLibraryOverlay && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-30 lg:hidden"
              onClick={() => useAppStore.getState().toggleLibrary()}
            />
            <div className="fixed left-0 top-14 bottom-7 w-72 z-40 lg:hidden animate-slide-in-left">
              <ServiceLibrary />
            </div>
          </>
        )}

        {/* Center: canvas */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Canvas />

          {/* Bottom: YAML preview — hidden on mobile */}
          {showYAMLPanel && !isMobile && <YAMLPreview />}
        </div>

        {/* Right: config panel — inline on desktop, overlay on tablet/mobile */}
        {!isTablet && <ConfigPanel />}
        {isTablet && selectedServiceId && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-30"
              onClick={() => useAppStore.getState().selectService(null)}
            />
            <div className="fixed right-0 top-14 bottom-7 w-full sm:w-96 z-40 animate-slide-in-right">
              <ConfigPanel />
            </div>
          </>
        )}
      </div>

      {/* Status bar */}
      <StatusBar />

      {/* Modals */}
      {showTemplateGallery && <TemplateGallery />}
      {showImportModal && <ImportModal />}
      {showSaveModal && <SaveModal />}
      {showLoadModal && <LoadModal />}
      {showSuccessModal && <DownloadSuccessModal />}
      <CommandPalette />
    </div>
  );
}
