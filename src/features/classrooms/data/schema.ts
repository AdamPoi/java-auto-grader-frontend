import { UserSchema } from '@/features/users/data/schema';
import { z } from 'zod';
import type { Classroom, ClassroomForm } from './types';


export const classroomSchema = z.object({
    id: z.string(),
    name: z.string().min(1, { message: 'Classroom name is required' }),
    teacher: UserSchema.optional(),
    students: z.array(UserSchema).optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    isActive: z.boolean({ message: 'Classroom isActive is required' })
}) satisfies z.ZodType<Classroom>;

export const classroomFormSchema = classroomSchema.omit({ createdAt: true, updatedAt: true, teacher: true, students: true }).extend({
    teacherId: z.string().optional(),
    studentIds: z.array(z.string()).optional(),
}) satisfies z.ZodType<ClassroomForm>;
