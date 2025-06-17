import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import React from 'react';
import type { Rubric } from '../data/types';
import { RubricForm } from './rubrics-form';

interface Props {
    rubric?: Rubric
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const RubricsActionDialog: React.FC<Props> = ({
    open,
    onOpenChange,
    rubric,
}) => {
    const isEditing = Boolean(rubric);

    const handleSave = (rubricData: Partial<Rubric>) => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit Rubric' : 'Create New Rubric'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the rubric details and criteria.'
                            : 'Create a new rubric with criteria and performance levels.'
                        }
                    </DialogDescription>
                </DialogHeader>
                <RubricForm
                    initialData={rubric}
                    onSubmit={handleSave}
                />
            </DialogContent>
        </Dialog>
    );
};