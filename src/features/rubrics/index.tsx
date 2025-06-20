import { TourAlertDialog, useTour, type TourStep } from '@/components/tour';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RUBRIC_STEP_IDS } from '@/lib/tour-constants';
import type { SearchRequestParams } from '@/types/api.types';
import { Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { RubricsDialogs } from './components/rubrics-dialogs';
import { useRubricsContext } from './context/rubrics-context';
import type { Rubric } from './data/types';
import { useRubrics } from './hooks/use-rubric';

interface RubricPageProps {
    assignmentId: string;
}


const rubricGuideSteps: TourStep[] = [
    {
        content: (
            <div className="space-y-3">
                <h3 className="font-semibold">Introduction to Rubrics</h3>
                <p className="text-sm text-muted-foreground">
                    Rubrics are structured grading tools that define criteria and performance levels for assignments.
                    They help ensure consistent, fair evaluation and provide clear expectations for students.
                </p>
                <p className="text-sm text-muted-foreground">
                    Use this section to manage all rubrics for this assignment.
                </p>
            </div>
        ),
        selectorId: RUBRIC_STEP_IDS.RUBRIC_INTRODUCTION,
        position: "bottom",
        onClickWithinArea: () => { },
    },
    {
        content: (
            <div className="space-y-3">
                <h3 className="font-semibold">Adding a New Rubric</h3>
                <p className="text-sm text-muted-foreground">
                    Click this button to create a new rubric. You'll be able to define the rubric name,
                    description, and point value to establish clear grading criteria.
                </p>
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    💡 Tip: Start with the most important evaluation criteria first.
                </div>
            </div>
        ),
        selectorId: RUBRIC_STEP_IDS.ADD_RUBRIC_BUTTON,
        position: "left",
        onClickWithinArea: () => { },
    },
    {
        content: (
            <div className="space-y-3">
                <h3 className="font-semibold">Editing Existing Rubrics</h3>
                <p className="text-sm text-muted-foreground">
                    Click the "Edit" button on any rubric card to modify its name, description, or point allocation.
                    This allows you to refine your grading criteria as needed.
                </p>
                <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                    ⚠️ Changes will affect all future grading using this rubric.
                </div>
            </div>
        ),
        selectorId: RUBRIC_STEP_IDS.EDIT_BUTTON,
        position: "left",
        onClickWithinArea: () => { },
    },
    {
        content: (
            <div className="space-y-3">
                <h3 className="font-semibold">Deleting Rubrics</h3>
                <p className="text-sm text-muted-foreground">
                    Remove rubrics that are no longer needed by clicking the "Delete" button.
                    This is useful for cleaning up outdated or duplicate criteria.
                </p>
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    ⚠️ Deletion is permanent and cannot be undone. Consider editing instead if you need minor changes.
                </div>
            </div>
        ),
        selectorId: RUBRIC_STEP_IDS.DELETE_BUTTON,
        position: "right",
        onClickWithinArea: () => { },
    },
    {
        content: (
            <div className="space-y-3">
                <h3 className="font-semibold">Understanding Points Allocation</h3>
                <p className="text-sm text-muted-foreground">
                    Each rubric displays its point value (e.g., "20 pts"). These points contribute to the total assignment score
                    and help weight different criteria appropriately.
                </p>
                <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                    💡 Tip: Allocate more points to criteria that are most important for the assignment's learning objectives.
                </div>
            </div>
        ),
        selectorId: RUBRIC_STEP_IDS.POINTS_DISPLAY,
        position: "left",
        onClickWithinArea: () => { },
    },

];

const Rubrics: React.FC<RubricPageProps> = ({ assignmentId }) => {
    const { setOpen, setRubric } = useRubricsContext()


    const searchParams: SearchRequestParams = {
        page: 0,
        size: 1000,
        filter: `assignment=eq:${assignmentId}`,
    };

    const { data, isLoading } = useRubrics(searchParams);

    const handleCreate = () => {
        setOpen('add');
    };

    const handleEdit = (rubric: Rubric) => {
        setRubric(rubric);
        setOpen('edit');
    };

    const handleDelete = async (rubricData: Rubric) => {
        setRubric(rubricData);
        setOpen('delete');
    };

    const handleSave = (rubricData: Rubric) => {
        setRubric(rubricData);
        setOpen(null);
    };




    const { setSteps } = useTour();
    const [openTour, setOpenTour] = useState(false);

    useEffect(() => {
        setSteps(rubricGuideSteps);

        const timer = setTimeout(() => {
            setOpenTour(true);
        }, 100);
        return () => clearTimeout(timer);
    }, [setSteps]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading rubrics...</div>
            </div>
        );
    }
    return (
        <>
            <TourAlertDialog isOpen={openTour} setIsOpen={setOpenTour} showCloseButton={true} />
            <div className="space-y-6">
                <div className="flex items-center justify-between" id={RUBRIC_STEP_IDS.RUBRIC_INTRODUCTION}>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Rubrics</h1>
                        <p className="text-muted-foreground">
                            Manage rubrics for this assignment
                        </p>
                    </div>
                    <Button onClick={handleCreate} id={RUBRIC_STEP_IDS.ADD_RUBRIC_BUTTON}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Rubric
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {data?.content.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-semibold">No rubrics found</h3>
                                    <p className="text-muted-foreground">
                                        Get started by creating your first rubric.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        data?.content.map((rubric) => (
                            <Card key={rubric.id} className="hover:shadow-md transition-shadow" id={RUBRIC_STEP_IDS.RUBRIC_CARDS}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-xl">{rubric.name}</CardTitle>
                                            <CardDescription className="mt-1">
                                                {rubric.description}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="secondary" id={RUBRIC_STEP_IDS.POINTS_DISPLAY}>
                                            {rubric.points} pts
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardFooter className="flex justify-end space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(rubric)}
                                        id={RUBRIC_STEP_IDS.EDIT_BUTTON}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(rubric)}
                                        id={RUBRIC_STEP_IDS.DELETE_BUTTON}
                                    >
                                        Delete
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
                <RubricsDialogs />
            </div>
        </>
    );
};


export default Rubrics;