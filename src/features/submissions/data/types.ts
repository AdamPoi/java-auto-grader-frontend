import type { Assignment } from "@/features/assignments/data/types";
import type { GradeExecution } from "@/features/rubrics/data/types";
import type { User } from "@/features/users/data/types";

export interface Submission {
    id: string;
    executionTime?: string;
    status: string;
    feedback?: string;
    startedAt?: string;
    completedAt?: string;
    assignmentId: string;
    studentId?: string;
    assignment?: Assignment;
    gradeExecutions?: GradeExecution[];
    submissionCodes?: SubmissionCode[];
    student?: User;
}

export interface SubmissionCode {
    id: string;
    fileName: string;
    sourceCode: string;
    className?: string;
    submissionId?: string;
    submission?: Submission;
    createdAt?: string;
    updatedAt?: string;
}

export type SubmissionForm = Omit<Submission, 'id' | 'assignment' | 'submissionCodes' | 'gradeExecutions' | 'student'> & {
    submissionCodes: SubmissionCodeForm[];

};

export type SubmissionCodeForm = Omit<SubmissionCode, 'id' | 'submission' | 'createdAt' | 'updatedAt'>;