import { Edit3, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '../modals';

interface ServiceNodeActionsProps {
    serviceName: string;
    onEdit: () => void;
    onDuplicate: () => void;
    onRemove: () => void;
}

export function ServiceNodeActions({
    serviceName,
    onEdit,
    onDuplicate,
    onRemove,
}: ServiceNodeActionsProps) {
    return (
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 ml-1 sm:ml-2">
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                }}
                title="Edit Service"
            >
                <Edit3 size={13} />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 hidden sm:flex"
                onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                }}
                title="Duplicate"
            >
                <Copy size={13} />
            </Button>
            <ConfirmDialog
                trigger={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                        onClick={(e) => e.stopPropagation()}
                        title="Remove"
                    >
                        <Trash2 size={13} />
                    </Button>
                }
                title={`Delete "${serviceName}"?`}
                description="This service and its configuration will be removed from the canvas. You can undo this with Ctrl+Z."
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={onRemove}
            />
        </div>
    );
}
