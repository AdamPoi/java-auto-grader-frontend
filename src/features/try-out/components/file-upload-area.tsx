import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { FileData } from '@/features/code-editor/hooks/use-file-management';
import JSZip from 'jszip';
import React, { useCallback, useState } from 'react';

interface FileUploadAreaProps {
    onFilesUpload: (files: FileData[]) => void;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({ onFilesUpload }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles(Array.from(event.target.files));
            setError(null);
        }
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files) {
            setFiles(Array.from(e.dataTransfer.files));
            setError(null);
        }
    }, []);

    const handleUpload = async () => {
        if (files.length === 0) {
            setError("No files selected.");
            return;
        }

        setError(null);

        setError(null);

        for (const file of files) {
            const javaFilesForSubmission: FileData[] = [];

            if (file.name.endsWith('.java')) {
                const content = await file.text();
                javaFilesForSubmission.push({ fileName: file.name, content });
            } else if (file.name.endsWith('.zip')) {
                try {
                    const zip = await JSZip.loadAsync(file);
                    for (const filename of Object.keys(zip.files)) {
                        if (filename.endsWith('.java') && !zip.files[filename].dir) {
                            const content = await zip.files[filename].async('text');
                            javaFilesForSubmission.push({ fileName: filename, content });
                        }
                    }
                } catch (err) {
                    setError(`Failed to extract zip file ${file.name}.`);
                    continue;
                }
            } else {
                setError(`Unsupported file type: ${file.name}. Skipping.`);
                continue;
            }

            if (javaFilesForSubmission.length > 0) {
                onFilesUpload(javaFilesForSubmission);
            } else {
                setError(`No Java files found in ${file.name}. Skipping.`);
            }
        }
        setFiles([]);
    };


    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Upload Java Project</CardTitle>
                <CardDescription>Drag & drop your .java or .zip file here, or click to select.</CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload-input')?.click()}
                >
                    <Input
                        id="file-upload-input"
                        type="file"
                        accept=".java,.zip"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    {files.length > 0 ? (
                        <p className="text-gray-700">Selected {files.length} file(s)</p>
                    ) : (
                        <p className="text-gray-500">No files selected</p>
                    )}
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <Button onClick={handleUpload} disabled={files.length === 0} className="mt-4 w-full">
                    Upload
                </Button>
            </CardContent>
        </Card>
    );
};

export default FileUploadArea;