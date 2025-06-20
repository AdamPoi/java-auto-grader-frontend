import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Assignments from '@/features/assignments';
import TryOutTab from '@/features/try-out/components/try-out-tab';
import { createFileRoute } from '@tanstack/react-router';

function AssignmentsPage() {
    return (
        <Tabs defaultValue="assignments" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                <TabsTrigger value="try-out">Try Out</TabsTrigger>
            </TabsList>
            <TabsContent value="assignments">
                <Assignments />
            </TabsContent>
            <TabsContent value="try-out">
                <TryOutTab />
            </TabsContent>
        </Tabs>
    );
}

export const Route = createFileRoute(
    '/_authenticated/courses/$courseId/assignments/',
)({
    component: AssignmentsPage,
});


