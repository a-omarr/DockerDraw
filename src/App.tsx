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
import { useAppStore } from './store/useAppStore';

export default function App() {
  const {
    showYAMLPanel,
    showLibrary,
    showTemplateGallery,
    showImportModal,
    showSaveModal,
    showLoadModal,
    showSuccessModal,
    refreshDerived,
  } = useAppStore();

  // Initial YAML generation on mount
  useEffect(() => {
    refreshDerived();
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top nav */}
      <Header />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: service library */}
        {showLibrary && <ServiceLibrary />}

        {/* Center: canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Canvas />

          {/* Bottom: YAML preview */}
          {showYAMLPanel && <YAMLPreview />}
        </div>

        {/* Right: config panel */}
        <ConfigPanel />
      </div>

      {/* Modals */}
      {showTemplateGallery && <TemplateGallery />}
      {showImportModal && <ImportModal />}
      {showSaveModal && <SaveModal />}
      {showLoadModal && <LoadModal />}
      {showSuccessModal && <DownloadSuccessModal />}
    </div>
  );
}
