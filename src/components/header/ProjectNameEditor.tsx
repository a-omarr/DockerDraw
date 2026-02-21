import { useState } from 'react';
import { SiOpencontainersinitiative } from 'react-icons/si';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ProjectNameEditorProps {
    projectName: string;
    onSave: (name: string) => void;
}

export function ProjectNameEditor({ projectName, onSave }: ProjectNameEditorProps) {
    const [editing, setEditing] = useState(false);
    const [tempName, setTempName] = useState(projectName);

    const handleSubmit = () => {
        onSave(tempName || 'my-project');
        setEditing(false);
    };

    if (editing) {
        return (
            <Input
                autoFocus
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="h-8 w-32 sm:w-48 text-sm font-medium"
            />
        );
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 font-medium text-muted-foreground hover:text-foreground max-w-[120px] sm:max-w-[200px]"
            onClick={() => {
                setTempName(projectName);
                setEditing(true);
            }}
            title="Click to rename project"
        >
            <SiOpencontainersinitiative size={14} className="mr-2 text-primary/70 shrink-0" />
            <span className="truncate">{projectName}</span>
        </Button>
    );
}
