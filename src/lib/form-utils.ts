import { type FieldValues, type UseFormSetError } from 'react-hook-form';

interface FieldError {
    field: keyof FieldValues;
    message: string;
    rejectedValue?: any;
}


export function handleServerErrors<TFieldValues extends FieldValues>(
    error: any,
    setError: UseFormSetError<TFieldValues>
) {
    const serverError = error as any;
    if (serverError.response?.data?.error?.fieldErrors) {
        serverError.response.data.error.fieldErrors.forEach((fieldError: FieldError) => {
            setError(fieldError.field as any, {
                type: 'server',
                message: fieldError.message,
            });
        });
    }
}
