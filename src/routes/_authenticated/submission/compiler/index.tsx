import { createFileRoute, redirect } from '@tanstack/react-router';


import CodeCompiler from '@/features/submission/components/code-compiler';
import CodeTerminal from '@/features/submission/components/CodeTerminal';
import { useAuthStore } from '@/stores/auth.store';

export const Route = createFileRoute('/_authenticated/submission/compiler/')({
  component: CodeTerminal,
  beforeLoad: async () => {
    const { auth } = await useAuthStore.getState()

    if (!auth.hasPermission(['ROLE:CREATE'])) {
      throw redirect({
        to: '/403',
      })
    }
  }
});

function CompilerPage() {

  const handleRun = () => {
    // Logic to run the code
    console.log("Running code:");

  }
  return (
    <div className="h-screen flex flex-col">
      <div className="flex gap-2 p-4 border-b">

        <button
          onClick={handleRun}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Run
        </button>
      </div>
      <div className="flex-1">
        {/* <div ref={editorRef} className="h-full w-full" /> */}
        {/* <Editor
          value={code}
          width="100%"
          height="50vh"
          language="java"
          theme="vs-dark"
        /> */}

        {/* <CodeCompiler /> */}
        {/* <CodeTerminal /> */}
      </div>
    </div>
  );
}

