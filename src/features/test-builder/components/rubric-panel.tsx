import { Input } from '@/components/ui/input';
import { useRubrics } from '@/features/rubrics/hooks/use-rubric';
import type { SearchRequestParams } from '@/types/api.types';
import { useParams } from '@tanstack/react-router';
import { Award } from 'lucide-react';
import React, { useEffect, useMemo } from 'react';
import { useTestBuilderStore } from '../hooks/use-test-builder-store';

export const RubricPanel: React.FC = () => {
    const getAssignmentId = () => {
        try {
            const adminParams = useParams({ from: '/_authenticated/admin/assignments/$assignmentId/' });
            return adminParams.assignmentId;
        } catch {
            try {
                const studentParams = useParams({ from: '/_authenticated/app/assignments/$assignmentId/' });
                return studentParams.assignmentId;
            } catch {
                const genericParams = useParams({ strict: false });
                return genericParams.assignmentId;
            }
        }
    };

    const assignmentId = getAssignmentId();
    const { rubrics, setRubrics } = useTestBuilderStore();
    const searchParams: SearchRequestParams = {
        page: 0,
        size: 1000,
        filter: `assignment=eq:${assignmentId}`,
    };

    const { data, isLoading } = useRubrics(searchParams);

    useEffect(() => {
        if (data?.content && data.content.length > 0) {
            const newRubrics = data.content.map(rubric => ({
                id: rubric.id,
                name: rubric.name,
                points: rubric.points
            }));
            setRubrics(newRubrics);
        }
    }, [data, setRubrics]);

    const totalPoints = useMemo(() => data?.content?.reduce((sum, item) => sum + (item.points || 0), 0) || 0, [data?.content]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading rubrics...</div>
            </div>
        );
    }
    return (
        <div className="flex flex-col mb-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center text-gray-700"><Award className="mr-2" />Grading Rubric</h2>
                {/* <Button size="sm" onClick={addRubricItem}><PlusCircle className="mr-2 h-4 w-4" />Add</Button> */}
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                <div className="flex justify-between items-center bg-gray-200 p-2 rounded-lg font-bold text-gray-700">
                    <span>Rubric Item</span>
                    <span>Points</span>
                </div>
                {rubrics?.map(item => (
                    <div key={item.id} className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg">
                        <Input
                            type="text"
                            value={item.name}
                            placeholder="Rubric Item Name"
                            readOnly={true}
                            // onChange={(e) => updateRubricItem({ ...item, name: e.target.value })}
                            className="flex-grow border border-gray-300 rounded-md p-2"
                        />
                        <Input
                            type="number"
                            value={item.points}
                            readOnly={true}
                            // onChange={(e) => updateRubricItem({ ...item, points: parseInt(e.target.value, 10) || 0 })}
                            className="w-24 border border-gray-300 rounded-md p-2"
                            min="0"
                        />
                        {/* <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full flex-shrink-0" onClick={() => removeRubricItem({ id: item.id })}>
                            <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                        </Button> */}
                    </div>
                ))}
            </div>
            {rubrics?.length > 0 && (
                <div className="mt-4 pt-4 border-t flex justify-between items-center font-bold text-lg">
                    <span>Total Points:</span>
                    <span>{totalPoints}</span>
                </div>
            )}
        </div>
    );
};