import { z } from 'zod';

export const permissionSchema = z.object({
    id: z.string(),
    name: z.string(),
});

export const roleSchema = z.object({
    id: z.string(),
    name: z.string().min(1, { message: 'Role name is required' }),
    permissions: z.array(permissionSchema),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});


export const roleFormSchema = roleSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type Role = z.infer<typeof roleSchema>;
export type Permission = z.infer<typeof permissionSchema>;
export type RoleForm = z.infer<typeof roleFormSchema>;
