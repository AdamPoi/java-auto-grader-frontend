import React, { useEffect, useRef } from 'react';
import type { TerminalOutputLine } from '../data/types';
import { Button } from '@/components/ui/button';

interface TerminalProps {
    output: TerminalOutputLine[];
    onClear: () => void;
    isRunning: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ output, onClear, isRunning }) => {
    const terminalBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (terminalBodyRef.current) {
            terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
        }
    }, [output]);

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
            <div ref={terminalBodyRef} className="flex-grow p-2 overflow-y-auto font-mono text-sm">
                {output.map((line, index) => (
                    <div
                        key={index}
                        className={line.type === 'error' ? 'text-red-400' : 'text-neutral-300'}
                    >
                        <span className="select-none mr-2">{'>'}</span>
                        <span>{line.text}</span>
                    </div>
                ))}
                {isRunning && <div className="animate-pulse text-neutral-400">_</div>}
            </div>
        </div>
    );
};

export default Terminal;