import { useState } from 'react';
import { Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { cn } from '../../../lib/utils';
import type { EnvVar } from '../../../types';

interface EnvVarRowProps {
    envVar: EnvVar;
    onChange: (e: EnvVar) => void;
    onRemove: () => void;
}

export function EnvVarRow({ envVar, onChange, onRemove }: EnvVarRowProps) {
    const [showValue, setShowValue] = useState(!envVar.isSecret);

    return (
        <div className="flex flex-col gap-2 p-3 rounded-lg border bg-muted/10 group relative">
            <div className="flex items-center justify-between gap-2">
                <Input
                    value={envVar.key}
                    onChange={(e) => onChange({ ...envVar, key: e.target.value })}
                    placeholder="VAR_NAME"
                    className="h-8 flex-1 font-mono text-xs uppercase"
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-8 w-8",
                        envVar.isSecret ? "text-primary" : "text-muted-foreground"
                    )}
                    onClick={() => onChange({ ...envVar, isSecret: !envVar.isSecret })}
                    title={envVar.isSecret ? "Mark as public" : "Mark as secret"}
                >
                    {envVar.isSecret ? <EyeOff size={13} /> : <Eye size={13} />}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={onRemove}
                >
                    <Trash2 size={13} />
                </Button>
            </div>
            <div className="relative">
                <Input
                    value={envVar.value}
                    onChange={(e) => onChange({ ...envVar, value: e.target.value })}
                    type={envVar.isSecret && !showValue ? 'password' : 'text'}
                    placeholder="value"
                    className="h-8 font-mono text-xs pr-8"
                />
                {envVar.isSecret && (
                    <button
                        type="button"
                        onClick={() => setShowValue((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        {showValue ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                )}
            </div>
        </div>
    );
}
