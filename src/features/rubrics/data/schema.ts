import { assignmentSchema } from "@/features/assignments/data/schema";
import { submissionSchema } from "@/features/submissions/data/schema";
import { z } from "zod";
import type { GradeExecution, GradeExecutionForm, Rubric, RubricForm, RubricGrade, RubricGradeForm } from "./types";

const gradeTypeSchema = z.enum(["AUTOMATIC", "MANUAL", "HYBRID"]);

const executionStatusSchema = z.enum(["PENDING", "RUNNING", "PASSED", "FAILED", "ERROR", "TIMEOUT", "SKIPPED"]);

export const baseRubricSchema = z.object({
    id: z.string(),
    name: z.string().min(3).max(255),
    description: z.string().optional(),
    maxPoints: z.coerce.number().positive(),
    displayOrder: z.coerce.number().int().optional(),
    isActive: z.boolean().optional().default(true),
    assignmentId: z.string(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
});

export const baseRubricGradeSchema = z.object({
    id: z.string(),
    name: z.string().min(3).max(255),
    description: z.string().optional(),
    points: z.coerce.number(),
    displayOrder: z.coerce.number().int().optional(),
    code: z.string().optional(),
    arguments: z.record(z.any()).optional(),
    gradeType: gradeTypeSchema,
    rubricId: z.string(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
});

export const baseGradeExecutionSchema = z.object({
    id: z.string(),
    pointsAwarded: z.coerce.number().optional(),
    status: executionStatusSchema,
    actual: z.string().optional(),
    expected: z.string().optional(),
    error: z.string().optional(),
    executionTime: z.number().int().optional(),
    rubricGradeId: z.string(),
    submissionId: z.string(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
});

export const rubricGradeSchema: z.ZodType<RubricGrade> = baseRubricGradeSchema.extend({
    rubric: z.lazy(() => rubricSchema).optional(),
    gradeExecutions: z.lazy(() => z.array(gradeExecutionSchema)).optional(),
});

export const gradeExecutionSchema: z.ZodType<GradeExecution> = baseGradeExecutionSchema.extend({
    rubricGrade: z.lazy(() => rubricGradeSchema).optional(),
    submission: z.lazy(() => submissionSchema).optional(),
});


export const rubricSchema: z.ZodType<Rubric> = baseRubricSchema.extend({
    assignment: z.lazy(() => assignmentSchema).optional(),
    rubricGrades: z.lazy(() => z.array(rubricGradeSchema)).optional(),
});

export const rubricFormSchema = baseRubricSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    assignmentId: z.string(),
}) satisfies z.ZodType<RubricForm>;

export const rubricGradeFormSchema = baseRubricGradeSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}) satisfies z.ZodType<RubricGradeForm>;

export const gradeExecutionFormSchema = baseGradeExecutionSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}) satisfies z.ZodType<GradeExecutionForm>;

