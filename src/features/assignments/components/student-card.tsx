import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    User,
    UserCheck,
    FileIcon,
    FileArchive,
    Trash2,
    UploadCloud,
    Loader2
} from 'lucide-react';
import React from 'react';
import type { FileData } from '@/features/code-editor/hooks/use-file-management';

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    nim: string;
}

interface StudentCardProps {
    student?: Student;
    isExisting?: boolean;
    hasSubmission?: boolean;
    files?: FileData[] | Array<{ fileName: string; sourceCode?: string; content?: string }>;
    originalFileName?: string;
    requiresSelection?: boolean;
    students?: Student[];
    onStudentSelect?: (studentId: string) => void;
    onUpload?: () => void;
    onDelete?: () => void;
    onRemove?: () => void;
    isLoading?: boolean;
    type?: 'zip' | 'java';
    className?: string;
}

export const StudentCard: React.FC<StudentCardProps> = ({
    student,
    isExisting = false,
    hasSubmission = false,
    files = [],
    originalFileName,
    requiresSelection = false,
    students = [],
    onStudentSelect,
    onUpload,
    onDelete,
    onRemove,
    isLoading = false,
    type = 'java',
    className
}) => {
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
    const fileList = files.map(file => ({
        fileName: file.fileName,
        content: 'sourceCode' in file ? file.sourceCode : file.content
    }));

    const getCardVariant = () => {
        if (isExisting) return 'default';
        if (requiresSelection) return 'warning';
        return 'success';
    };

    const getBorderColor = () => {
        if (isExisting) return '';
        if (requiresSelection) return 'border-yellow-500/50';
        return 'border-green-500/50';
    };

    return (
        <Card className={`${getBorderColor()} ${className} transition-all hover:shadow-md`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        {hasSubmission ? (
                            <UserCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                        ) : (
                            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}

                        <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">
                                {originalFileName || studentName}
                            </p>
                            {student?.nim && (
                                <p className="text-xs text-muted-foreground">
                                    NIM: {student.nim}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {!isExisting && type && (
                            <Badge variant="outline" className="text-xs">
                                {type === 'zip' ? (
                                    <FileArchive className="h-3 w-3 mr-1" />
                                ) : (
                                    <FileIcon className="h-3 w-3 mr-1" />
                                )}
                                {type.toUpperCase()}
                            </Badge>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                if (isExisting) onDelete?.();
                                else onRemove?.();
                            }}
                            disabled={isLoading}
                            className="h-8 w-8"
                        >
                            {isLoading ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <Trash2 className="h-3 w-3" />
                            )}
                        </Button>
                    </div>
                </div>

                {requiresSelection && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50 w-fit">
                        Requires Assignment
                    </Badge>
                )}
            </CardHeader>

            <CardContent className="pt-0">
                {requiresSelection ? (
                    <div className="space-y-3">
                        <Select onValueChange={onStudentSelect}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select student..." />
                            </SelectTrigger>
                            <SelectContent>
                                {students.map(student => (
                                    <SelectItem key={student.id} value={student.id}>
                                        {`${student.firstName} ${student.lastName}`} ({student.nim})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                ) : student ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-green-600 bg-green-50">
                                Assigned
                            </Badge>
                        </div>
                    </div>
                ) : null}

                {fileList.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-muted-foreground">
                                Files ({fileList.length})
                            </p>
                        </div>
                        <div className="space-y-1 max-h-20 overflow-y-auto">
                            {fileList.map((file, index) => (
                                <div key={index} className="flex items-center gap-2 p-1 rounded bg-muted/50">
                                    <FileIcon className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs truncate flex-1">{file.fileName}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {onUpload && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onUpload}
                        className="w-full mt-4"
                        disabled={isLoading}
                    >
                        <UploadCloud className="mr-2 h-3 w-3" />
                        {isExisting ? 'Replace Files' : 'Upload Files'}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};