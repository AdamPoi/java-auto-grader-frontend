import { z } from "@/i18n/en-zod";
import { passwordSchema, emailSchema, nameSchema } from "./validation.schema";

export const loginSchema = z
    .object({
        email: emailSchema,
        password: passwordSchema,
    })

export const registerSchema = z
    .object({
        fullName: nameSchema,
        email: emailSchema,
        password: passwordSchema,
    })

export type LoginSchema = z.infer<typeof loginSchema>
export type RegisterSchema = z.infer<typeof registerSchema>

