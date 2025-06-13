import { useCallback, useEffect, useState } from 'react';
import { type FileData } from './useFileManagement';

declare global {
    interface Window {
        monaco: any;
    }
}

export interface MonacoEditorError {
    startLineNumber: number;
    endLineNumber: number;
    startColumn: number;
    endColumn: number;
    message: string;
    severity: any; // Monaco.MarkerSeverity
}

export interface CodeIntelMember {
    name: string;
    signature: string;
    ownerClass: string;
    isStatic: boolean;
    isMethod: boolean;
    isConstructor: boolean;
}

export interface CodeIntelData {
    classes: {
        [key: string]: {
            methods: CodeIntelMember[];
            fields: CodeIntelMember[];
            extends: string | null;
        };
    };
    scope: {
        [key: string]: string; // variableName: type
    };
    getMembers: (className: string) => CodeIntelMember[];
}

interface UseCodeIntelReturn {
    intel: CodeIntelData | null;
    errors: MonacoEditorError[];
    validateFile: (file: FileData | undefined) => void;
}

function useCodeIntel(files: FileData[]): UseCodeIntelReturn {
    const [intel, setIntel] = useState<CodeIntelData | null>(null);
    const [errors, setErrors] = useState<MonacoEditorError[]>([]);

    useEffect(() => {
        const classes: CodeIntelData['classes'] = {};
        const classNames = files.map(f => f.fileName.replace('.java', ''));

        files.forEach(file => {
            const classNameMatch = file.content.match(/class\s+(\w+)(?:\s+extends\s+(\w+))?/);
            if (!classNameMatch) return;

            const className = classNameMatch[1];
            const extendsClass = classNameMatch[2] || null;
            classes[className] = { methods: [], fields: [], extends: extendsClass };

            const memberRegex = /(?:public|protected|private)\s+(static\s+)?([\w<>\[\]]+)\s+([a-zA-Z0-9_]+)\s*(?:\((.*?)\))?[\s{;=]|(public\s+([a-zA-Z0-9_]+)\s*\((.*?)\))/g;
            let match: RegExpExecArray | null;
            while ((match = memberRegex.exec(file.content)) !== null) {
                if (match[5]) { // Constructor
                    classes[className].methods.push({ name: match[6], signature: `${match[6]}(${match[7]})`, ownerClass: className, isStatic: false, isMethod: true, isConstructor: true });
                }
                else { // Method or Field
                    const isStatic = !!match[1];
                    const type = match[2];
                    const name = match[3];
                    const params = match[4];

                    if (params !== undefined && type !== 'class' && type !== 'interface') { // Method
                        classes[className].methods.push({ name, signature: `${type} ${name}(${params})`, ownerClass: className, isStatic, isMethod: true, isConstructor: false });
                    }
                    else if (type !== 'class' && type !== 'interface') { // Field
                        classes[className].fields.push({ name, signature: `${type} ${name}`, ownerClass: className, isStatic, isMethod: false, isConstructor: false });
                    }
                }
            }
        });

        const scope: CodeIntelData['scope'] = {};
        const varRegex = new RegExp(`(?:^|\\s)(${classNames.join('|')}|Scanner|String|int|double|boolean)\\s+([a-zA-Z0-9_]+)\\s*(?:=|;)`, 'g');
        files.forEach(file => {
            let match: RegExpExecArray | null;
            while ((match = varRegex.exec(file.content)) !== null) {
                scope[match[2]] = match[1];
            }
        });

        setIntel({
            classes,
            scope,
            getMembers: (className: string) => {
                let members: CodeIntelMember[] = [];
                let currentClass: typeof classes[string] | undefined = classes[className];
                let handled = new Set<string>();

                while (currentClass) {
                    [...currentClass.methods, ...currentClass.fields].forEach(m => {
                        if (!handled.has(m.name)) {
                            members.push(m);
                            handled.add(m.name);
                        }
                    });
                    currentClass = currentClass.extends ? classes[currentClass.extends] : undefined;
                }
                return members;
            }
        });
    }, [files]);

    const validateFile = useCallback((file: FileData | undefined) => {
        if (!file || !window.monaco) return [];
        const currentErrors: MonacoEditorError[] = [];
        const lines = file.content.split('\n');
        let openBraces = 0;

        lines.forEach((line, i) => {
            const trimmedLine = line.trim();
            // Basic missing semicolon check
            if (trimmedLine.length > 0 && !trimmedLine.endsWith(';') && !trimmedLine.endsWith('{') && !trimmedLine.endsWith('}') && !trimmedLine.startsWith('/') && !trimmedLine.startsWith('@') && !trimmedLine.startsWith('import')) {
                if (trimmedLine.match(/(\w+\.\w+\(.*\)|new\s\w+\(.*\)|(int|String|boolean|double|Dog|Animal|Cat)\s\w+ = .*)/)) {
                    currentErrors.push({
                        startLineNumber: i + 1,
                        endLineNumber: i + 1,
                        startColumn: line.length + 1,
                        endColumn: line.length + 2,
                        message: "`;` expected",
                        severity: window.monaco.MarkerSeverity.Error
                    });
                }
            }
            // Brace matching
            for (const char of line) {
                if (char === '{') openBraces++;
                if (char === '}') openBraces--;
            }
        });

        if (openBraces !== 0) {
            currentErrors.push({
                startLineNumber: 1,
                endLineNumber: lines.length,
                startColumn: 1,
                endColumn: 1,
                message: "Mismatched braces in file.",
                severity: window.monaco.MarkerSeverity.Error
            });
        }
        setErrors(currentErrors);
    }, []);

    return { intel, errors, validateFile };
}

export default useCodeIntel;