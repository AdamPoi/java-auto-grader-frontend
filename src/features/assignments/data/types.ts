import type { JavaFile } from "@/features/code-editor/data/types";
import type { Rubric, RubricGrade } from "@/features/rubrics/data/types";
import type { Submission } from "@/features/submissions/data/types";
import type { User } from "@/features/users/data/types";
import type { Course } from './../../courses/data/types';


export interface Assignment {
    id: string;
    title: string;
    description?: string;
    resource?: string;
    dueDate?: string;
    isPublished?: boolean;
    starterCode?: string;
    solutionCode?: string;
    testCode?: string;
    timeLimit?: number; // in seconds
    totalPoints: number;
    options?: AssignmentOptions

    createdByTeacher?: User;

    course?: Course;
    rubrics?: Rubric[];
    rubricGrades?: RubricGrade[];

    submissions?: Submission[];

    createdAt?: string;
    updatedAt?: string;
}

export type AssignmentForm = Assignment & {
    courseId?: string;
    teacherId?: string;
};


export type BulkAssignmentSubmission = {
    nimToCodeFiles: Record<string, JavaFile[]>;
    testFiles: JavaFile[];
    mainClassName: string;
    buildTool: string;
};

export interface AssignmentOptions {
    isTimed?: boolean;           // Timed or untimed assessment
    isPublished?: boolean;       // Is the assignment published
    timeLimit?: number;          // Time limit in seconds (if timed)
    maxAttempts?: number;        // Max number of student submissions (0 = unlimited, 1 = only one try)
    showTrySubmission?: boolean; // Show student their submissions/results (practice mode)
    showFeedback?: boolean;      // Show feedback after submit (test results, grading)
    showSolution?: boolean;      // Show solution after submit (if available)
    allowUpload?: boolean;       // Allow student to upload their own code
}