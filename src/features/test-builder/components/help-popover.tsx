import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ExternalLink, HelpCircle } from 'lucide-react';
import { useRef, useState } from 'react';

interface DocInfo {
    description: string;
    example?: string;
    link?: string;
}

interface HelpPopoverProps {
    doc: DocInfo;
}

export function HelpPopover({ doc }: HelpPopoverProps) {
    const [isHelpHovered, setIsHelpHovered] = useState(false);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => {
                if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current);
                }
                setIsHelpHovered(true);
            }}
            onMouseLeave={() => {
                hoverTimeoutRef.current = setTimeout(() => {
                    setIsHelpHovered(false);
                }, 300); // 300ms delay before closing
            }}
        >
            <Popover open={isHelpHovered} onOpenChange={setIsHelpHovered}>
                <PopoverTrigger asChild>
                    <div
                        className="h-6 w-6 ml-2 rounded-full cursor-help flex items-center justify-center group/help"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <HelpCircle className="h-4 w-4 text-gray-400 group-hover/help:text-blue-500 z-50" />
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    className="w-64"
                    side="top"
                    align="center"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onPointerDownOutside={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <div>
                        <p className="text-sm text-gray-700 mb-2">{doc.description}</p>
                        {doc.example && (
                            <pre className="bg-gray-100 p-2 rounded-md text-xs text-gray-800 mb-2 overflow-x-auto whitespace-pre-wrap break-words">
                                <code>{doc.example}</code>
                            </pre>
                        )}
                        {doc.link && (
                            <a
                                href={doc.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm flex items-center"
                            >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Read More
                            </a>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}