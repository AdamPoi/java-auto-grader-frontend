import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { FileData } from '@/features/code-editor/hooks/use-file-management';
import type { TestSubmitRequest } from '@/features/submissions/data/types';
import { useCreateSubmission, useDeleteSubmission, useSubmissionsList, useUpdateSubmission } from '@/features/submissions/hooks/use-submission';
import { useUsersList } from '@/features/users/hooks/use-user';
import { useNavigate, useParams } from '@tanstack/react-router';
import { CheckCircle, Eye, FileArchive, File as FileIcon, Loader2, Trash2, UploadCloud, User, UserCheck, XCircle } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import { useAssignmentById } from '../hooks/use-assignment';

const loadJSZip = (callback: (jszip: any) => void) => {
    if ((window as any).JSZip) {
        callback((window as any).JSZip);
        return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.onload = () => {
        callback((window as any).JSZip);
    };
    document.body.appendChild(script);
};


interface PendingSubmission {
    key: string;
    studentId: string | null;
    nim?: string;
    originalFileName: string;
    requiresSelection: boolean;
    type: 'zip' | 'java';
    files: FileData[];
}

export default function BulkUpload() {
    const navigate = useNavigate();

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

    const { data: assignment, isLoading: isLoadingAssignment } = useAssignmentById(assignmentId);

    const { data: submissionsData, isLoading: isLoadingSubmissions, refetch } = useSubmissionsList({
        page: 0,
        size: 100,
        filter: `assignment=eq:${assignmentId}&type=eq:FINAL`,
    });

    const { data: studentsData, isLoading: isLoadingStudentstudents } = useUsersList({
        page: 0,
        size: 100,
        filter: `course=eq:${assignment?.courseId}`,
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([]);

    const studentFileInputRef = useRef<HTMLInputElement>(null);
    const testFileInputRef = useRef<HTMLInputElement>(null);
    const uploadTargetStudentIdRef = useRef<string | null>(null);
    const uploadTargetStudentNimRef = useRef<string | null>(null);

    const createSubmissionMutation = useCreateSubmission();
    const updateSubmissionMutation = useUpdateSubmission();
    const deleteSubmissionMutation = useDeleteSubmission();

    const [isCreateSubmissionLoading, setIsCreateSubmissionLoading] = useState(false);
    const [isUpdateSubmissionLoading, setIsUpdateSubmissionLoading] = useState(false);
    const [isDeleteSubmissionLoading, setIsDeleteSubmissionLoading] = useState(false);

    const submissions = submissionsData?.content || [];
    const students = studentsData?.content || [];

    const processFiles = useCallback(async (uploadedFiles: File[], isTestFile = false, forcedStudentId: string | null = null, forcedStudentNim: string | null = null) => {
        setIsProcessing(true);
        setError(null);

        if (forcedStudentId) {
            setPendingSubmissions(prev => prev.filter(s => s.nim !== forcedStudentId));
        }

        const newPendingSubmissions: PendingSubmission[] = [];
        const newTestFiles: FileData[] = [];

        for (const file of uploadedFiles) {
            const fileName = file.name;

            if (isTestFile) {
                if (fileName.endsWith('.java')) {
                    const content = await file.text();
                    newTestFiles.push({ fileName, content });
                }
                continue;
            }

            let studentId = forcedStudentId;
            let studentNim = forcedStudentNim;
            let requiresSelection = !forcedStudentId;
            const extractedNim = fileName.replace(/\.[^/.]+$/, "").split('_')[0];
            const foundStudent = students.find(s => extractedNim.includes(s?.nim));
            if (foundStudent) {
                studentId = foundStudent.id;
                studentNim = foundStudent.nim;
                requiresSelection = false;
            }

            const baseSubmission: PendingSubmission = {
                key: `${fileName}-${Date.now()}-${Math.random()}`,
                studentId,
                nim: studentNim,
                originalFileName: fileName,
                requiresSelection,
                type: file.type === 'application/zip' || fileName.endsWith('.zip') ? 'zip' : 'java',
                files: []
            };

            if (file.type === 'application/zip' || fileName.endsWith('.zip')) {
                try {
                    const JSZip = (await import('jszip')).default;
                    const zip = new JSZip();
                    const loadedZip = await zip.loadAsync(file);
                    const javaFiles: FileData[] = [];

                    for (const zipFileName in loadedZip.files) {
                        if (zipFileName.endsWith('.java') && !loadedZip.files[zipFileName].dir) {
                            const fileContent = await loadedZip.files[zipFileName].async("string");
                            const justFileName = zipFileName.split('/').pop() || zipFileName;
                            javaFiles.push({ fileName: justFileName, content: fileContent });
                        }
                    }

                    if (javaFiles.length > 0) {
                        baseSubmission.files = javaFiles;
                        newPendingSubmissions.push(baseSubmission);
                    }
                } catch (e) {
                    console.error("Error processing zip file:", e);
                    setError(`Failed to process ${fileName}: ${e instanceof Error ? e.message : 'Unknown error'}`);
                }
            } else if (fileName.endsWith('.java')) {
                const content = await file.text();
                baseSubmission.files = [{ fileName, content }];
                newPendingSubmissions.push(baseSubmission);
            }
        }

        if (newPendingSubmissions.length > 0) {
            setPendingSubmissions(prev => {
                const prevFileNames = new Set(prev.map(p => p.originalFileName));
                const filteredNew = forcedStudentId
                    ? newPendingSubmissions
                    : newPendingSubmissions.filter(ns => !prevFileNames.has(ns.originalFileName));
                return [...prev, ...filteredNew];
            });
        }

        setIsProcessing(false);
    }, []);

    const extractMainClassName = (javaContent: string): string => {
        const mainMethodRegex = /public\s+static\s+void\s+main\s*\(String\[\]\s*\w+\)\s*{/;
        const classRegex = /public\s+class\s+(\w+)\s*{/;

        if (mainMethodRegex.test(javaContent)) {
            const match = javaContent.match(classRegex);
            if (match && match[1]) {
                return match[1];
            }
        }
        return '';
    };

    const handleCreateSubmission = useCallback((studentId: string, files: FileData[]) => {
        if (files.length === 0) {
            return;
        }

        const submissionData: TestSubmitRequest = {
            sourceFiles: files.map(file => ({
                fileName: file.fileName,
                content: file.content,
            })),
            testFiles: [{
                fileName: 'MainTest.java',
                content: assignment?.testCode || '',
            }],
            status: 'uploaded',
            assignmentId,
            userId: studentId,
            totalPoints: 0,
            mainClassName: files.map(file => extractMainClassName(file.content)).find(name => name !== '') || 'Main',
            buildTool: 'gradle',
        };

        createSubmissionMutation.mutate(submissionData, {
            onSuccess: () => {
                refetch();
                setPendingSubmissions(prev => prev.filter(p => p.studentId !== studentId));
            },
            onError: (error) => {
                console.error('Failed to create submission:', error);
                setError(`Failed to create submission: ${error}`);
            }
        });
    }, [createSubmissionMutation, refetch, assignmentId]);

    const handleDeleteSubmission = useCallback((id: string) => {
        setIsDeleteSubmissionLoading(true);
        deleteSubmissionMutation.mutate(id, {
            onSuccess: () => {
                refetch();
                setIsDeleteSubmissionLoading(false);
            },
            onError: (error) => {
                setIsDeleteSubmissionLoading(false);
                console.error('Failed to delete submission:', error);
                setError(`Failed to delete submission: ${error}`);
            }
        });
    }, [deleteSubmissionMutation, refetch]);

    const handleUpdateSubmission = useCallback((id: string, files: FileData[]) => {
        setIsUpdateSubmissionLoading(true);
        const submissionCodes = files.map(file => ({
            fileName: file.fileName,
            sourceCode: file.content,
        }));

        updateSubmissionMutation.mutate({
            id,
            data: { submissionCodes }
        }, {
            onSuccess: () => {
                refetch();
                setIsUpdateSubmissionLoading(false);
            },
            onError: (error) => {
                console.error('Failed to update submission:', error);
                setError(`Failed to update submission: ${error}`);
                setIsUpdateSubmissionLoading(false);
            }
        });
    }, [updateSubmissionMutation, refetch]);

    const handleStudentSelect = useCallback((submissionKey: string, selectedStudentId: string) => {
        setPendingSubmissions(prev => prev.map(sub =>
            sub.key === submissionKey
                ? { ...sub, studentId: selectedStudentId, nim: students.find(s => s.id === selectedStudentId)?.nim, requiresSelection: false }
                : sub
        ));
    }, []);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, isTestFile: boolean) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 0) {
            processFiles(files, isTestFile, uploadTargetStudentIdRef.current, uploadTargetStudentNimRef.current);
        }
        uploadTargetStudentIdRef.current = null;
        uploadTargetStudentNimRef.current = null;
        event.target.value = '';
    }, [processFiles]);

    const handleUploadClick = useCallback((studentId: string | null = null, studentNim: string | null = null) => {
        uploadTargetStudentIdRef.current = studentId;
        uploadTargetStudentNimRef.current = studentNim;
        studentFileInputRef.current?.click();
    }, []);


    const handleBulkSubmit = useCallback(() => {
        setIsCreateSubmissionLoading(true);

        const submissionsToCreate = pendingSubmissions.filter(
            submission => submission.studentId && !submission.requiresSelection
        );

        if (submissionsToCreate.length === 0) {
            setIsCreateSubmissionLoading(false);
            return;
        }

        let completedCount = 0;
        const totalCount = submissionsToCreate.length;

        submissionsToCreate.forEach(submission => {
            if (submission.studentId) {
                const submissionData: TestSubmitRequest = {
                    sourceFiles: submission.files.map(file => ({
                        fileName: file.fileName,
                        content: file.content,
                    })),
                    testFiles: [{
                        fileName: 'MainTest.java',
                        content: assignment?.testCode || '',
                    }],
                    status: 'uploaded',
                    assignmentId,
                    userId: submission.studentId,
                    totalPoints: 0,
                    mainClassName: submission.files.map(file => extractMainClassName(file.content)).find(name => name !== '') || 'Main',
                    buildTool: 'gradle',
                    type: 'FINAL'
                };

                createSubmissionMutation.mutate(submissionData, {
                    onSuccess: () => {
                        completedCount++;
                        setPendingSubmissions(prev => prev.filter(p => p.studentId !== submission.studentId));

                        if (completedCount === totalCount) {
                            setIsCreateSubmissionLoading(false);
                            refetch();
                        }
                    },
                    onError: (error) => {
                        completedCount++;
                        console.error('Failed to create submission:', error);
                        setError(`Failed to create submission: ${error}`);

                        if (completedCount === totalCount) {
                            setIsCreateSubmissionLoading(false);
                            refetch();
                        }
                    }
                });
            }
        });
    }, [pendingSubmissions, createSubmissionMutation, refetch, assignmentId, assignment?.testCode]);


    const removePendingSubmission = useCallback((keyToRemove: string) => {
        setPendingSubmissions(prev => prev.filter(sub => sub.key !== keyToRemove));
    }, []);





    const allStudentsAssigned = pendingSubmissions.every(s => !s.requiresSelection);

    return (
        <div className="min-h-screen w-full bg-background text-foreground p-4 sm:p-6 lg:p-8 font-sans">
            <Input
                id="student-file-upload"
                ref={studentFileInputRef}
                type="file"
                multiple
                onChange={(e) => handleFileChange(e, false)}
                className="sr-only"
                accept=".zip,.java"
            />



            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Students Submissions</h1>
                    <p className="text-muted-foreground mt-2">See and upload student submissions.</p>
                </header>



                {/* Error Display */}
                {error && (
                    <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-start gap-2">
                            <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-destructive">Error</p>
                                <p className="text-sm text-destructive/90 mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
                <h2 className="text-2xl font-bold mb-4">Student Submissions</h2>
                <div className="relative block w-full rounded-lg border-2 border-dashed border-muted-foreground/50 p-12 text-center transition-colors cursor-pointer hover:border-primary/80" onClick={() => handleUploadClick()} onDrop={(e) => { e.preventDefault(); processFiles(Array.from(e.dataTransfer.files)) }} onDragOver={(e) => e.preventDefault()} onDragLeave={(e) => e.preventDefault()}>
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                    <span className="mt-4 block text-sm font-semibold text-foreground">Drag & Drop or click to upload</span>
                    <p className="text-xs text-muted-foreground">Files zip with prefix`NIM_` will be auto-assigned to student.</p>
                </div>

                {isProcessing && <div className="flex justify-center items-center mt-4 text-primary"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing files...</div>}
                {error && <p className="text-center mt-4 text-destructive">{error}</p>}
                {/* Existing Submissions */}
                {submissions.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Existing Submissions ({submissions.length})</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {submissions.map((submission) => {
                                const student = students.find(s => s.id === submission.studentId);
                                const studentName = `${student?.firstName} ${student?.lastName}` || `Student ${submission.studentId}`;
                                return (
                                    <Card key={submission.id}>
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <UserCheck className="h-4 w-4 text-green-500" />
                                                    <span className="font-medium text-sm">{studentName}</span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteSubmission(submission.id)}
                                                    disabled={isDeleteSubmissionLoading}
                                                    className="h-8 w-8"
                                                >
                                                    {isDeleteSubmissionLoading ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-3 w-3" />
                                                    )}
                                                </Button>
                                            </div>
                                            <div className="text-xs text-muted-foreground mb-2 space-x-2">
                                                <span>
                                                    NIM: {submission.student?.nim}
                                                </span>
                                                <span>
                                                    Grade: {submission.totalPoints} / {assignment?.totalPoints}
                                                </span>
                                            </div>
                                            {submission.submissionCodes && submission.submissionCodes.length > 0 && (
                                                <div className="space-y-1">
                                                    <p className="text-xs font-medium">Files:</p>
                                                    {submission.submissionCodes.map((code, index) => (
                                                        <div key={index} className="flex items-center gap-1 text-xs">
                                                            <FileIcon className="h-3 w-3" />
                                                            <span className="truncate">{code.fileName}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="mt-3 flex flex-col gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate({ to: `/admin/submissions/$submissionId`, params: { submissionId: submission.id } })}
                                                    className="w-full"
                                                >

                                                    <Eye className="h-4 w-4" />
                                                    <span >View details</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        uploadTargetStudentIdRef.current = submission.studentId;
                                                        uploadTargetStudentNimRef.current = submission.student?.nim || null;
                                                        studentFileInputRef.current?.click();
                                                    }}
                                                    className="w-full"
                                                >
                                                    <UploadCloud className="mr-2 h-3 w-3" />
                                                    <span>
                                                        Replace Files
                                                    </span>
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Pending Submissions */}
                {pendingSubmissions.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">
                            Pending Submissions ({pendingSubmissions.length})
                            {!allStudentsAssigned && (
                                <span className="ml-2 text-sm text-yellow-500 font-normal">
                                    - Some require student assignment
                                </span>
                            )}
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pendingSubmissions.map((submission) => {
                                const student = students.find(s => s.id === submission.studentId);
                                const studentName = student?.firstName || `Student ${submission.studentId}`;

                                return (
                                    <Card key={submission.key} className={`${submission.requiresSelection ? 'border-yellow-500' : 'border-green-500'}`}>
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    {submission.type === 'zip' ? (
                                                        <FileArchive className="h-4 w-4" />
                                                    ) : (
                                                        <FileIcon className="h-4 w-4" />
                                                    )}
                                                    <span className="font-medium text-sm truncate">
                                                        {submission.originalFileName}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removePendingSubmission(submission.key)}
                                                    className="h-8 w-8"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>

                                            {submission.requiresSelection ? (
                                                <div className="space-y-2">
                                                    <p className="text-xs text-yellow-500 font-medium">
                                                        Select student:
                                                    </p>
                                                    <select
                                                        onChange={(e) => handleStudentSelect(submission.key, e.target.value)}
                                                        className="w-full bg-background border border-input rounded px-2 py-1 text-xs"
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>Choose student...</option>
                                                        {students.map(student => (
                                                            <option key={student.id} value={student.id}>
                                                                {`${student?.firstName} ${student?.lastName}`} ({student.nim})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-3 w-3 text-green-500" />
                                                        <span className="text-xs font-medium text-green-500">
                                                            {studentName}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        NIM: {submission.nim}
                                                    </p>
                                                </div>
                                            )}

                                            {submission.files.length > 0 && (
                                                <div className="mt-3 space-y-1">
                                                    <p className="text-xs font-medium">Files ({submission.files.length}):</p>
                                                    {submission.files.map((file, index) => (
                                                        <div key={index} className="flex items-center gap-1 text-xs">
                                                            <FileIcon className="h-3 w-3" />
                                                            <span className="truncate">{file.fileName}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Students without submissions */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Students Without Submissions</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {students
                            .filter(student => !submissions.some(sub => sub.studentId === student.id))
                            .map(student => (
                                <Card key={student.id}>
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium text-sm">{`${student?.firstName} ${student?.lastName}`}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-3">
                                            NIM: {student.nim}
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleUploadClick(student.id, student.nim)}
                                            className="w-full"
                                        >
                                            <UploadCloud className="mr-2 h-3 w-3" />
                                            Upload Files
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8 pt-8 border-t flex justify-end">
                    <Button
                        size="default"
                        onClick={handleBulkSubmit}
                        disabled={
                            isProcessing ||
                            pendingSubmissions.length === 0 ||
                            !allStudentsAssigned ||
                            isCreateSubmissionLoading
                        }
                    >
                        {isCreateSubmissionLoading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <CheckCircle className="mr-2 h-5 w-5" />
                        )}
                        {isCreateSubmissionLoading
                            ? 'Submitting...'
                            : `Submit All (${pendingSubmissions.filter(s => !s.requiresSelection).length})`
                        }
                    </Button>
                </div>

                {/* Loading Overlay */}
                {(isLoadingSubmissions || isProcessing) && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-card p-6 rounded-lg flex items-center gap-3">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>
                                {isLoadingSubmissions ? 'Loading submissions...' : 'Processing files...'}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};