import { z } from "zod";

export type TypeToZod<T> = {
    [K in keyof T]:
    // 1. Handle Arrays (including arrays of objects, optional or required)
    T[K] extends ReadonlyArray<infer E> | undefined
    ? undefined extends T[K]
    ? E extends object
    ? z.ZodOptional<z.ZodArray<z.ZodObject<TypeToZod<E>>>>
    : z.ZodOptional<z.ZodArray<z.ZodType<Exclude<E, null | undefined>>>>
    : E extends object
    ? z.ZodArray<z.ZodObject<TypeToZod<E>>>
    : z.ZodArray<z.ZodType<Exclude<E, null | undefined>>>
    // 2. Handle Primitives
    : T[K] extends string | number | boolean | Date | null | undefined
    ? undefined extends T[K]
    ? z.ZodOptional<z.ZodType<Exclude<T[K], undefined | null>>>
    : z.ZodType<T[K]>
    // 3. Handle Objects (required or optional, but not arrays)
    : T[K] extends object | undefined
    ? undefined extends T[K]
    ? z.ZodOptional<z.ZodObject<TypeToZod<NonNullable<T[K]>>>>
    : T[K] extends object
    ? z.ZodObject<TypeToZod<T[K]>>
    : z.ZodUnknown // Fallback for unexpected required non-object/non-primitive types
    // 4. Fallback for any other types
    : z.ZodUnknown;
};
export const createZodObject = <T>(obj: TypeToZod<T>) => {
    return z.object(obj);
};