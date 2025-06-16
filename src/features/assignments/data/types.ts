import type { User } from "@/features/users/data/types";
import type { Course } from './../../courses/data/types';


export interface Assignment {
    id: string;
    title: string;
    description?: string;
    instructions?: string;
    dueDate?: string;
    isPublished?: boolean;
    starterCode?: string;
    solutionCode?: string;
    maxAttempts?: number;
    timeLimit?: number; // in seconds
    totalPoints: number;
    course?: Course;

    createdByTeacher?: User;

    // rubrics: Rubric[]; 
    // assignmentSubmissions?: Submission[]; 

    createdAt?: string;
    updatedAt?: string;
}

export type AssignmentForm = Assignment & {
    courseId?: string;
    teacherId?: string;
};

