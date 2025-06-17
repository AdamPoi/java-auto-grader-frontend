import type { Assignment } from "@/features/assignments/data/types";
import type { GradeExecution } from "@/features/rubrics/data/types";
import type { User } from "@/features/users/data/types";

export interface Submission {
    id: string;
    submissionTime?: string;
    attemptNumber: number;
    status: string;
    graderFeedback?: string;
    gradingStartedAt?: string;
    gradingCompletedAt?: string;
    assignmentId: string;
    studentId: string;
    assignment?: Assignment;
    gradeExecutions?: GradeExecution[];
    submissionCodes?: SubmissionCode[];
    student?: User;
}

export interface SubmissionCode {
    id: string;
    fileName: string;
    sourceCode: string;
    packagePath?: string;
    className?: string;
    submissionId: string;
    submission?: Submission;
    createdAt?: string;
    updatedAt?: string;
}

export type SubmissionForm = Omit<Submission, 'id' | 'assignment' | 'gradeExecutions' | 'submissionCodes' | 'student'>;

export type SubmissionCodeForm = Omit<SubmissionCode, 'id' | 'submission' | 'createdAt' | 'updatedAt'>;