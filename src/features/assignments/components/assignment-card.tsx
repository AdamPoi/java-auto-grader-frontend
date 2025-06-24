import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import type { Assignment } from "../data/types";

interface AssignmentCardProps {
    assignment: Assignment;
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
    const navigate = useNavigate();
    return (
        <Card className="flex flex-col bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
            <CardHeader>
                <CardTitle className="text-base font-bold tracking-tight">{assignment.title}</CardTitle>
                <CardDescription className="text-xs">Due: {new Date(assignment.dueDate ? assignment.dueDate : '').toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                    {/* <Badge className={statusStyles[assignment.status] || ''}>
                        {assignment.status === 'Graded' && <CheckCircle2 className="mr-1.5 h-3 w-3" />}
                        {assignment.status.includes('Submitted') && <FileText className="mr-1.5 h-3 w-3" />}
                        {assignment.status.includes('Pending') && <Clock className="mr-1.5 h-3 w-3" />}
                        {assignment.status}
                    </Badge> */}
                    {/* {assignment.grade && (
                        <div className="text-sm font-bold text-foreground">Grade: <span className="text-primary">{assignment.grade}</span></div>
                    )} */}
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" variant="outline" size="sm" onClick={() => navigate({
                    to: `/app/assignments/${assignment.id}`,
                })}>
                    {/* {assignment.status.includes('Submitted') ? 'View Submission' : 'View Assignment'} */}
                    View Assignment
                </Button>
            </CardFooter>
        </Card>
    );
}