import { useEffect, useState } from 'react';
import { Header } from './components/header';
import { ServiceLibrary } from './components/ServiceLibrary';
import { Canvas } from './components/canvas/Canvas';
import { ConfigPanel } from './components/config-panel';
import { YAMLPreview } from './components/YAMLPreview';
import {
  ImportModal,
  SaveModal,
  LoadModal,
  DownloadSuccessModal,
  AddServiceModal,
  TemplateGallery,
  AuditModal,
} from './components/modals';
import { CommandPalette } from './components/CommandPalette';
import { StatusBar } from './components/StatusBar';
import { LoadingScreen } from './components/LoadingScreen';
import { AIAssistant } from './components/chat/AIAssistant';
import { useAppStore } from './store/useAppStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useIsMobile, useIsTablet } from './hooks/useMediaQuery';
import { decodeServicesFromURL, clearURLState } from './utils/shareUrl';
import { sanitizeName } from './utils/yamlImport';
import { Analytics } from '@vercel/analytics/react';

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
    setModalVisibility,
    showSuccessModal,
    selectedServiceId,
    refreshDerived,
    importFromYAML,
    networkName,
    isDirty,
  } = useAppStore();

  // Refresh warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        // Note: Modern browsers (Chrome, Firefox, Safari) generally ignore custom messages 
        // in beforeunload events for security reasons and show a generic warning instead.
        // However, we set the requested text here for older browsers that still support it.
        e.returnValue = 'If you proceed evrything he has done will be reset and deleted';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  // Global keyboard shortcuts
  useKeyboardShortcuts();

  // Onboarding tour state removed as per user request

  // Initial YAML generation on mount + Handle shared URL
  useEffect(() => {
    let mounted = true;

    const handleInitialLoad = async () => {
      refreshDerived();

      const shared = decodeServicesFromURL();
      if (shared && shared.length > 0 && mounted) {
        // Robust Validation
        const MAX_SERVICES = 50;
        const validatedServices = shared.slice(0, MAX_SERVICES).map(svc => {
          const IMAGE_REGEX = /^[a-z0-9/._:-]+$/;
          const validImage = svc.image && IMAGE_REGEX.test(svc.image) ? svc.image : 'nginx:alpine';
          const validName = sanitizeName(svc.name);

          const {
            id = crypto.randomUUID(),
            templateId = 'custom-service',
            ports = [],
            environment = [],
            volumes = [],
            networks = [],
            dependsOn = [],
            ...rest
          } = svc;

          return {
            id,
            templateId,
            ports: Array.isArray(ports) ? ports : [],
            environment: Array.isArray(environment) ? environment : [],
            volumes: Array.isArray(volumes) ? volumes : [],
            networks: Array.isArray(networks) ? networks : [],
            dependsOn: Array.isArray(dependsOn) ? dependsOn : [],
            ...rest,
            name: validName,
            image: validImage
          };
        });

        if (validatedServices.length > 0) {
          // Delay slightly to ensure store is ready and UI has settled
          setTimeout(() => {
            if (!mounted) return;
            importFromYAML(validatedServices, networkName);
            clearURLState();
          }, 100);
        }
      }
    };

    handleInitialLoad();
    return () => { mounted = false; };
  }, []);

  // Show loading screen while store hydrates from localStorage
  if (!hydrated) return <LoadingScreen />;

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
              className={isMobile ? "absolute inset-0 z-[35]" : ""}
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
      <AddServiceModal open={showAddServiceModal} onOpenChange={(show) => setModalVisibility('showAddServiceModal', show)} />
      {showSuccessModal && <DownloadSuccessModal />}
      <CommandPalette />
      <AuditModal />
      <AIAssistant />
      <Analytics />
    </div>
  );
}
