import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Rubric } from '@/features/rubrics/data/types';
import { cn } from '@/lib/utils';
import React from 'react';

interface RubricCardProps {
    rubric: Rubric;
    className?: string;
}

const RubricCard: React.FC<RubricCardProps> = ({ rubric, className }) => {
    return (
        <Card className={cn('overflow-hidden', className)}>
            <CardHeader>
                <CardTitle>{rubric.name}</CardTitle>
                <CardDescription>{rubric.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between mb-4">
                    <span>Points: {rubric.points}</span>
                    {/* <span>Status: {rubric.isActive ? 'Active' : 'Inactive'}</span> */}
                </div>
                {rubric.rubricGrades && rubric.rubricGrades.length > 0 && (
                    <div>
                        <h3 className="font-semibold mb-2">Rubric Grades</h3>
                        <ul className="space-y-2">
                            {rubric.rubricGrades.map((grade) => (
                                <li key={grade.id} className="flex justify-between">
                                    <span>{grade.name}</span>
                                    {/* <span>{grade.points} points</span> */}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default RubricCard;