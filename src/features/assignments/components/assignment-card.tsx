import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import type { Assignment } from "../data/types";

interface AssignmentCardProps {
    assignment: Assignment;
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>{assignment.title}</CardTitle>
                {assignment.course && (
                    <CardDescription className="text-sm text-muted-foreground">
                        Course: {assignment.course.name}
                    </CardDescription>
                )}
                <CardDescription>{assignment.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="flex items-center space-x-4 rounded-md border p-4">
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                            Due Date: {assignment.dueDate || "N/A"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Points: {assignment.totalPoints}
                        </p>
                    </div>
                </div>
                {assignment.isPublished && (
                    <>
                        <Separator className="my-2" />
                        <div className="flex justify-between items-center">
                            <Badge variant="secondary">Published</Badge>
                            {assignment.maxAttempts && (
                                <span className="text-sm text-muted-foreground">
                                    Max Attempts: {assignment.maxAttempts}
                                </span>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
            <CardFooter>
                {assignment.createdByTeacher && (
                    <p className="text-xs text-muted-foreground">
                        Created by: {assignment.createdByTeacher.firstName} {assignment.createdByTeacher.lastName}
                    </p>
                )}
            </CardFooter>
        </Card>
    );
}