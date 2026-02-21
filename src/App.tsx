import { useEffect, useState } from 'react';
import { Header } from './components/header';
import { ServiceLibrary } from './components/ServiceLibrary';
import { Canvas } from './components/canvas/Canvas';
import { ConfigPanel } from './components/config-panel';
import { YAMLPreview } from './components/YAMLPreview';
import {
  OnboardingTour,
  ImportModal,
  SaveModal,
  LoadModal,
  DownloadSuccessModal,
  AddServiceModal,
  TemplateGallery,
} from './components/modals';
import { CommandPalette } from './components/CommandPalette';
import { StatusBar } from './components/StatusBar';
import { LoadingScreen } from './components/LoadingScreen';
import { useAppStore } from './store/useAppStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useIsMobile, useIsTablet } from './hooks/useMediaQuery';
import { useOnboardingTour } from './hooks/useOnboardingTour';

function useHydration() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // The persist middleware hydrates synchronously from localStorage
    // on store creation. By the time this effect runs, the store is ready.
    setHydrated(true);
  }, []);
  return hydrated;
}

export default function App() {
  const hydrated = useHydration();
  const {
    showYAMLPanel,
    showLibrary,
    showTemplateGallery,
    showImportModal,
    showSaveModal,
    showLoadModal,
    showAddServiceModal,
    setShowAddServiceModal,
    showSuccessModal,
    selectedServiceId,
    refreshDerived,
  } = useAppStore();

  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  // Global keyboard shortcuts
  useKeyboardShortcuts();

  // Onboarding tour
  const { isActive: tourActive, startTour, endTour } = useOnboardingTour();

  // Initial YAML generation on mount
  useEffect(() => {
    refreshDerived();
  }, []);

  // Show loading screen while store hydrates from localStorage
  if (!hydrated) return <LoadingScreen />;

  // On mobile/tablet, auto-hide panels
  const showLibrarySidebar = showLibrary && !isTablet;
  const showLibraryOverlay = showLibrary && isTablet;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top nav */}
      <Header onStartTour={startTour} />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: service library — sidebar on desktop, overlay on tablet/mobile */}
        {showLibrarySidebar && <div data-tour="service-library"><ServiceLibrary /></div>}
        {showLibraryOverlay && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-30 lg:hidden"
              onClick={() => useAppStore.getState().toggleLibrary()}
            />
            <div className="fixed left-0 top-14 bottom-7 w-72 z-40 lg:hidden animate-slide-in-left" data-tour="service-library">
              <ServiceLibrary />
            </div>
          </>
        )}

        {/* Center: canvas */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative" data-tour="canvas">
          <Canvas />

          {/* Bottom/Overlay: YAML preview */}
          {showYAMLPanel && (
            <div
              data-tour="yaml-preview"
              className={isMobile ? "absolute inset-0 z-30" : ""}
            >
              <YAMLPreview className={isMobile ? "h-full border-t-0" : ""} />
            </div>
          )}
        </div>

        {/* Right: config panel — inline on desktop, overlay on tablet/mobile */}
        {!isTablet && selectedServiceId && <ConfigPanel />}
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
      <AddServiceModal open={showAddServiceModal} onOpenChange={setShowAddServiceModal} />
      {showSuccessModal && <DownloadSuccessModal />}
      <CommandPalette />
      <OnboardingTour isActive={tourActive} onEnd={endTour} />
    </div>
  );
}
