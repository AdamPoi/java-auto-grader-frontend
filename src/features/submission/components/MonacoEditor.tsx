import React, { useRef, useEffect } from 'react';
import { type MonacoEditorError, type CodeIntelData } from '../hooks/useCodeIntel';

declare global {
    interface Window {
        monaco: any;
        require: any;
    }
}

interface MonacoEditorProps {
    language: string;
    value: string;
    onChange: (value: string) => void;
    codeIntel: CodeIntelData | null;
    errors: MonacoEditorError[];
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({ language, value, onChange, codeIntel, errors }) => {
    const editorRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const completionProviderRef = useRef<any>(null);
    const onchangeRef = useRef(onChange);

    // Update ref when onChange prop changes
    useEffect(() => {
        onchangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        const MONACO_VS_URL = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs';

        const initMonaco = () => {
            if (containerRef.current && !editorRef.current) {
                editorRef.current = window.monaco.editor.create(containerRef.current, {
                    value,
                    language,
                    theme: 'vs-dark',
                    automaticLayout: true,
                    wordWrap: 'on',
                    fontSize: 14
                });

                // Attach content change listener
                editorRef.current.onDidChangeModelContent(() => {
                    if (onchangeRef.current) {
                        onchangeRef.current(editorRef.current.getValue());
                    }
                });
            }
        };

        if (!window.monaco) {
            // Load Monaco Editor if not already loaded
            if (!document.querySelector('script[src*="loader.js"]')) {
                const script = document.createElement('script');
                script.src = `${MONACO_VS_URL}/loader.js`;
                script.onload = () => {
                    window.require.config({ paths: { 'vs': MONACO_VS_URL } });
                    window.require(['vs/editor/editor.main'], initMonaco);
                };
                document.body.appendChild(script);
            }
        } else {
            initMonaco();
        }

        // Cleanup
        return () => {
            editorRef.current?.dispose();
            editorRef.current = null;
        };
    }, []); // Empty dependency array means this runs once on mount

    // Update editor value when prop changes
    useEffect(() => {
        if (editorRef.current && editorRef.current.getValue() !== value) {
            editorRef.current.setValue(value);
        }
    }, [value]);

    // Update editor language when prop changes
    useEffect(() => {
        if (editorRef.current) {
            window.monaco.editor.setModelLanguage(editorRef.current.getModel(), language);
        }
    }, [language]);

    // Register completion provider for IntelliSense
    useEffect(() => {
        if (window.monaco && codeIntel) {
            completionProviderRef.current?.dispose(); // Dispose previous provider if exists

            completionProviderRef.current = window.monaco.languages.registerCompletionItemProvider('java', {
                triggerCharacters: ['.', ' '],
                provideCompletionItems: (model: any, position: any) => {
                    const word = model.getWordUntilPosition(position);
                    const range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endColumn: word.endColumn
                    };
                    const textUntilPosition = model.getValueInRange({
                        startLineNumber: 1,
                        startColumn: 1,
                        endLineNumber: position.lineNumber,
                        endColumn: position.column
                    });

                    const memberMatch = textUntilPosition.match(/(\w+)\.$/);
                    if (memberMatch) {
                        const variableName = memberMatch[1];
                        let varType = codeIntel.scope[variableName];
                        let isStaticAccess = false;

                        if (!varType) {
                            // Check if it's a static access to a class directly
                            if (codeIntel.classes[variableName]) {
                                varType = variableName;
                                isStaticAccess = true;
                            } else {
                                return { suggestions: [] };
                            }
                        }

                        return {
                            suggestions: codeIntel.getMembers(varType)
                                .filter(m => isStaticAccess ? m.isStatic : !m.isConstructor)
                                .map(m => ({
                                    label: m.name,
                                    kind: m.isMethod ? window.monaco.languages.CompletionItemKind.Method : window.monaco.languages.CompletionItemKind.Field,
                                    insertText: m.name,
                                    detail: m.signature,
                                    range
                                }))
                        };
                    }

                    // Global keywords and class/variable suggestions
                    const keywords = ['public', 'private', 'static', 'void', 'class', 'if', 'else', 'for', 'while', 'try', 'catch', 'int', 'String', 'boolean'];
                    return {
                        suggestions: [
                            ...keywords.map(k => ({
                                label: k,
                                kind: window.monaco.languages.CompletionItemKind.Keyword,
                                insertText: k,
                                range
                            })),
                            ...Object.keys(codeIntel.classes).map(c => ({
                                label: c,
                                kind: window.monaco.languages.CompletionItemKind.Class,
                                insertText: c,
                                range
                            })),
                            ...Object.keys(codeIntel.scope).map(v => ({
                                label: v,
                                kind: window.monaco.languages.CompletionItemKind.Variable,
                                insertText: v,
                                detail: codeIntel.scope[v],
                                range
                            })),
                            {
                                label: 'main',
                                kind: window.monaco.languages.CompletionItemKind.Snippet,
                                insertText: 'public static void main(String[] args) {\n\t${0}\n}',
                                insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                documentation: 'Main method',
                                range
                            },
                            {
                                label: 'sysout',
                                kind: window.monaco.languages.CompletionItemKind.Snippet,
                                insertText: 'System.out.println(${0});',
                                insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                documentation: 'Prints to standard out',
                                range
                            }
                        ]
                    };
                }
            });
        }

        return () => {
            completionProviderRef.current?.dispose(); // Clean up on unmount or when codeIntel changes
        };
    }, [codeIntel]); // Re-register when codeIntel changes

    // Apply error markers
    useEffect(() => {
        if (window.monaco && editorRef.current) {
            const model = editorRef.current.getModel();
            if (model) {
                window.monaco.editor.setModelMarkers(model, 'java-validator', errors);
            }
        }
    }, [errors]);

    return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />;
};

export default MonacoEditor;