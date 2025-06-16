import { courseSchema } from "@/features/courses/data/schema";
import { userSchema } from "@/features/users/data/schema";
import { z } from "zod";
import type { Assignment, AssignmentForm } from "./types";

export const baseAssignmentSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    instructions: z.string().optional(),
    dueDate: z.string().datetime().optional(),
    isPublished: z.boolean().optional(),
    starterCode: z.string().optional(),
    solutionCode: z.string().optional(),
    maxAttempts: z.number().int().positive().optional(),
    timeLimit: z.number().int().positive().optional(), // in seconds
    totalPoints: z.coerce.number().positive("Total points must be positive"),
    createdByTeacher: userSchema.optional(),

    // rubrics: z.array(RubricSchema).optional(),
    // assignmentSubmissions: z.array(SubmissionSchema).optional(),

    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
});

export const assignmentSchema: z.ZodType<Assignment> = baseAssignmentSchema.extend({
    course: z.lazy(() => courseSchema).optional(),
});

export const assignmentFormSchema = baseAssignmentSchema.omit({
    createdAt: true,
    updatedAt: true,
    createdByTeacher: true,
}).extend({
    teacherId: z.string().optional(),
    courseId: z.string().optional(),
}) satisfies z.ZodType<AssignmentForm>;
