import type { User } from "@/features/users/data/types";

export type Classroom = {
    id: string;
    name: string;
    teacher?: User;
    students?: User[];
    isActive: boolean
};


export type ClassroomForm = Classroom & {
    teacherId?: string;
    studentIds?: string[];
};








