import { useState, useRef, useEffect } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ConfirmDialogProps {
    trigger: React.ReactNode;
    title: string;
    description: string;
    confirmLabel?: string;
    variant?: 'destructive' | 'default';
    onConfirm: () => void;
}

export function ConfirmDialog({
    trigger,
    title,
    description,
    confirmLabel = 'Confirm',
    variant = 'destructive',
    onConfirm,
}: ConfirmDialogProps) {
    const [open, setOpen] = useState(false);
    const actionRef = useRef<HTMLButtonElement>(null);

    // Auto-focus the confirm button when dialog opens so Enter triggers confirm
    useEffect(() => {
        if (open) {
            // Small delay to ensure the dialog content is rendered
            const timer = setTimeout(() => {
                actionRef.current?.focus();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [open]);

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                {trigger}
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-base font-bold">{title}</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-muted-foreground">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="h-9 text-xs font-medium">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        ref={actionRef}
                        onClick={onConfirm}
                        className={`h-9 text-xs font-bold ${variant === 'destructive'
                            ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                            : ''
                            }`}
                    >
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
