import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Rubric } from '@/features/rubrics/data/types';
import { ChevronDown, Play } from 'lucide-react';

interface TestButtonProps {
    rubrics: Rubric[];
    onSelectRubric: (rubric: Rubric) => void;
    disabled?: boolean;
}

export function TestButton({ rubrics, onSelectRubric, disabled = false }: TestButtonProps) {
    if (rubrics.length === 0) {
        return (
            <Button variant="outline" disabled>
                <Play className="h-4 w-4 mr-2" />
                No Tests Available
            </Button>
        );
    }

    if (rubrics.length === 1) {
        return (
            <Button
                variant="outline"
                onClick={() => onSelectRubric(rubrics[0])}
                disabled={disabled}
                className="flex items-center gap-2"
            >
                <Play className="h-4 w-4" />
                Test Code
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={disabled} className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Test Code
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {rubrics.map((rubric) => (
                    <DropdownMenuItem
                        key={rubric.id}
                        onClick={() => onSelectRubric(rubric)}
                        className="flex flex-col items-start gap-1"
                    >
                        <span className="font-medium">{rubric.name}</span>
                        {rubric.description && (
                            <span className="text-xs text-gray-500">{rubric.description}</span>
                        )}
                        <span className="text-xs text-gray-400">
                            {rubric.rubricGrades?.length || 0} test(s)
                        </span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}