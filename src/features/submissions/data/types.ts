import type { Assignment } from "@/features/assignments/data/types";
import type { User } from "@/features/users/data/types";

export type Submission = {
    id: string;
    assignment: Assignment;
    student: User;
    code: string;
    createdAt: string;
    updatedAt: string;
};
