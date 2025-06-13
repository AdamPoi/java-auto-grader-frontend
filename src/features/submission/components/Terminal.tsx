import React, { useRef, useEffect } from 'react';
import { type TerminalOutputLine } from '../hooks/useJavaSimulator';

interface TerminalProps {
    output: TerminalOutputLine[];
    onClear: () => void;
    isRunning: boolean;
    isAwaitingInput: boolean;
    onInputSubmit: (input: string) => void;
    inputValue: string;
    onInputChange: (value: string) => void;
}

const Terminal: React.FC<TerminalProps> = ({ output, onClear, isRunning, isAwaitingInput, onInputSubmit, inputValue, onInputChange }) => {
    const terminalBodyRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom on new output
    useEffect(() => {
        if (terminalBodyRef.current) {
            terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
        }
    }, [output]);

    // Focus input when awaiting input
    useEffect(() => {
        if (isAwaitingInput) {
            inputRef.current?.focus();
        }
    }, [isAwaitingInput]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && isAwaitingInput) {
            onInputSubmit(inputValue);
        }
    };

    return (
        <div className="h-full flex flex-col bg-neutral-900">
            <div className="flex-shrink-0 bg-neutral-800 p-2 flex items-center justify-between border-b border-neutral-700">
                <h3 className="text-sm font-semibold text-neutral-400">OUTPUT</h3>
                <button
                    onClick={onClear}
                    disabled={isRunning}
                    className="text-xs px-2 py-1 rounded bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50"
                >
                    Clear
                </button>
            </div>
            <div ref={terminalBodyRef} className="flex-grow p-2 overflow-y-auto font-mono text-sm">
                {output.map((line, index) => (
                    <div
                        key={index}
                        className={line.type === 'error' ? 'text-red-400' : line.type === 'input' ? 'text-cyan-400' : 'text-neutral-300'}
                    >
                        <span className="select-none mr-2">{line.type === 'input' ? '<' : '>'}</span>
                        <span>{line.text}</span>
                    </div>
                ))}
                {isRunning && !isAwaitingInput && <div className="animate-pulse text-neutral-400">_</div>}
            </div>
            <div className="flex-shrink-0 flex items-center p-2 bg-neutral-800 border-t border-neutral-700">
                <span className="text-cyan-400 mr-2 select-none">{isAwaitingInput ? '?' : '>'}</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={e => onInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!isAwaitingInput}
                    className="flex-grow bg-transparent text-white outline-none font-mono text-sm disabled:text-neutral-500"
                    placeholder={isAwaitingInput ? "Enter input and press Enter..." : ""}
                />
            </div>
        </div>
    );
};

export default Terminal;