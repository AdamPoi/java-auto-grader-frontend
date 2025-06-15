import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Award, PlusCircle, Trash2 } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTestBuilderStore } from '../hooks/use-test-builder-store';

export const RubricPanel: React.FC = () => {
    const { rubrics, addRubricItem, updateRubricItem, removeRubricItem } = useTestBuilderStore();

    const totalPoints = useMemo(() => rubrics.reduce((sum, item) => sum + (item.points || 0), 0), [rubrics]);

    return (
        <div className="flex flex-col mb-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center text-gray-700"><Award className="mr-2" />Grading Rubric</h2>
                <Button size="sm" onClick={addRubricItem}><PlusCircle className="mr-2 h-4 w-4" />Add</Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {rubrics.map(item => (
                    <div key={item.id} className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg">
                        <Input
                            type="text"
                            value={item.name}
                            placeholder="Rubric Item Name"
                            onChange={(e) => updateRubricItem({ ...item, name: e.target.value })}
                            className="flex-grow"
                        />
                        <Input
                            type="number"
                            value={item.points}
                            onChange={(e) => updateRubricItem({ ...item, points: parseInt(e.target.value, 10) || 0 })}
                            className="w-24"
                            min="0"
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full flex-shrink-0" onClick={() => removeRubricItem({ id: item.id })}>
                            <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                        </Button>
                    </div>
                ))}
            </div>
            {rubrics.length > 0 && (
                <div className="mt-4 pt-4 border-t flex justify-between items-center font-bold text-lg">
                    <span>Total Points:</span>
                    <span>{totalPoints}</span>
                </div>
            )}
        </div>
    );
};