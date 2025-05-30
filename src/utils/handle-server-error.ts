import { showToast, TOAST_SEVERITY } from "@/providers/reactQueryProviders";

export interface CustomError extends Error {
  status?: number;
}

export const errorNotification = (isError: boolean, title: string, error: CustomError | null = null) => {
  if (isError && error) {
    showToast(TOAST_SEVERITY.ERROR, `${error.status}: ${title}`, error.message, 5000);
  }
};