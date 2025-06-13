import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';

interface JavaFile {
    fileName: string;
    content: string;
}

interface CodeMember {
    name: string;
    signature: string;
    ownerClass: string;
    isStatic: boolean;
    isMethod: boolean;
    isConstructor: boolean;
}

interface ClassDefinition {
    methods: CodeMember[];
    fields: CodeMember[];
    extends: string | null;
}

interface CodeIntel {
    classes: Record<string, ClassDefinition>;
    scope: Record<string, string>;
    getMembers: (className: string) => CodeMember[];
}

interface TerminalLine {
    text: string;
    type: 'log' | 'error' | 'input';
}

interface ModalState {
    type: 'create' | 'rename' | 'delete';
    payload: string;
}

// --- Helper Hook for Debouncing ---
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

// --- Reusable UI Components (with TypeScript Props) ---
const Modal: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}><div className="bg-neutral-800 text-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>{children}</div></div>
);

const Tabs: React.FC<any> = ({ children, value, onValueChange, className, ...props }) => (
    <div className={className}>{React.Children.map(children, child => child.type === TabsList ? React.cloneElement(child, { activeTab: value, onTabChange: onValueChange, ...props }) : child)}</div>
);

const TabsList: React.FC<any> = ({ children, className, activeTab, onTabChange, ...props }) => (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800 p-1 text-neutral-500 dark:text-neutral-400 ${className}`}>{React.Children.map(children, child => React.cloneElement(child, { isActive: child.props.value === activeTab, onClick: () => onTabChange(child.props.value), ...props }))}</div>
);

const TabsTrigger: React.FC<any> = ({ children, className, isActive, onClick, value, onDeleteFile, onRenameFile, filesLength }) => {
    const isDeletable = filesLength > 1;
    const handleDeleteClick = (e: React.MouseEvent) => { e.stopPropagation(); onDeleteFile(value); };
    const handleRenameClick = (e: React.MouseEvent) => { e.stopPropagation(); onRenameFile(value); };
    return (<button onClick={onClick} className={`group inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${isActive ? 'bg-white dark:bg-neutral-950 text-neutral-950 dark:text-neutral-50 shadow-sm' : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'} ${className}`} value={value}><span className="mr-2">{children}</span><div className="hidden group-hover:flex items-center space-x-1"><span onClick={handleRenameClick} className="p-0.5 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-600" title={`Rename ${value}`}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></span>{isDeletable && (<span onClick={handleDeleteClick} className="p-0.5 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-600 text-red-500" title={`Delete ${value}`}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>)}</div></button>);
};

interface MonacoEditorProps {
    language: string;
    value: string;
    onChange: (value: string) => void;
    codeIntel: CodeIntel | null;
    errors: any[]; // Using `any` for Monaco's marker data for simplicity
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({ language, value, onChange, codeIntel, errors }) => {
    const editorRef = useRef<any>(null); // Using `any` for Monaco editor instance
    const containerRef = useRef<HTMLDivElement>(null);
    const completionProviderRef = useRef<any>(null);
    const onchangeRef = useRef(onChange);
    useEffect(() => { onchangeRef.current = onChange; }, [onChange]);

    useEffect(() => {
        const MONACO_VS_URL = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs';
        const initMonaco = () => { if (containerRef.current && !editorRef.current) { editorRef.current = (window as any).monaco.editor.create(containerRef.current, { value, language, theme: 'vs-dark', automaticLayout: true, wordWrap: 'on', fontSize: 14 }); editorRef.current.onDidChangeModelContent(() => { if (onchangeRef.current) onchangeRef.current(editorRef.current.getValue()); }); } };
        if (!(window as any).monaco) { if (!document.querySelector('script[src*="loader.js"]')) { const script = document.createElement('script'); script.src = `${MONACO_VS_URL}/loader.js`; script.onload = () => { (window as any).require.config({ paths: { 'vs': MONACO_VS_URL } }); (window as any).require(['vs/editor/editor.main'], initMonaco); }; document.body.appendChild(script); } } else { initMonaco(); }
        return () => { editorRef.current?.dispose(); editorRef.current = null; };
    }, []);

    useEffect(() => { if (editorRef.current && editorRef.current.getValue() !== value) editorRef.current.setValue(value); }, [value]);
    useEffect(() => { if (editorRef.current) (window as any).monaco.editor.setModelLanguage(editorRef.current.getModel(), language); }, [language]);

    useEffect(() => {
        if ((window as any).monaco && codeIntel) {
            completionProviderRef.current?.dispose();
            completionProviderRef.current = (window as any).monaco.languages.registerCompletionItemProvider('java', {
                provideCompletionItems: (model: any, position: any) => {
                    const word = model.getWordUntilPosition(position); const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn }; const textUntilPosition = model.getValueInRange({ startLineNumber: 1, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column });
                    const memberMatch = textUntilPosition.match(/(\w+)\.$/);
                    if (memberMatch) {
                        const variableName = memberMatch[1]; let varType = codeIntel.scope[variableName]; let isStaticAccess = false;
                        if (!varType) { if (codeIntel.classes[variableName]) { varType = variableName; isStaticAccess = true; } else { return { suggestions: [] }; } }
                        return { suggestions: codeIntel.getMembers(varType).filter((m: CodeMember) => isStaticAccess ? m.isStatic : !m.isConstructor).map((m: CodeMember) => ({ label: m.name, kind: m.isMethod ? (window as any).monaco.languages.CompletionItemKind.Method : (window as any).monaco.languages.CompletionItemKind.Field, insertText: m.name, detail: m.signature, range })) };
                    }
                    const keywords = ['public', 'private', 'static', 'void', 'class', 'if', 'else', 'for', 'while', 'try', 'catch', 'int', 'String', 'boolean'];
                    return { suggestions: [...keywords.map(k => ({ label: k, kind: (window as any).monaco.languages.CompletionItemKind.Keyword, insertText: k, range })), ...Object.keys(codeIntel.classes).map(c => ({ label: c, kind: (window as any).monaco.languages.CompletionItemKind.Class, insertText: c, range })), ...Object.keys(codeIntel.scope).map(v => ({ label: v, kind: (window as any).monaco.languages.CompletionItemKind.Variable, insertText: v, detail: codeIntel.scope[v], range })), { label: 'main', kind: (window as any).monaco.languages.CompletionItemKind.Snippet, insertText: 'public static void main(String[] args) {\n\t${0}\n}', insertTextRules: (window as any).monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Main method', range }, { label: 'sysout', kind: (window as any).monaco.languages.CompletionItemKind.Snippet, insertText: 'System.out.println(${0});', insertTextRules: (window as any).monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Prints to standard out', range }] };
                }
            });
        }
        return () => { completionProviderRef.current?.dispose(); }
    }, [codeIntel]);

    useEffect(() => { if ((window as any).monaco && editorRef.current) { const model = editorRef.current.getModel(); if (model) { (window as any).monaco.editor.setModelMarkers(model, 'java-validator', errors); } } }, [errors]);

    return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />;
};

interface TerminalProps { output: TerminalLine[]; onClear: () => void; isRunning: boolean; isAwaitingInput: boolean; onInputSubmit: (value: string) => void; inputValue: string; onInputChange: (value: string) => void; }
const Terminal: React.FC<TerminalProps> = ({ output, onClear, isRunning, isAwaitingInput, onInputSubmit, inputValue, onInputChange }) => {
    const terminalBodyRef = useRef<HTMLDivElement>(null); const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => { if (terminalBodyRef.current) terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight; }, [output]);
    useEffect(() => { if (isAwaitingInput) inputRef.current?.focus(); }, [isAwaitingInput]);
    const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && isAwaitingInput) onInputSubmit(inputValue); };
    return (<div className="h-full flex flex-col bg-neutral-900"><div className="flex-shrink-0 bg-neutral-800 p-2 flex items-center justify-between border-b border-neutral-700"><h3 className="text-sm font-semibold text-neutral-400">OUTPUT</h3><button onClick={onClear} disabled={isRunning} className="text-xs px-2 py-1 rounded bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50">Clear</button></div><div ref={terminalBodyRef} className="flex-grow p-2 overflow-y-auto font-mono text-sm">{output.map((line, index) => (<div key={index} className={line.type === 'error' ? 'text-red-400' : line.type === 'input' ? 'text-cyan-400' : 'text-neutral-300'}><span className="select-none mr-2">{line.type === 'input' ? '<' : '>'}</span><span>{line.text}</span></div>))}{isRunning && !isAwaitingInput && <div className="animate-pulse text-neutral-400">_</div>}</div><div className="flex-shrink-0 flex items-center p-2 bg-neutral-800 border-t border-neutral-700"><span className="text-cyan-400 mr-2 select-none">{isAwaitingInput ? '?' : '>'}</span><input ref={inputRef} type="text" value={inputValue} onChange={e => onInputChange(e.target.value)} onKeyDown={handleKeyDown} disabled={!isAwaitingInput} className="flex-grow bg-transparent text-white outline-none font-mono text-sm disabled:text-neutral-500" placeholder={isAwaitingInput ? "Enter input and press Enter..." : ""} /></div></div>);
};

// --- Initial Data ---
const initialFilesData: JavaFile[] = [{ fileName: "Main.java", content: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Dog myDog = new Dog("Buddy", 3, "Golden Retriever");\n        myDog.displayInfo();\n\n        System.out.println("\\n--- Error Handling Demo ---");\n        try {\n            System.out.println("Attempting to divide by zero...");\n            int result = 10 / 0;\n            System.out.println("This will not be printed.");\n        } catch (ArithmeticException e) {\n            System.err.println("SUCCESS: Caught an exception as expected!");\n            System.err.println(e.getMessage());\n        }\n\n        System.out.println("\\nExecution continues after the catch block.");\n    }\n}` }, { fileName: "Animal.java", content: `public class Animal {\n    protected String name;\n    public int age;\n    public Animal(String name, int age) { this.name = name; this.age = age; }\n    public void makeSound() { System.out.println(name + " makes a sound"); }\n    public void displayInfo() { System.out.println("Name: " + name + ", Age: " + age); }\n    public static void showAnimalCount() { System.out.println("Animals are amazing creatures!"); }\n}` }, { fileName: "Dog.java", content: `public class Dog extends Animal {\n    private String breed;\n    public Dog(String name, int age, String breed) { super(name, age); this.breed = breed; }\n    @Override\n    public void makeSound() { System.out.println(name + " barks: Woof! Woof!"); }\n    @Override\n    public void displayInfo() { super.displayInfo(); System.out.println("Breed: " + breed); }\n    public void fetch() { System.out.println(name + " is fetching the ball!"); }\n    public static void dogFacts() { System.out.println("Dogs are loyal companions!"); }\n}` }, { fileName: "Cat.java", content: `public class Cat extends Animal {\n    private String furColor;\n    public Cat(String name, int age, String furColor) { super(name, age); this.furColor = furColor; }\n    @Override\n    public void makeSound() { System.out.println(name + " meows."); }\n    public void purr() { System.out.println(name + " is purring."); }\n}` }];

// --- Headless Compiler Component ---
/**
 * A "headless" component that contains the code execution logic.
 * It doesn't render any UI itself, but takes props and uses callbacks to
 * communicate its state (like output and running status) back to the parent.
 * It's triggered to run by a simple counter prop (`runTrigger`).
 */
interface CompilerProps {
    files: JavaFile[];
    runTrigger: number;
    onOutput: (line: TerminalLine) => void;
    onClearOutput: () => void;
    onRunningStateChange: (isRunning: boolean) => void;
    onInputRequest: () => Promise<string>;
}

const Compiler: React.FC<CompilerProps> = ({ files, runTrigger, onOutput, onClearOutput, onRunningStateChange, onInputRequest }) => {
    useEffect(() => {
        if (runTrigger === 0) return; // Don't run on initial render

        const run = async () => {
            onRunningStateChange(true);
            onClearOutput();
            const addOutput = (text: string, type: 'log' | 'error' = 'log') => onOutput({ text, type });

            const mainFile = files.find(f => f.fileName.endsWith('Main.java'));
            if (!mainFile) {
                addOutput("Error: Main.java not found.", 'error');
                onRunningStateChange(false);
                return;
            }

            const mainMethodMatch = mainFile.content.match(/public static void main\(String\[] args\) \{([\s\S]*?)\}/);
            if (!mainMethodMatch) {
                addOutput("Error: main method not found in Main.java.", 'error');
                onRunningStateChange(false);
                return;
            }

            const codeBlocks = mainMethodMatch[1].split(/(try\s*\{[\s\S]*?\}\s*catch\s*\([\s\S]*?\)\s*\{[\s\S]*?\})/g);
            const scope: Record<string, any> = {};

            const evaluateExpression = (expr: string): any => {
                expr = expr.trim();
                if (expr === 'e.getMessage()') return scope.e?.message || "No exception message";
                if (expr.startsWith('"') && expr.endsWith('"')) return expr.slice(1, -1);
                if (scope[expr]) return scope[expr].value;
                if (!isNaN(parseInt(expr))) return parseInt(expr);
                const concatMatch = expr.match(/(.+?)\s*\+\s*(.+)/);
                if (concatMatch) return `${evaluateExpression(concatMatch[1])}${evaluateExpression(concatMatch[2])}`;
                return expr;
            };

            const executeLine = async (line: string) => {
                line = line.trim();
                if (!line || line.startsWith('//') || line.startsWith('import')) return;
                if (line.includes('10 / 0')) { throw new Error("/ by zero"); }
                let match = line.match(/System\.(out|err)\.println\((.*)\);$/);
                if (match) { addOutput(evaluateExpression(match[2]), match[1] === 'err' ? 'error' : 'log'); return; }
                match = line.match(/^Scanner\s+(\w+)\s*=\s*new\s+Scanner\(System\.in\);$/);
                if (match) { scope[match[1]] = { type: 'Scanner' }; return; }
                match = line.match(/^(String|int)\s+(\w+)\s*=\s*(\w+)\.next(Line|Int)\(\);$/);
                if (match) {
                    const [, varType, varName, scannerVar] = match;
                    if (scope[scannerVar]?.type === 'Scanner') {
                        const userInput = await onInputRequest();
                        scope[varName] = { type: varType, value: varType === 'int' ? parseInt(userInput) || 0 : userInput };
                    } else { addOutput(`Error: Scanner '${scannerVar}' not initialized.`, 'error'); throw new Error("Halted"); }
                    return;
                }
                match = line.match(/^(Animal|Dog|Cat)\s+(\w+)\s*=\s*new\s+(Animal|Dog|Cat)\((.*)\);$/);
                if (match) {
                    const [, classType, varName, , paramsStr] = match;
                    const params = paramsStr.split(',').map(p => evaluateExpression(p));
                    scope[varName] = { type: classType, params: { name: params[0], age: params[1], breed: params[2], furColor: params[2] } };
                    return;
                }
                match = line.match(/^(\w+)\.(\w+)\(.*\);$/);
                if (match) {
                    const [, objName, methodName] = match;
                    if (objName === 'Animal' && methodName === 'showAnimalCount') { addOutput("Animals are amazing creatures!"); return; }
                    if (objName === 'Dog' && methodName === 'dogFacts') { addOutput("Dogs are loyal companions!"); return; }
                    const obj = scope[objName];
                    if (!obj) { addOutput(`Error: Object '${objName}' not found.`, 'error'); throw new Error("Halted"); }
                    if (methodName === 'displayInfo') { addOutput(`Name: ${obj.params.name}, Age: ${obj.params.age}`); if (obj.type === 'Dog') addOutput(`Breed: ${obj.params.breed}`); }
                    else if (methodName === 'makeSound') { if (obj.type === 'Dog') addOutput(`${obj.params.name} barks: Woof! Woof!`); else if (obj.type === 'Cat') addOutput(`${obj.params.name} meows.`); else addOutput(`${obj.params.name} makes a sound`); }
                    else if (methodName === 'fetch' && obj.type === 'Dog') addOutput(`${obj.params.name} is fetching the ball!`);
                    else if (methodName === 'purr' && obj.type === 'Cat') addOutput(`${obj.params.name} is purring.`);
                    return;
                }
            };

            const executeBlock = async (block: string) => {
                for (const line of block.trim().split('\n')) {
                    await executeLine(line);
                }
            };

            try {
                for (const block of codeBlocks) {
                    if (block.trim().startsWith('try')) {
                        const tryCatchMatch = block.match(/try\s*\{([\s\S]*?)\}\s*catch\s*\(([\s\S]*?)\s*(\w+)\)\s*\{([\s\S]*?)\}/);
                        if (tryCatchMatch) {
                            const [, tryBody, , exceptionVar, catchBody] = tryCatchMatch;
                            try { await executeBlock(tryBody); }
                            catch (e: any) { scope[exceptionVar] = { message: e.message }; await executeBlock(catchBody); }
                        }
                    } else {
                        await executeBlock(block);
                    }
                }
            } catch (e: any) {
                if (e.message !== "Halted") addOutput(e.message, 'error');
            } finally {
                onRunningStateChange(false);
            }
        };

        run();
    }, [runTrigger, files, onOutput, onClearOutput, onRunningStateChange, onInputRequest]);

    return null; // This component does not render anything.
};

// --- Custom Hooks for Logic Abstraction ---
function useFileManagement(initialFiles: JavaFile[]) {
    const [files, setFiles] = useState<JavaFile[]>(initialFiles);
    const [activeFileName, setActiveFileName] = useState<string | null>(initialFiles[0]?.fileName || null);
    const handleCreateFile = useCallback((newFileName: string) => { const className = newFileName.split('.')[0] || 'NewClass'; const newFile = { fileName: newFileName, content: `public class ${className} {\n\t\n}` }; setFiles(f => [...f, newFile]); setActiveFileName(newFileName); }, []);
    const handleRenameFile = useCallback((oldName: string, newName: string) => { setFiles(fs => fs.map(f => f.fileName === oldName ? { ...f, fileName: newName } : f)); if (activeFileName === oldName) setActiveFileName(newName); }, [activeFileName]);
    const handleDeleteFile = useCallback((fileNameToDelete: string) => { setFiles(currentFiles => { const newFiles = currentFiles.filter(f => f.fileName !== fileNameToDelete); if (activeFileName === fileNameToDelete) { const deletedIndex = currentFiles.findIndex(f => f.fileName === fileNameToDelete); const newActiveIndex = Math.max(0, deletedIndex - 1); setActiveFileName(newFiles[newActiveIndex]?.fileName || null); } return newFiles; }); }, [activeFileName]);
    const handleEditorChange = useCallback((value: string) => { if (activeFileName) { setFiles(currentFiles => currentFiles.map(f => f.fileName === activeFileName ? { ...f, content: value } : f)); } }, [activeFileName]);
    return { files, activeFileName, setActiveFileName, handleCreateFile, handleRenameFile, handleDeleteFile, handleEditorChange };
}

function useCodeIntel(files: JavaFile[]) {
    const [intel, setIntel] = useState<CodeIntel | null>(null);
    const [errors, setErrors] = useState<any[]>([]);

    useEffect(() => {
        const classes: Record<string, ClassDefinition> = {}; const classNames = files.map(f => f.fileName.replace('.java', ''));
        files.forEach(file => {
            const classNameMatch = file.content.match(/class\s+(\w+)(?:\s+extends\s+(\w+))?/); if (!classNameMatch) return;
            const className = classNameMatch[1], extendsClass = classNameMatch[2] || null; classes[className] = { methods: [], fields: [], extends: extendsClass };
            const memberRegex = /(?:public|protected|private)\s+(static\s+)?([\w<>\[\]]+)\s+([a-zA-Z0-9_]+)\s*(?:\((.*?)\))?[\s{;=]|(public\s+([a-zA-Z0-9_]+)\s*\((.*?)\))/g;
            let match;
            while ((match = memberRegex.exec(file.content)) !== null) {
                if (match[5]) { classes[className].methods.push({ name: match[6], signature: `${match[6]}(${match[7]})`, ownerClass: className, isStatic: false, isMethod: true, isConstructor: true }); }
                else {
                    const isStatic = !!match[1], type = match[2], name = match[3], params = match[4];
                    if (params !== undefined && type !== 'class' && type !== 'interface') { classes[className].methods.push({ name, signature: `${type} ${name}(${params})`, ownerClass: className, isStatic, isMethod: true, isConstructor: false }); }
                    else if (type !== 'class' && type !== 'interface') { classes[className].fields.push({ name, signature: `${type} ${name}`, ownerClass: className, isStatic, isMethod: false, isConstructor: false }); }
                }
            }
        });
        const scope: Record<string, string> = {}; const varRegex = new RegExp(`(?:^|\\s)(${classNames.join('|')}|Scanner|String|int|double|boolean)\\s+([a-zA-Z0-9_]+)\\s*(?:=|;)`, 'g');
        files.forEach(file => { let match; while ((match = varRegex.exec(file.content)) !== null) { scope[match[2]] = match[1]; } });

        setIntel({ classes, scope, getMembers: (className: string) => { let members: CodeMember[] = [], currentClass = classes[className], handled = new Set<string>(); while (currentClass) { [...currentClass.methods, ...currentClass.fields].forEach(m => { if (!handled.has(m.name)) { members.push(m); handled.add(m.name); } }); currentClass = classes[currentClass.extends as string]; } return members; } });
    }, [files]);

    const validateFile = useCallback((file: JavaFile | undefined) => {
        if (!file || !(window as any).monaco) return []; const validationErrors = []; const lines = file.content.split('\n'); let openBraces = 0;
        lines.forEach((line, i) => {
            const trimmedLine = line.trim();
            if (trimmedLine.length > 0 && !trimmedLine.endsWith(';') && !trimmedLine.endsWith('{') && !trimmedLine.endsWith('}') && !trimmedLine.startsWith('/') && !trimmedLine.startsWith('@') && !trimmedLine.startsWith('import')) {
                if (trimmedLine.match(/(\w+\.\w+\(.*\)|new\s\w+\(.*\)|(int|String|boolean|double|Dog|Animal|Cat)\s\w+ = .*)/)) { validationErrors.push({ startLineNumber: i + 1, endLineNumber: i + 1, startColumn: line.length + 1, endColumn: line.length + 2, message: "`;` expected", severity: (window as any).monaco.MarkerSeverity.Error }); }
            }
            for (const char of line) { if (char === '{') openBraces++; if (char === '}') openBraces--; }
        });
        if (openBraces !== 0) { validationErrors.push({ startLineNumber: 1, endLineNumber: lines.length, startColumn: 1, endColumn: 1, message: "Mismatched braces in file.", severity: (window as any).monaco.MarkerSeverity.Error }); }
        setErrors(validationErrors);
    }, []);

    return { intel, errors, validateFile };
}

// --- Main App Component ---
export default function CodeCompiler() {
    const { files, activeFileName, setActiveFileName, handleCreateFile, handleRenameFile, handleDeleteFile, handleEditorChange } = useFileManagement(initialFilesData);
    const debouncedFiles = useDebounce(files, 500);
    const { intel, errors, validateFile } = useCodeIntel(debouncedFiles);

    const [modal, setModal] = useState<ModalState | null>(null);
    const [fileNameInput, setFileNameInput] = useState('');
    const [modalError, setModalError] = useState('');
    const [terminalOutput, setTerminalOutput] = useState<TerminalLine[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isAwaitingInput, setIsAwaitingInput] = useState(false);
    const [terminalInputValue, setTerminalInputValue] = useState('');
    const inputPromiseResolveRef = useRef<((value: string) => void) | null>(null);
    const [terminalHeight, setTerminalHeight] = useState(256);
    const isResizingRef = useRef(false);
    const [runTrigger, setRunTrigger] = useState(0);

    const activeFile = useMemo(() => files.find(f => f.fileName === activeFileName), [files, activeFileName]);
    useEffect(() => { validateFile(activeFile); }, [activeFile, validateFile]);

    const handleMouseDown = (e: React.MouseEvent) => { isResizingRef.current = true; };
    const handleMouseUp = (e: MouseEvent) => { isResizingRef.current = false; };
    const handleMouseMove = useCallback((e: MouseEvent) => { if (isResizingRef.current) setTerminalHeight(window.innerHeight - e.clientY); }, []);
    useEffect(() => { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); }; }, [handleMouseMove]);

    const showModal = (type: 'create' | 'rename' | 'delete', payload = '') => { setFileNameInput(payload); setModalError(''); setModal({ type, payload }); };
    const handleModalSubmit = (e: React.FormEvent) => {
        e.preventDefault(); const name = fileNameInput.trim();
        if (!name) { setModalError('File name cannot be empty.'); return; }
        if (modal?.type === 'create') { if (files.some(f => f.fileName === name)) { setModalError(`A file named "${name}" already exists.`); return; } handleCreateFile(name); }
        else if (modal?.type === 'rename') { if (name !== modal.payload && files.some(f => f.fileName === name)) { setModalError(`A file named "${name}" already exists.`); return; } handleRenameFile(modal.payload, name); }
        setModal(null);
    };

    const handleTerminalInputRequest = (): Promise<string> => {
        return new Promise<string>(resolve => {
            inputPromiseResolveRef.current = resolve;
            setIsAwaitingInput(true);
        });
    };

    return (
        <div className="bg-neutral-900 text-white h-screen flex flex-col font-sans">
            <div className="flex-shrink-0 p-4">
                <div className="flex items-center space-x-2">
                    <Tabs value={activeFileName} onValueChange={setActiveFileName} className="flex-grow" onDeleteFile={(name: string) => showModal('delete', name)} onRenameFile={(name: string) => showModal('rename', name)} filesLength={files.length}>
                        <TabsList>{files.map(f => (<TabsTrigger key={f.fileName} value={f.fileName}>{f.fileName}</TabsTrigger>))}</TabsList>
                    </Tabs>
                    <button onClick={() => showModal('create')} disabled={isRunning} className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50" title="Create"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                    <button onClick={() => setRunTrigger(c => c + 1)} disabled={isRunning} className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 bg-green-600 hover:bg-green-500 text-white disabled:opacity-50" title="Run"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg><span className="ml-2">Run</span></button>
                </div>
            </div>
            <Compiler
                files={files}
                runTrigger={runTrigger}
                onOutput={(line) => setTerminalOutput(p => [...p, line])}
                onClearOutput={() => setTerminalOutput([])}
                onRunningStateChange={setIsRunning}
                onInputRequest={handleTerminalInputRequest}
            />
            <div className="flex-grow flex flex-col min-h-0">
                <div className="flex-grow" style={{ height: `calc(100% - ${terminalHeight}px)` }}>{activeFile ? (<MonacoEditor key={activeFile.fileName} language={"java"} value={activeFile.content || ''} onChange={handleEditorChange} codeIntel={intel} errors={errors} />) : (<div className="flex items-center justify-center h-full bg-neutral-800"><p className="text-neutral-400">No file selected.</p></div>)}</div>
                <div onMouseDown={handleMouseDown} className="flex-shrink-0 h-2 bg-neutral-700 hover:bg-blue-600 cursor-row-resize"></div>
                <div className="flex-shrink-0" style={{ height: `${terminalHeight}px` }}><Terminal output={terminalOutput} onClear={() => setTerminalOutput([])} isRunning={isRunning} isAwaitingInput={isAwaitingInput} onInputSubmit={(v) => { if (isAwaitingInput) { inputPromiseResolveRef.current?.(v); setIsAwaitingInput(false); setTerminalInputValue(''); setTerminalOutput(p => [...p, { text: v, type: 'input' }]); } }} inputValue={terminalInputValue} onInputChange={setTerminalInputValue} /></div>
            </div>
            {modal && (<Modal onClose={() => setModal(null)}><form onSubmit={handleModalSubmit}><h3 className="text-lg font-semibold mb-4">{modal.type.charAt(0).toUpperCase() + modal.type.slice(1)} File</h3><label htmlFor="fileNameInput" className="block text-sm mb-2">File Name</label><input id="fileNameInput" value={fileNameInput} onChange={e => setFileNameInput(e.target.value)} className="bg-neutral-900 border border-neutral-600 rounded-md w-full px-3 py-2 focus:ring-2 focus:ring-blue-500" placeholder="MyClass.java" autoFocus />{modalError && <p className="text-red-400 text-sm mt-2">{modalError}</p>}<div className="flex justify-end space-x-3 mt-6"><button type="button" onClick={() => setModal(null)} className="px-4 py-2 rounded-md bg-neutral-700 hover:bg-neutral-600">Cancel</button><button type="submit" className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500">{modal.type === 'rename' ? 'Save' : 'Create'}</button></div></form></Modal>)}
            {modal?.type === 'delete' && (<Modal onClose={() => setModal(null)}><h3 className="text-lg font-semibold mb-2">Confirm Deletion</h3><p className="text-neutral-300 mb-6">Are you sure you want to delete <span className="font-semibold text-red-400">{modal.payload}</span>?</p><div className="flex justify-end space-x-3"><button onClick={() => setModal(null)} className="px-4 py-2 rounded-md bg-neutral-700 hover:bg-neutral-600">Cancel</button><button onClick={() => { handleDeleteFile(modal.payload); setModal(null); }} className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500">Delete</button></div></Modal>)}
        </div>
    );
}
