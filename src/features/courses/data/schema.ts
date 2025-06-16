import { assignmentSchema } from '@/features/assignments/data/schema';
import { userSchema } from '@/features/users/data/schema';
import { z } from 'zod';
import type { Course, CourseForm } from './types';

export const baseCourseSchema = z.object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
    teacher: userSchema.optional(),
    students: z.array(userSchema).optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});

export const courseSchema: z.ZodType<Course> = baseCourseSchema.extend({
    courseAssignments: z.lazy(() => z.array(assignmentSchema)).optional(),
});

export const courseFormSchema = baseCourseSchema.omit({
    createdAt: true,
    updatedAt: true,
    teacher: true,
    students: true,
}).extend({
    teacherId: z.string().optional(),
    studentIds: z.array(z.string()).optional(),
}) satisfies z.ZodType<CourseForm>;
