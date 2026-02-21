import { Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UndoRedoButtonsProps {
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
    className?: string;
    variant?: 'ghost' | 'outline';
}

export function UndoRedoButtons({
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    className,
    variant = 'ghost'
}: UndoRedoButtonsProps) {
    return (
        <div className={cn("flex items-center gap-0.5", className)}>
            <Button
                variant={variant}
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={onUndo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
            >
                <Undo2 size={14} />
            </Button>
            <Button
                variant={variant}
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={onRedo}
                disabled={!canRedo}
                title="Redo (Ctrl+Shift+Z)"
            >
                <Redo2 size={14} />
            </Button>
        </div>
    );
}
