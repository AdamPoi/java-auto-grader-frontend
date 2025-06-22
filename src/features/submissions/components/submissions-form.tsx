import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import MonacoEditor from '@/features/code-editor/components/monaco-editor'; // Assuming this is the correct import path
import type { FileData } from '@/features/code-editor/hooks/use-file-management';
import FileUploadArea from '@/features/try-out/components/file-upload-area';
import React, { useState } from 'react';

interface SubmissionsFormProps {
    onSubmit: (data: { files: FileData[]; codeEditorContent: string }) => void;
}

export const SubmissionsForm: React.FC<SubmissionsFormProps> = ({ onSubmit }) => {
    const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);
    const [codeEditorContent, setCodeEditorContent] = useState<string>('');

    const handleFilesUpload = (files: FileData[]) => {
        setUploadedFiles(files);
    };

    const handleSubmit = () => {
        onSubmit({ files: uploadedFiles, codeEditorContent });
    };

    return (
        <Card className="w-full mx-auto">
            <CardHeader>
                <CardTitle>Student Submission</CardTitle>
                <CardDescription>Submit your Java code or project files.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* File Upload Area */}
                <div className="flex flex-col space-y-4">
                    <Label htmlFor="file-upload-area">Upload Files</Label>
                    <FileUploadArea onFilesUpload={handleFilesUpload} />
                    {uploadedFiles.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                            <p>Uploaded Files:</p>
                            <ul className="list-disc list-inside">
                                {uploadedFiles.map((file, index) => (
                                    <li key={index}>{file.fileName}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Optional Code Editor */}
                <div className="flex flex-col space-y-4">
                    <Label htmlFor="code-editor">Or paste your code here (Optional)</Label>
                    <div className="border rounded-md overflow-hidden h-64"> {/* Fixed height for editor */}
                        <MonacoEditor
                            language="java"
                            value={codeEditorContent}
                            onChange={(value) => setCodeEditorContent(value || '')}
                            codeIntel={null}
                            errors={[]}
                        />
                    </div>
                </div>

                {/* AI-powered Action Buttons */}
                <div className="lg:col-span-2 flex flex-col sm:flex-row gap-4 mt-4">
                    <Button variant="outline" className="flex-1">Review Code (AI)</Button>
                    <Button variant="outline" className="flex-1">Add Comments (AI)</Button>
                </div>

                {/* Submit Button */}
                <div className="lg:col-span-2 mt-6">
                    <Button onClick={handleSubmit} className="w-full">Submit Submission</Button>
                </div>
            </CardContent>
        </Card>
    );
};
