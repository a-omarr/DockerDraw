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
import type { Volume } from '../../../types';

interface VolumeRowProps {
    volume: Volume;
    onChange: (v: Volume) => void;
    onRemove: () => void;
}

export function VolumeRow({ volume, onChange, onRemove }: VolumeRowProps) {
    return (
        <div className="flex flex-col gap-2 p-3 rounded-lg border bg-muted/10 group relative">
            <div className="flex items-center justify-between mb-1">
                <Label className="text-[9px] font-bold uppercase text-muted-foreground/70 text-left block">Mapping</Label>
                <div className="flex items-center gap-2">
                    <Select
                        value={volume.mode || 'rw'}
                        onValueChange={(v) => onChange({ ...volume, mode: v as 'ro' | 'rw' })}
                    >
                        <SelectTrigger className="h-5 w-16 text-[9px] font-bold py-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="text-[9px]">
                            <SelectItem value="rw">RW</SelectItem>
                            <SelectItem value="ro">RO</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={onRemove}
                    >
                        <Trash2 size={12} />
                    </Button>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Input
                    value={volume.host}
                    onChange={(e) => onChange({ ...volume, host: e.target.value })}
                    placeholder="Host (local) path"
                    className="h-8 font-mono text-xs flex-1"
                />
                <span className="text-muted-foreground/40 font-mono text-xs">→</span>
                <Input
                    value={volume.container}
                    onChange={(e) => onChange({ ...volume, container: e.target.value })}
                    placeholder="Container path"
                    className="h-8 font-mono text-xs flex-1"
                />
            </div>
        </div>
    );
}
