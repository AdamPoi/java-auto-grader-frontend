import { z } from 'zod';
import type { User, UserForm, UserStatus } from './types';

const UserStatusSchema: z.ZodType<UserStatus> = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
])

const UserRoleSchema = z.array(z.enum(['admin', 'student', 'teacher']))

export const userSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, { message: 'First Name is required.' }),
  lastName: z.string().min(1, { message: 'Last Name is required.' }),
  email: z
    .string()
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Email is invalid.' }),
  password: z.string().transform((password) => password.trim()),
  roles: UserRoleSchema,
  permissions: z.array(z.string()),
  isActive: z.boolean(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}) satisfies z.ZodType<User>



export const UserFormSchema = userSchema.omit({ id: true, createdAt: true, updatedAt: true }).
  extend({
    confirmPassword: z.string().transform((password) => password.trim()),
  }).superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== '') {
      if (password.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password must be at least 6 characters long.',
          path: ['password'],
        })
      }

      if (!password.match(/[a-z]/)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password must contain at least one lowercase letter.',
          path: ['password'],
        })
      }

      if (!password.match(/\d/)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password must contain at least one number.',
          path: ['password'],
        })
      }

      if (password !== confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Passwords don't match.",
          path: ['confirmPassword'],
        })
      }
    } else {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password is required.",
        path: ['password'],
      })
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must be at least 6 characters long.",
        path: ['password'],
      })
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must contain at least one lowercase letter.",
        path: ['password'],
      })
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must contain at least one number.",
        path: ['password'],
      });
    }
  }) satisfies z.ZodType<UserForm>

