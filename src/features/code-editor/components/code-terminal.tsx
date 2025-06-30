import { Button } from '@/components/ui/button';
import React, { useEffect, useRef } from 'react';
import type { TerminalOutputLine } from '../data/types';

interface TerminalProps {
    output: TerminalOutputLine[];
    onClear: () => void;
    isRunning: boolean;
    onErrorClick: (fileName: string, lineNumber: number) => void;
}

const Terminal: React.FC<TerminalProps> = ({ output, onClear, isRunning, onErrorClick }) => {
    const terminalBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (terminalBodyRef.current) {
            terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
        }
    }, [output]);

    const parseErrorLink = (text: string): { fileName: string, lineNumber: number } | null => {
        const match = text.match(/^(.+\.java):(\d+):/);
        if (match) {
            return { fileName: match[1], lineNumber: parseInt(match[2], 10) };
        }
        return null;
    };

    return (
        <div className="h-full flex flex-col bg-neutral-900">
            <div className="flex-shrink-0 bg-neutral-800 p-2 flex items-center justify-between border-b border-neutral-700">
                <h3 className="text-sm font-semibold text-neutral-400">OUTPUT</h3>
                <Button
                    onClick={onClear}
                    disabled={isRunning}
                    className="text-xs px-2 py-1 rounded bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50"
                >
                    Clear
                </Button>
            </div>
            <div ref={terminalBodyRef} className="flex-grow p-2 overflow-y-auto font-mono text-sm leading-6">
                {output.map((line, index) => {
                    const errorLinkInfo = parseErrorLink(line.text);
                    const isError = line.type === 'error';

                    // A pointer line starts with optional whitespace, followed by a caret '^'.
                    const isPointerLine = /^\s*\^/.test(line.text);
                    // The line before a pointer is the code snippet.
                    const isCodeSnippet = /^\s*\^/.test(output[index + 1]?.text || '');

                    if (errorLinkInfo) {
                        return (
                            <div
                                key={index}
                                className="text-red-400 cursor-pointer underline hover:font-bold "
                                onClick={() => onErrorClick(errorLinkInfo.fileName, errorLinkInfo.lineNumber)}
                            >
                                <span className="select-none mr-2">{'>'}</span>
                                <span>{line.text}</span>
                            </div>
                        );
                    }

                    if (isCodeSnippet || isPointerLine) {
                        return (
                            <div
                                key={index}
                                className={isPointerLine ? 'text-red-400' : 'text-neutral-300'}
                                style={{ whiteSpace: 'pre' }}
                            >
                                {/* <span className="select-none mr-2">{'>'}</span> */}
                                <span>{line.text}</span>
                            </div>
                        );
                    }

                    return (
                        <div key={index} className={isError ? 'text-red-400' : 'text-neutral-300'}>
                            {/* <span className="select-none mr-2">{'>'}</span> */}
                            <span>{line.text}</span>
                        </div>
                    );
                })}
                {isRunning && <div className="animate-pulse text-neutral-400">_</div>}
            </div>
        </div>
    );
};

export default Terminal;