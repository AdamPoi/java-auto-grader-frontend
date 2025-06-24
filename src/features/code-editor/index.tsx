import JSZip from 'jszip';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import useDebounce from '../../hooks/use-debounce';
import useCodeIntel from './hooks/use-code-intel';
import { useCodeRunner } from './hooks/use-code-runner';
import useFileManagement, { type FileData } from './hooks/use-file-management';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { SearchRequestParams } from '@/types/api.types';
import { areFilesEqual } from '@/utils/component-util';
import { IconEdit, IconPlus, IconUpload, IconX } from '@tabler/icons-react';
import { useParams } from '@tanstack/react-router';
import type { Assignment } from '../assignments/data/types';
import { useAssignmentById } from '../assignments/hooks/use-assignment';
import type { Rubric } from '../rubrics/data/types';
import { useRubrics } from '../rubrics/hooks/use-rubric';
import type { Submission, TestSubmitRequest } from '../submissions/data/types';
import Terminal from './components/code-terminal';
import MonacoEditor from './components/monaco-editor';
import { TestPanel } from './components/test-panel';

const initialFilesData: FileData[] = [
    { fileName: "Main.java", content: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("hello world");\n        helloIndonesia();\n    }\n\n    public static void helloIndonesia() {\n        String kota = "Jakarta";\n        System.out.println("Hello from Indonesia! We are in " + kota);\n    }\n}` },
];

interface CodeEditorProps {
    initialFilesData?: FileData[];
    onFileChange?: (files: FileData[]) => void;
    readOnly?: boolean;
    assignment?: Assignment
    submissionMutation: {
        mutateAsync: (payload: TestSubmitRequest) => Promise<Submission>;
        isLoading?: boolean;
        error?: any;
    };
}

const CodeEditor = ({ initialFilesData: propInitialFilesData, onFileChange, readOnly, assignment: existedAssignment, submissionMutation }: CodeEditorProps) => {
    const { files, activeFileName, setActiveFileName, handleCreateFile,
        handleRenameFile, handleDeleteFile, handleEditorChange,
        handleAddMultipleFiles } = useFileManagement(propInitialFilesData || initialFilesData, readOnly);

    const debouncedFiles = useDebounce(files, 500);
    const { intel, errors, validateFile } = useCodeIntel(debouncedFiles);

    const prevFilesRef = useRef<FileData[] | undefined>(undefined);

    useEffect(() => {
        if (onFileChange && !areFilesEqual(prevFilesRef.current, files)) {
            onFileChange(files);
        }
        prevFilesRef.current = files;
    }, [files, onFileChange]);


    const [modal, setModal] = useState<{ type: 'create' | 'rename' | 'delete'; payload: string } | null>(null);
    const [fileNameInput, setFileNameInput] = useState('');
    const [modalError, setModalError] = useState('');
    const [terminalHeight, setTerminalHeight] = useState(360);
    const [bottomPanelTab, setBottomPanelTab] = useState<'terminal' | 'tests'>('terminal');
    const [sidebarWidth, setSidebarWidth] = useState(320);
    const isResizingRef = useRef(false);
    const isSidebarResizingRef = useRef(false);

    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const activeFile = useMemo(() => files.find(f => f.fileName === activeFileName), [files, activeFileName]);

    useEffect(() => {
        validateFile(activeFile);
    }, [activeFile, validateFile]);


    const handleMouseUp = (e: MouseEvent) => {
        isResizingRef.current = false;
        isSidebarResizingRef.current = false;
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isResizingRef.current) {
            setTerminalHeight(window.innerHeight - e.clientY);
        }
        if (isSidebarResizingRef.current) {
            setSidebarWidth(Math.max(200, Math.min(400, e.clientX)));
        }
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove]);

    const showModal = (type: 'create' | 'rename' | 'delete', payload: string = '') => {
        setFileNameInput(payload);
        setModalError('');
        setModal({ type, payload });
    };

    const handleModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const name = fileNameInput.trim();

        if (!name) {
            setModalError('File name cannot be empty.');
            return;
        }

        if (modal?.type === 'create') {
            if (files.some(f => f.fileName === name)) {
                setModalError(`A file named "${name}" already exists.`);
                return;
            }
            handleCreateFile(name);
        } else if (modal?.type === 'rename') {
            if (name !== modal.payload && files.some(f => f.fileName === name)) {
                setModalError(`A file named "${name}" already exists.`);
                return;
            }
            handleRenameFile(modal.payload, name);
        }
        setModal(null);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles = event.target.files;
        if (!uploadedFiles || uploadedFiles.length === 0) return;

        setIsUploading(true);
        const newFilesData: FileData[] = [];

        for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            if (file.name.endsWith('.java')) {
                const content = await file.text();
                newFilesData.push({ fileName: file.name, content });
            } else if (file.name.endsWith('.zip')) {
                try {
                    const zip = await JSZip.loadAsync(file);
                    const javaFilesPromises: Promise<FileData>[] = [];

                    zip.forEach((relativePath, zipEntry) => {
                        if (!zipEntry.dir && relativePath.endsWith('.java')) {
                            javaFilesPromises.push(
                                zipEntry.async('text').then(content => ({
                                    fileName: relativePath.split('/').pop() || relativePath,
                                    content,
                                }))
                            );
                        }
                    });
                    const extractedJavaFiles = await Promise.all(javaFilesPromises);
                    newFilesData.push(...extractedJavaFiles);
                } catch (error) {
                    console.error('Error unzipping file:', error);
                    setModalError(`Failed to process zip file ${file.name}.`);
                }
            }
        }

        if (newFilesData.length > 0) {
            handleAddMultipleFiles(newFilesData);
        }
        setIsUploading(false);
        // Clear the input so the same file can be uploaded again
        event.target.value = '';
    };

    const [assignmentIdState, setAssignmentIdState] = useState("");
    const getAssignmentId = () => {
        try {
            const adminParams = useParams({ from: '/_authenticated/admin/assignments/$assignmentId/' });
            return adminParams.assignmentId;
        } catch {
            try {
                const studentParams = useParams({ from: '/_authenticated/app/assignments/$assignmentId/' });
                return studentParams.assignmentId;
            } catch {
                const genericParams = useParams({ strict: false });
                return genericParams.assignmentId;
            }
        }
    };

    const assignmentId = getAssignmentId();
    const [rubrics, setRubrics] = useState<Rubric[] | undefined>(undefined);
    const [assignment, setAssignment] = useState<Assignment | undefined>(undefined);

    useEffect(() => {
        if (!existedAssignment) {
            setAssignmentIdState(assignmentId ?? '');
        } else {
            setAssignment(existedAssignment);
            setRubrics(existedAssignment?.rubrics);
            setAssignmentIdState(existedAssignment.id);
        }
    }, [existedAssignment, assignmentId]);

    const rubricSearchParams: SearchRequestParams = {
        page: 0,
        size: 1000,
        filter: `assignment=eq:${assignmentIdState}`,
    };

    const { data: rubricdata, isLoading: isLoadingRubrics } = useRubrics(rubricSearchParams);
    const { data: assignmentdata, isLoading: isLoadingAssignment } = useAssignmentById(assignmentIdState);

    useEffect(() => {
        setRubrics(rubricdata?.content);
        setAssignment(assignmentdata);

    }, [rubricdata, assignmentdata, existedAssignment]);




    const {
        terminalOutput,
        isRunning,
        clearTerminal,
        runCode,
    } = useCodeRunner();

    return (
        <div className="bg-neutral-900 text-white h-screen flex font-sans">
            <div
                className="flex-shrink-0 bg-neutral-800 border-r border-neutral-700 flex flex-col"
                style={{ width: `${sidebarWidth}px` }}>
                {/* Sidebar Header */}
                <div className="p-3 border-b border-neutral-700 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-neutral-200">Explorer</h3>
                    <div className="flex justify-end">
                        <Button
                            onClick={() => showModal('create')}
                            disabled={isRunning}
                            variant="ghost"
                            size="icon"
                            title="New File"
                        >
                            <IconPlus className='h-4 w-4 text-2xl' />
                        </Button>
                        <Input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                            multiple
                            accept=".java,.zip"
                        />
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isRunning || isUploading}
                            variant="ghost"
                            size="icon"
                            title="Upload Files"
                        >
                            <IconUpload className='h-4 w-4 text-2xl' />
                        </Button>
                    </div>
                </div>

                {/* File List */}
                <div className="flex-grow overflow-auto">
                    {files.map(file => (
                        <div
                            key={file.fileName}
                            onClick={() => setActiveFileName(file.fileName)}
                            onContextMenu={(e) => {
                                e.preventDefault();
                            }}
                            className={`
                                flex items-center px-3 py-1.5 cursor-pointer hover:bg-neutral-700 text-sm group
                                ${activeFileName === file.fileName ? 'bg-neutral-700 border-l-2 ' : ''}
                            `}
                        >
                            {/* <span className="mr-2 text-xs">{getFileIcon(file.fileName)}</span> */}
                            <span className="flex-grow truncate">{file.fileName}</span>
                            <div className="flex items-center justify-end opacity-0 group-hover:opacity-100">
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        showModal('rename', file.fileName);
                                    }}
                                    variant="ghost"
                                    title="Rename"
                                >
                                    <IconEdit className='h-4 w-4 text-sm' />
                                </Button>
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        showModal('delete', file.fileName);
                                    }}
                                    variant="ghost"
                                    title="Delete"
                                >
                                    <IconX className='h-4 w-4 text-sm' color='red' />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar Resize Handle */}
            {/* <div
                onMouseDown={handleSidebarMouseDown}
                className="w-1 bg-neutral-700 hover:bg-pri cursor-col-resize flex-shrink-0"
            ></div> */}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar with Run Button */}
                <div className="flex-shrink-0 p-3 bg-neutral-800 border-b border-neutral-700 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {activeFile && (
                            <div className="flex items-center space-x-2 text-sm text-neutral-300">
                                {/* <span>{getFileIcon(activeFile.fileName)}</span> */}
                                <span>{activeFile.fileName}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end space-x-2">

                        <Button
                            onClick={() => runCode(files)}
                            disabled={isRunning || isUploading}
                            className="bg-green-600 hover:bg-green-500 text-white"
                            title="Run Code"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                            <span className="ml-2">Run</span>
                        </Button>
                        {/* {rubrics?.content && rubrics.content.length > 0 && <TestButton
                            rubrics={rubrics.content}
                            onSelectRubric={openTestRunner}
                            disabled={files.length === 0}
                        />} */}
                    </div>

                </div>

                {/* Editor and Terminal Container */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Code Editor Area */}
                    <div className="flex-1 overflow-hidden" style={{ height: `calc(100vh - 120px - ${terminalHeight}px)` }}>
                        {activeFile ? (

                            <MonacoEditor
                                key={activeFile.fileName}
                                language={"java"}
                                value={activeFile.content || ''}
                                onChange={handleEditorChange}
                                codeIntel={intel}
                                errors={errors}
                                readOnly={readOnly}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-neutral-500">
                                Select a file to start editing
                            </div>
                        )}
                    </div>

                    {/* Terminal/Test Panel */}
                    <div className="flex-shrink-0 border-t border-neutral-700" style={{ height: `${terminalHeight}px` }}>
                        {/* Resize Handle */}
                        <div
                            className="h-1 bg-neutral-600 cursor-row-resize hover:bg-blue-500 w-full"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                const startY = e.clientY;
                                const startHeight = terminalHeight;

                                const handleMouseMove = (e: MouseEvent) => {
                                    const deltaY = startY - e.clientY;
                                    const newHeight = Math.max(150, Math.min(600, startHeight + deltaY));
                                    setTerminalHeight(newHeight);
                                };

                                const handleMouseUp = () => {
                                    document.removeEventListener('mousemove', handleMouseMove);
                                    document.removeEventListener('mouseup', handleMouseUp);
                                };

                                document.addEventListener('mousemove', handleMouseMove);
                                document.addEventListener('mouseup', handleMouseUp);
                            }}
                        />

                        {/* Tab Header */}
                        <div className="flex bg-neutral-800">
                            <button
                                onClick={() => setBottomPanelTab('terminal')}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium border-r border-neutral-700",
                                    bottomPanelTab === 'terminal'
                                        ? "bg-neutral-700 text-white"
                                        : "text-neutral-400 hover:text-white hover:bg-neutral-750"
                                )}
                            >
                                Terminal
                            </button>
                            <button
                                onClick={() => setBottomPanelTab('tests')}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium border-r border-neutral-700",
                                    bottomPanelTab === 'tests'
                                        ? "bg-neutral-700 text-white"
                                        : "text-neutral-400 hover:text-white hover:bg-neutral-750"
                                )}
                            >
                                Test Cases
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="overflow-hidden" style={{ height: `calc(100% - 41px)` }}>
                            {bottomPanelTab === 'terminal' ? (
                                <Terminal
                                    output={terminalOutput}
                                    isRunning={isRunning}
                                    onClear={clearTerminal}
                                />
                            ) : (
                                <TestPanel
                                    submissionMutation={submissionMutation}
                                    rubrics={rubrics || []}
                                    assignmentId={assignmentId}
                                    testCode={assignment?.testCode}
                                    files={files}
                                />

                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Test Runner Modal
            {selectedRubric && (
                <TestRunner
                    isOpen={isTestRunnerOpen}
                    onClose={closeTestRunner}
                    rubric={selectedRubric}
                    isRunning={isTestRunning}
                    testResult={testResult}
                    liveTestOutput={liveTestOutput}
                    onRunTests={handleRunTests}
                />
            )} */}
            {/* Modals */}
            <Dialog open={!!(modal && modal.type !== 'delete')} onOpenChange={(open) => !open && setModal(null)}>
                <DialogContent className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700">
                    <DialogHeader>
                        <DialogTitle className="text-neutral-900 dark:text-neutral-100">{(modal?.type ? modal.type.charAt(0).toUpperCase() + modal.type.slice(1) : '') + ' File'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleModalSubmit}>
                        <Label className='my-2 text-neutral-700 dark:text-neutral-300' htmlFor='fileNameInput'>
                            File Name:
                        </Label>
                        <Input
                            id='fileNameInput'
                            value={fileNameInput}
                            onChange={e => setFileNameInput(e.target.value)}
                            placeholder="MyClass.java"
                            autoFocus
                            className="bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-600"
                        />

                        {modalError && <p className="text-red-400 text-sm mt-2">{modalError}</p>}
                        <DialogFooter className="mt-6">
                            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
                            <Button variant="default" type="submit">
                                {modal?.type === 'rename' ? 'Save' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!(modal?.type === 'delete')} onOpenChange={(open) => !open && setModal(null)}>
                <DialogContent className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700">
                    <DialogHeader>
                        <DialogTitle className="text-neutral-900 dark:text-neutral-100">Confirm Deletion</DialogTitle>
                        <DialogDescription className="text-neutral-600 dark:text-neutral-400">
                            Are you sure you want to delete <span className="font-semibold text-red-400">{modal?.payload}</span>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                handleDeleteFile(modal?.payload || '');
                                setModal(null);
                            }}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
export default CodeEditor;

