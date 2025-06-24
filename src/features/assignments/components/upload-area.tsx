import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UploadCloud, Loader2 } from 'lucide-react';
import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

interface UploadAreaProps {
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onUploadClick: () => void;
    onDrop: (files: File[]) => void;
    isProcessing?: boolean;
    className?: string;
}

export const UploadArea: React.FC<UploadAreaProps> = ({
    onFileChange,
    onUploadClick,
    onDrop,
    isProcessing = false,
    className
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        fileInputRef.current?.click();
        onUploadClick();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        onDrop(files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <Card className={cn("p-0 border-dashed border-2 hover:border-primary/50 transition-colors", className)}>
            <Input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={onFileChange}
                className="sr-only"
                accept=".zip,.java"
            />

            <div
                className="p-12 text-center cursor-pointer"
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={(e) => e.preventDefault()}
            >
                {isProcessing ? (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 text-primary animate-spin" />
                        <div>
                            <p className="text-sm font-medium text-foreground">Processing files...</p>
                            <p className="text-xs text-muted-foreground mt-1">Please wait while we process your upload</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <UploadCloud className="h-12 w-12 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium text-foreground">Drag & Drop or click to upload</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Files with prefix <code className="bg-muted px-1 rounded">NIM_</code> will be auto-assigned to students
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};