import { courseSchema } from "@/features/courses/data/schema";
import { userSchema } from "@/features/users/data/schema";
import { z } from "zod";
import type { Assignment, AssignmentForm } from "./types";

export const assignmentOptionsSchema = z.object({
    isTimed: z.boolean().nullish(),
    timeLimit: z.number().int().positive().nullish(),   // in seconds
    maxAttempts: z.number().int().positive().nullish(),
    showTrySubmission: z.boolean().nullish(),
    showFeedback: z.boolean().nullish(),
    showSolution: z.boolean().nullish(),
    allowUpload: z.boolean().nullish(),
    isPublished: z.boolean().nullish(),
});

export const baseAssignmentSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    instructions: z.string().optional(),
    dueDate: z.string().datetime().optional(),
    starterCode: z.string().nullish(),
    solutionCode: z.string().nullish(),
    totalPoints: z.coerce.number().positive("Total points must be positive"),
    createdByTeacher: userSchema.optional(),
    options: assignmentOptionsSchema.optional(),

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


