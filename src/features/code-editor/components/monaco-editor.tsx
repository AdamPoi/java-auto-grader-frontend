import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import React, { useEffect, useRef } from 'react';
import { type CodeIntelData, type MonacoEditorError } from '../hooks/use-code-intel';

interface MonacoEditorProps {
    language: string;
    value: string;
    onChange: (value: string) => void;
    codeIntel: CodeIntelData | null;
    errors: MonacoEditorError[];
    readOnly?: boolean;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({ language, value, onChange, codeIntel, errors, readOnly }) => {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const completionProviderRef = useRef<monaco.IDisposable | null>(null);

    // Handle editor did mount
    const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
        editorRef.current = editor;
    };

    // Register completion provider for IntelliSense
    useEffect(() => {
        if (codeIntel && editorRef.current) {
            completionProviderRef.current?.dispose();

            completionProviderRef.current = monaco.languages.registerCompletionItemProvider('java', {
                triggerCharacters: ['.', ' '],
                provideCompletionItems: (model: monaco.editor.ITextModel, position: monaco.Position) => {
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
                                    kind: m.isMethod ? monaco.languages.CompletionItemKind.Method : monaco.languages.CompletionItemKind.Field,
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
                                kind: monaco.languages.CompletionItemKind.Keyword,
                                insertText: k,
                                range
                            })),
                            ...Object.keys(codeIntel.classes).map(c => ({
                                label: c,
                                kind: monaco.languages.CompletionItemKind.Class,
                                insertText: c,
                                range
                            })),
                            ...Object.keys(codeIntel.scope).map(v => ({
                                label: v,
                                kind: monaco.languages.CompletionItemKind.Variable,
                                insertText: v,
                                detail: codeIntel.scope[v],
                                range
                            })),
                            {
                                label: 'main',
                                kind: monaco.languages.CompletionItemKind.Snippet,
                                insertText: 'public static void main(String[] args) {\n\t${0}\n}',
                                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                documentation: 'Main method',
                                range
                            },
                            {
                                label: 'sysout',
                                kind: monaco.languages.CompletionItemKind.Snippet,
                                insertText: 'System.out.println(${0});',
                                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                documentation: 'Prints to standard out',
                                range
                            }
                        ]
                    };
                }
            });
        }

        return () => {
            completionProviderRef.current?.dispose();
        };
    }, [codeIntel]);

    // Update error markers
    useEffect(() => {
        if (editorRef.current) {
            const model = editorRef.current.getModel();
            if (model) {
                monaco.editor.setModelMarkers(model, 'java-validator', errors);
            }
        }
    }, [errors]);

    return (
        <Editor
            height="100%"
            language={language}
            value={value}
            onChange={(value) => onChange(value || '')}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
                automaticLayout: true,
                wordWrap: 'on',
                fontSize: 14,
                readOnly: readOnly,
            }}
        />
    );
};

export default MonacoEditor;