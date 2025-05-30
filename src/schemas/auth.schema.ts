import { z } from "@/i18n/en-zod";
import { passwordSchema, emailSchema, nameSchema } from "./validation.schema";
import { type LoginRequest } from "@/types/auth.types";
import { createZodObject } from "@/utils/schema";

export const loginSchema = createZodObject<LoginRequest>({
    email: emailSchema,
    password: passwordSchema,
})

export const registerSchema = z
    .object({
        fullName: nameSchema,
        email: emailSchema,
        password: passwordSchema,
    })
