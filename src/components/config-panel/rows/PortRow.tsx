import { Trash2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../ui/select';
import type { Port } from '../../../types';

interface PortRowProps {
    port: Port;
    onChange: (p: Port) => void;
    onRemove: () => void;
}

export function PortRow({ port, onChange, onRemove }: PortRowProps) {
    return (
        <div className="flex items-end gap-2 group p-3 rounded-lg border bg-muted/10 relative">
            <div className="grid grid-cols-2 gap-2 flex-1">
                <div className="space-y-1">
                    <Label className="text-[9px] font-bold uppercase text-muted-foreground/70 text-left block">Host</Label>
                    <Input
                        type="number"
                        value={port.host}
                        onChange={(e) => onChange({ ...port, host: parseInt(e.target.value) || 0 })}
                        className="h-8 font-mono text-xs"
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-[9px] font-bold uppercase text-muted-foreground/70 text-left block">Container</Label>
                    <Input
                        type="number"
                        value={port.container}
                        onChange={(e) => onChange({ ...port, container: parseInt(e.target.value) || 0 })}
                        className="h-8 font-mono text-xs"
                    />
                </div>
            </div>
            <div className="space-y-1">
                <Label className="text-[9px] font-bold uppercase text-muted-foreground/70 text-left block">Type</Label>
                <Select
                    value={port.protocol || 'tcp'}
                    onValueChange={(v) => onChange({ ...port, protocol: v as 'tcp' | 'udp' })}
                >
                    <SelectTrigger className="h-8 w-[64px] text-[10px] font-mono">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="tcp">TCP</SelectItem>
                        <SelectItem value="udp">UDP</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onRemove}
            >
                <Trash2 size={13} />
            </Button>
        </div>
    );
}
