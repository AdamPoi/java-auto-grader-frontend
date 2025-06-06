import { z } from 'zod';

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

export const userRoleSchema = z.array(z.union([
  z.literal('admin'),
  z.literal('student'),
  z.literal('teacher'),
]))

export const userSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, { message: 'First Name is required.' }),
  lastName: z.string().min(1, { message: 'Last Name is required.' }),
  email: z
    .string()
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Email is invalid.' }),
  password: z.string().transform((pwd) => pwd.trim()),
  confirmPassword: z.string().transform((pwd) => pwd.trim()),
  roles: userRoleSchema.default(['student']),
  permissions: z.array(z.string()).nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.coerce.date().nullish(),
  updatedAt: z.coerce.date().nullish(),
})

export type User = z.infer<typeof userSchema>
export type UserRole = z.infer<typeof userRoleSchema>

export const userFormSchema = z.object({
  firstName: z.string().min(1, { message: 'First Name is required.' }),
  lastName: z.string().min(1, { message: 'Last Name is required.' }),
  email: z
    .string()
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Email is invalid.' }),
  password: z.string().transform((pwd) => pwd.trim()),
  confirmPassword: z.string().transform((pwd) => pwd.trim()),
  roles: userRoleSchema,
  permissions: z.array(z.string()).nullable().optional(),
  isActive: z.boolean(),
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
  }
});

export type UserFormValues = z.infer<typeof userFormSchema>;
