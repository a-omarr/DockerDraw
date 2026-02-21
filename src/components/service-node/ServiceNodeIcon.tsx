import type { ServiceTemplate } from '../../types';

interface ServiceNodeIconProps {
    template: ServiceTemplate | undefined;
    color: string;
    emoji: string;
}

export function ServiceNodeIcon({ template, color, emoji }: ServiceNodeIconProps) {
    return (
        <div
            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl text-xl sm:text-2xl flex-shrink-0 shadow-sm border border-border/50"
            style={{ backgroundColor: `${color}10`, color: color }}
        >
            {template?.Icon ? (
                <>
                    <template.Icon size={20} className="sm:hidden" />
                    <template.Icon size={24} className="hidden sm:block" />
                </>
            ) : (
                emoji
            )}
        </div>
    );
}
