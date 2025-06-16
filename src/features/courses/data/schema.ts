import { assignmentSchema } from '@/features/assignments/data/schema'; // Import assignmentSchema directly
import { userSchema } from '@/features/users/data/schema';
import { z } from 'zod';
import type { Course, CourseForm } from './types';

// Define a base schema for Course without direct recursive dependency
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

// Lazily reference assignmentSchema to resolve circular dependency
export const courseSchema: z.ZodType<Course> = baseCourseSchema.extend({
    courseAssignments: z.lazy(() => z.array(assignmentSchema)).optional(),
});

export const courseFormSchema = baseCourseSchema.omit({
    createdAt: true,
    updatedAt: true,
    teacher: true, // Omit the object, not the boolean
    students: true, // Omit the array, not the boolean
}).extend({
    teacherId: z.string().optional(),
    studentIds: z.array(z.string()).optional(),
}) satisfies z.ZodType<CourseForm>;
