import { useState, useMemo } from 'react';
import { useTestBuilderStore } from '../hooks/useTestBuilderStore';
import { generateTestCode } from '../lib/code-generator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileCode, Copy, Check } from 'lucide-react';

export const CodePreview = () => {
    const { blocks } = useTestBuilderStore();
    const [copied, setCopied] = useState(false);

    const generatedCode = useMemo(() => generateTestCode(blocks), [blocks]);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedCode).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy code: ', err);
        });
    };

    return (
        <Card className="h-full flex flex-col bg-gray-800 text-gray-200 shadow-2xl border-gray-700">
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="flex items-center text-gray-100">
                    <FileCode className="mr-2" />Generated Code
                </CardTitle>
                <Button variant="secondary" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="mr-2 h-4 w-4 text-green-400" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                </Button>
            </CardHeader>
            <CardContent className="flex-grow overflow-auto p-0">
                <pre className="h-full bg-gray-900 rounded-b-lg p-4 text-sm whitespace-pre-wrap language-java">
                    <code>{generatedCode}</code>
                </pre>
            </CardContent>
        </Card>
    );
};