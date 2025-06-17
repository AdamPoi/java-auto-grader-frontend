import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { SearchRequestParams } from '@/types/api.types';
import { Plus } from 'lucide-react';
import React, { useEffect } from 'react';
import { RubricsDialogs } from './components/rubrics-dialogs';
import { useRubricsContext } from './context/rubrics-context';
import type { Rubric } from './data/types';
import { useRubrics } from './hooks/use-rubric';

interface RubricPageProps {
    assignmentId: string;
}

const Rubrics: React.FC<RubricPageProps> = ({ assignmentId }) => {
    const { setOpen, setRubric } = useRubricsContext()


    const searchParams: SearchRequestParams = {
        page: 0,
        size: 1000,
        filter: '',
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

    useEffect(() => {
        if (data?.content.length === 0) {

        }
    }, [data]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading rubrics...</div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Rubrics</h1>
                        <p className="text-muted-foreground">
                            Manage rubrics for this assignment
                        </p>
                    </div>
                    <Button onClick={handleCreate}>
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
                            <Card key={rubric.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-xl">{rubric.name}</CardTitle>
                                            <CardDescription className="mt-1">
                                                {rubric.description}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="secondary">
                                            {rubric.maxPoints} pts
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardFooter className="flex justify-end space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(rubric)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(rubric)}
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