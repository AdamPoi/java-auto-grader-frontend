import type { Assignment } from "@/features/assignments/data/types";
import type { User } from "@/features/users/data/types";



export interface Course {
    id: string;
    code: string;
    name: string;
    description?: string;
    isActive?: boolean;
    teacher?: User;
    students?: User[];
    assignments?: Assignment[];
    createdAt?: string;
    updatedAt?: string;
}


export type CourseForm = Course & {
    teacherId?: string;
    studentIds?: string[];
    assignmentIds?: string[];
};








