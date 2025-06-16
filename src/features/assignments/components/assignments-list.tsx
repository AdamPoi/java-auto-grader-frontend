import type { Assignment } from "../data/types";
import { AssignmentCard } from "./assignment-card";

interface AssignmentsListProps {
    assignments: Assignment[];
}

export function AssignmentsList({ assignments }: AssignmentsListProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {assignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
        </div>
    );
}