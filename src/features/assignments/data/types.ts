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
    course?: Course;

    createdByTeacher?: User;

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

