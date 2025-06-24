import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SearchRequestParams } from '@/types/api.types';
import { useParams } from '@tanstack/react-router';
import { useAssignmentById } from '../assignments/hooks/use-assignment';
import CodeEditor from '../code-editor';
import { useRubrics } from '../rubrics/hooks/use-rubric';
import { RubricView } from './components/rubric-view';


function StudentSubmission() {
    const { assignmentId } = useParams({ from: '/_authenticated/admin/student-submissions/$assignmentId' });
    const { data: assignment, isLoading: isLoadingAssignment } = useAssignmentById(assignmentId);

    const searchParams: SearchRequestParams = {
        page: 0,
        size: 1000,
        filter: `assignment=eq:${assignmentId}`,
    };
    const { data: rubrics, isLoading: isLoadingRubrics } = useRubrics(searchParams,);




    return (
        <Tabs defaultValue="editor" className="flex flex-col flex-grow">
            <div className="flex-shrink-0 bg-white border-b border-slate-200 px-4">
                <TabsList className="bg-transparent p-0 border-none">
                    <TabsTrigger value="editor" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Editor Kode</TabsTrigger>
                    <TabsTrigger value="rubric" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Deskripsi & Rubrik</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="editor" className="flex-grow flex overflow-hidden m-0">
                {/* <FileExplorer /> */}
                <div className="flex flex-col flex-grow">
                    <CodeEditor />
                </div>
            </TabsContent>
            <TabsContent value="rubric" className="flex-grow overflow-hidden m-0">
                <RubricView assignment={assignment} rubric={rubrics} />
            </TabsContent>
        </Tabs>
    );
}

export default StudentSubmission;