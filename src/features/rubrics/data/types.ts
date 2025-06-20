import type { Assignment } from "@/features/assignments/data/types";
import type { Submission } from "@/features/submissions/data/types";

export type GradeType = "AUTOMATIC" | "MANUAL" | "HYBRID";

export type ExecutionStatus = "PENDING" | "RUNNING" | "PASSED" | "FAILED" | "ERROR" | "TIMEOUT" | "SKIPPED";

export interface Rubric {
    id: string;
    name: string;
    description?: string;
    points: number;
    assignmentId: string;
    assignment?: Assignment;
    rubricGrades?: RubricGrade[];
    createdAt?: string;
    updatedAt?: string;
}

export interface RubricGrade {
    id: string;
    name: string;
    description?: string;
    displayOrder?: number;
    arguments?: Record<string, any>;
    gradeType: GradeType;
    rubricId: string;
    rubric?: Rubric;
    assignment?: Assignment;
    assignmentId: string;
    gradeExecutions?: GradeExecution[];
    createdAt?: string;
    updatedAt?: string;
}

export interface GradeExecution {
    id: string;
    pointsAwarded?: number;
    status: ExecutionStatus;
    actual?: string;
    expected?: string;
    error?: string;
    executionTime?: number;
    rubricGradeId: string;
    submissionId: string;
    rubricGrade?: RubricGrade;
    submission?: Submission;
    createdAt?: string;
    updatedAt?: string;
}


export type RubricForm = Omit<Rubric, 'id' | 'assignment' | 'createdAt' | 'updatedAt'> & {
    assignmentId?: string;
};

export type RubricGradeForm = Omit<RubricGrade, 'rubric' | 'gradeExecutions' | 'assignment' | 'createdAt' | 'updatedAt'>;

export type GradeExecutionForm = Omit<GradeExecution, 'id' | 'rubricGrade' | 'submission' | 'createdAt' | 'updatedAt'>;

