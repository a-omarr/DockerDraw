import { useAppStore } from '../../store/useAppStore';
import { serviceTemplates } from '../../data/serviceTemplates';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { TooltipProvider } from '../ui/tooltip';
import { ConfigPanelHeader } from './ConfigPanelHeader';
import { EmptyConfigPanel } from './EmptyConfigPanel';
import { GeneralTab } from './tabs/GeneralTab';
import { EnvPortsTab } from './tabs/EnvPortsTab';
import { AdvancedTab } from './tabs/AdvancedTab';

export function ConfigPanel() {
    const { services, selectedServiceId, selectService, updateService } = useAppStore();
    const service = services.find((s) => s.id === selectedServiceId);
    const template = service ? serviceTemplates.find((t) => t.id === service.templateId) : null;

    if (!service) {
        return <EmptyConfigPanel />;
    }

    return (
        <TooltipProvider delayDuration={300}>
            <aside className="w-full lg:w-96 border-l bg-background flex flex-col h-full shrink-0 animate-in slide-in-from-right duration-300">
                <ConfigPanelHeader
                    service={service}
                    template={template || null}
                    onClose={() => selectService(null)}
                />

                <ScrollArea className="flex-1">
                    <div className="p-6">
                        <Tabs defaultValue="general" className="w-full">
                            <TabsList className="w-full grid grid-cols-3 mb-6">
                                <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
                                <TabsTrigger value="env" className="text-xs">Env & Ports</TabsTrigger>
                                <TabsTrigger value="advanced" className="text-xs">Advanced</TabsTrigger>
                            </TabsList>

                            <TabsContent value="general">
                                <GeneralTab
                                    service={service}
                                    services={services}
                                    template={template || null}
                                    updateService={updateService}
                                />
                            </TabsContent>

                            <TabsContent value="env">
                                <EnvPortsTab
                                    service={service}
                                    updateService={updateService}
                                />
                            </TabsContent>

                            <TabsContent value="advanced">
                                <AdvancedTab
                                    service={service}
                                    updateService={updateService}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                </ScrollArea>
            </aside>
        </TooltipProvider>
    );
}
