import type { Assignment } from "@/features/assignments/data/types";
import type { CompilationError, JavaFile } from "@/features/code-editor/data/types";
import type { RubricGrade } from "@/features/rubrics/data/types";
import type { User } from "@/features/users/data/types";


export type SubmissionType = "TRYOUT" | "ATTEMPT" | "FINAL";
export type SubmissionStatus = "IN_PROGRESS" | "SUBMITTED" | "COMPLETED" | "FAILED" | "TIMEOUT";
export type ExecutionStatus = "PENDING" | "RUNNING" | "PASSED" | "FAILED" | "TIMEOUT" | "SKIPPED";

export interface Submission {
    id: string;
    executionTime?: string;
    status: SubmissionStatus;
    type: SubmissionType;
    totalPoints: number;
    feedback?: string;
    startedAt?: string;
    completedAt?: string;
    assignmentId: string;
    studentId?: string;
    assignment?: Assignment;
    testExecutions?: TestExecution[];
    submissionCodes?: SubmissionCode[];
    compilationErrors?: CompilationError[];
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

export interface TestExecution {
    id: string;
    methodName?: string;
    status: ExecutionStatus;
    output?: string;
    error?: string;
    executionTime?: number;

    rubricGradeId: string;
    submissionId: string;
    // assignmentId: string;

    rubricGrade?: RubricGrade;
    submission?: Submission;

    // testCodeRequest: TestJavaProject

    createdAt?: string;
    updatedAt?: string;
}

export type SubmissionForm = Omit<Submission, 'id' | 'assignment' | 'submissionCodes' | 'testExecutions' | 'student'> & {
    submissionCodes: SubmissionCodeForm[];
};

export type TestSubmitRequest = {
    assignmentId: string;
    userId?: string;
    submissionId?: string;
    sourceFiles: JavaFile[];
    testFiles: JavaFile[];
    testClassNames?: string[];
    buildTool?: string;
    mainClassName?: string;
}

export type AiSubmissionFeedback = {
    sourceFiles: JavaFile[];
    executionTime: number;
};

export type SubmissionCodeForm = Omit<SubmissionCode, 'id' | 'submission' | 'createdAt' | 'updatedAt'>;

export type TestExecutionForm = Omit<TestExecution, 'id' | 'submission' | 'rubricGrad' | 'createdAt' | 'updatedAt'>;