import type { FileData } from "@/features/code-editor/hooks/use-file-management";

export const joinWithSpace = (...args: string[]) => args.filter(Boolean).join(' ');

export const areFilesEqual = (a: FileData[] | undefined, b: FileData[] | undefined): boolean => {
    if (a === b) return true;
    if (!a || !b || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i].fileName !== b[i].fileName || a[i].content !== b[i].content) {
            return false;
        }
    }
    return true;
};
