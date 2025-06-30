import { assignmentSchema } from "@/features/assignments/data/schema";
import { testExecutionSchema } from "@/features/rubrics/data/schema";
import { userSchema } from "@/features/users/data/schema";
import { z } from "zod";
import type { Submission, SubmissionCode, SubmissionCodeForm, SubmissionForm } from "./types";

export const submissionTypeEnum = z.enum(["TRYOUT", "ATTEMPT", "FINAL"]);
export const submissionStatusEnum = z.enum([
    "IN_PROGRESS", "SUBMITTED", "COMPLETED", "FAILED", "TIMEOUT"
]);

export const baseSubmissionSchema = z.object({
    id: z.string(),
    executionTime: z.string().optional(),
    status: submissionStatusEnum,
    type: submissionTypeEnum,
    totalPoints: z.number(),
    feedback: z.string().optional(),
    startedAt: z.string().optional(),
    completedAt: z.string().optional(),
    assignmentId: z.string(),
    studentId: z.string().optional(),
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
    testExecutions: z.lazy(() => z.array(testExecutionSchema)).optional(),
    submissionCodes: z.lazy(() => z.array(submissionCodeSchema)).optional(),
    student: userSchema.optional(),
});

export const submissionFormSchema = baseSubmissionSchema.omit({
    id: true,
}).extend({
    submissionCodes: z.array(z.lazy(() => submissionCodeFormSchema)),
}) satisfies z.ZodType<SubmissionForm>;

export const submissionCodeFormSchema = baseSubmissionCodeSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}) satisfies z.ZodType<SubmissionCodeForm>;