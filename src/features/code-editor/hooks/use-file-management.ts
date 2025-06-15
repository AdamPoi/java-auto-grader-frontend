import { useState, useCallback } from 'react';

export interface FileData {
    fileName: string;
    content: string;
}

interface UseFileManagementReturn {
    files: FileData[];
    activeFileName: string | null;
    setActiveFileName: (fileName: string | null) => void;
    handleCreateFile: (newFileName: string) => void;
    handleRenameFile: (oldName: string, newName: string) => void;
    handleDeleteFile: (fileNameToDelete: string) => void;
    handleEditorChange: (value: string) => void;
}

function useFileManagement(initialFiles: FileData[]): UseFileManagementReturn {
    const [files, setFiles] = useState<FileData[]>(initialFiles);
    const [activeFileName, setActiveFileName] = useState<string | null>(initialFiles[0]?.fileName || null);

    const handleCreateFile = useCallback((newFileName: string) => {
        const className = newFileName.split('.')[0] || 'NewClass';
        const newFile: FileData = { fileName: newFileName, content: `public class ${className} {\n\t\n}` };
        setFiles(f => [...f, newFile]);
        setActiveFileName(newFileName);
    }, []);

    const handleRenameFile = useCallback((oldName: string, newName: string) => {
        setFiles(fs => fs.map(f => f.fileName === oldName ? { ...f, fileName: newName } : f));
        if (activeFileName === oldName) setActiveFileName(newName);
    }, [activeFileName]);

    const handleDeleteFile = useCallback((fileNameToDelete: string) => {
        setFiles(currentFiles => {
            const newFiles = currentFiles.filter(f => f.fileName !== fileNameToDelete);
            if (activeFileName === fileNameToDelete) {
                const deletedIndex = currentFiles.findIndex(f => f.fileName === fileNameToDelete);
                const newActiveIndex = Math.max(0, deletedIndex - 1);
                setActiveFileName(newFiles[newActiveIndex]?.fileName || null);
            }
            return newFiles;
        });
    }, [activeFileName]);

    const handleEditorChange = useCallback((value: string) => {
        if (activeFileName) {
            setFiles(currentFiles => currentFiles.map(f => f.fileName === activeFileName ? { ...f, content: value } : f));
        }
    }, [activeFileName]);

    return { files, activeFileName, setActiveFileName, handleCreateFile, handleRenameFile, handleDeleteFile, handleEditorChange };
}

export default useFileManagement;