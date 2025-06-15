import { Button } from '@/components/ui/button';
import { FileText, Upload, X } from 'lucide-react';
import React from 'react';
import type { SourceFile } from '../data/types';
import { useTestBuilderStore } from '../hooks/use-test-builder-store';

export const SourceFilePanel: React.FC = () => {
    const { sourceFiles, setSourceFiles } = useTestBuilderStore();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const filePromises = Array.from(files).map(file => {
            return new Promise<SourceFile>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve({ name: file.name, content: e.target?.result as string });
                reader.onerror = (e) => reject(e);
                reader.readAsText(file);
            });
        });

        Promise.all(filePromises).then(newFiles => {
            setSourceFiles([...sourceFiles, ...newFiles]);
        });

        // Reset file input
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleRemoveFile = (fileName: string) => {
        setSourceFiles(sourceFiles.filter(f => f.name !== fileName));
    };

    return (
        <div className="flex flex-col pt-4 border-t mt-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center text-gray-700"><FileText className="mr-2" />Source Files</h2>
                <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Upload</Button>
                <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".java" />
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                {sourceFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-lg text-sm">
                        <span className='truncate pr-2'>{file.name}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full flex-shrink-0" onClick={() => handleRemoveFile(file.name)}>
                            <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};