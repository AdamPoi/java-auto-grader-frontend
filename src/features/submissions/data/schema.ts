import { assignmentSchema } from "@/features/assignments/data/schema";
import { gradeExecutionSchema } from "@/features/rubrics/data/schema";
import { userSchema } from "@/features/users/data/schema";
import { z } from "zod";
import type { Submission, SubmissionCode, SubmissionCodeForm, SubmissionForm } from "./types";

export const baseSubmissionSchema = z.object({
    id: z.string(),
    submissionTime: z.string().datetime({ offset: true }).optional(),
    attemptNumber: z.number().int(),
    status: z.string().min(3).max(255),
    graderFeedback: z.string().optional(),
    gradingStartedAt: z.string().datetime({ offset: true }).optional(),
    gradingCompletedAt: z.string().datetime({ offset: true }).optional(),
    assignmentId: z.string(),
    studentId: z.string(),
});

export const baseSubmissionCodeSchema = z.object({
    id: z.string(),
    fileName: z.string().min(3).max(255),
    sourceCode: z.string().max(5000),
    packagePath: z.string().optional(),
    className: z.string().optional(),
    submissionId: z.string(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
});

export const submissionCodeSchema: z.ZodType<SubmissionCode> = baseSubmissionCodeSchema.extend({
    submission: z.lazy(() => submissionSchema).optional(),
});

export const submissionSchema: z.ZodType<Submission> = baseSubmissionSchema.extend({
    assignment: z.lazy(() => assignmentSchema).optional(),
    gradeExecutions: z.lazy(() => z.array(gradeExecutionSchema)).optional(),
    submissionCodes: z.lazy(() => z.array(submissionCodeSchema)).optional(),
    student: userSchema.optional(),
});

export const submissionFormSchema = baseSubmissionSchema.omit({
    id: true,
}) satisfies z.ZodType<SubmissionForm>;

export const submissionCodeFormSchema = baseSubmissionCodeSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}) satisfies z.ZodType<SubmissionCodeForm>;