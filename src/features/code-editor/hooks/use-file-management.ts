import { useCallback, useEffect, useState } from 'react';

export interface FileData {
    fileName: string;
    content: string;
}

interface UseFileManagementReturn {
    files: FileData[];
    activeFileName: string | null;
    setActiveFileName: (fileName: string | null) => void;
    handleCreateFile: (newFileName: string) => void;
    handleAddMultipleFiles: (newFiles: FileData[]) => void;
    handleRenameFile: (oldName: string, newName: string) => void;
    handleDeleteFile: (fileNameToDelete: string) => void;
    handleEditorChange: (value: string) => void;
}

function useFileManagement(initialFiles: FileData[], readOnly?: boolean): UseFileManagementReturn {
    const [files, setFiles] = useState<FileData[]>(initialFiles);
    const [activeFileName, setActiveFileName] = useState<string | null>(initialFiles[0]?.fileName || null);

    useEffect(() => {
        if (readOnly) {
            setActiveFileName(null);
        }
    }, [readOnly]);

    const handleCreateFile = useCallback((newFileName: string) => {
        const className = newFileName.split('.')[0] || 'NewClass';
        const newFile: FileData = { fileName: newFileName, content: `public class ${className} {\n\t\n}` };
        setFiles(f => [...f, newFile]);
        setActiveFileName(newFileName);
    }, []);

    const handleAddMultipleFiles = useCallback((newFiles: FileData[]) => {
        if (readOnly) return;

        setFiles(prevFiles => {
            const existingNames = new Set(prevFiles.map(f => f.fileName));
            const uniqueFiles = newFiles.filter(file => !existingNames.has(file.fileName));
            return [...prevFiles, ...uniqueFiles];
        });
    }, [readOnly]);

    const handleRenameFile = useCallback((oldName: string, newName: string) => {
        if (readOnly) return;
        setFiles(fs => fs.map(f => f.fileName === oldName ? { ...f, fileName: newName } : f));
        if (activeFileName === oldName) setActiveFileName(newName);
    }, [activeFileName, readOnly]);

    const handleDeleteFile = useCallback((fileNameToDelete: string) => {
        if (readOnly) return;
        setFiles(currentFiles => {
            const newFiles = currentFiles.filter(f => f.fileName !== fileNameToDelete);
            if (activeFileName === fileNameToDelete) {
                const deletedIndex = currentFiles.findIndex(f => f.fileName === fileNameToDelete);
                const newActiveIndex = Math.max(0, deletedIndex - 1);
                setActiveFileName(newFiles[newActiveIndex]?.fileName || null);
            }
            return newFiles;
        });
    }, [activeFileName, readOnly]);

    const handleEditorChange = useCallback((value: string) => {
        if (readOnly) return;
        if (activeFileName) {
            setFiles(currentFiles => currentFiles.map(f => f.fileName === activeFileName ? { ...f, content: value } : f));
        }
    }, [activeFileName, readOnly]);

    return { files, activeFileName, setActiveFileName, handleCreateFile, handleAddMultipleFiles, handleRenameFile, handleDeleteFile, handleEditorChange };
}

export default useFileManagement;