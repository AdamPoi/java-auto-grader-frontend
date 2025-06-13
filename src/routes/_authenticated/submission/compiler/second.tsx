import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useRef, useState } from 'react';


import { useAuthStore } from '@/stores/auth.store';

import * as monaco from 'monaco-editor';
import MonacoEditor from "react-monaco-editor";

export const Route = createFileRoute('/_authenticated/submission/compiler/second')({
  component: CompilerPage,
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
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const [code, setCode] = useState<string>(`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`);
  const options: monaco.editor.IStandaloneEditorConstructionOptions = {
    selectOnLineNumbers: true,
    automaticLayout: true,
    fontSize: 14,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    wordWrap: "on",

  }

  // useEffect(() => {
  //   if (editorRef.current && !monacoEditorRef.current) {
  //     monacoEditorRef.current = monaco.editor.create(editorRef.current, {
  //       value: `public class Main {
  //         public static void main(String[] args) {
  //             System.out.println("Hello, World!");
  //         }
  //     }`,
  //       language: 'java',
  //       theme: 'vs-dark',
  //       automaticLayout: true,
  //       fontSize: 14,
  //       minimap: { enabled: true },
  //       scrollBeyondLastLine: false,
  //       wordWrap: 'on'
  //     });
  //   }


  //   return () => {
  //     if (monacoEditorRef.current) {
  //       monacoEditorRef.current.dispose();
  //       monacoEditorRef.current = null;
  //     }
  //   };
  // }, []);

  const handleCompile = () => {
    if (monacoEditorRef.current) {
      const code = monacoEditorRef.current.getValue();
      console.log('Java code to compile:', code);
      // Add your compilation logic here
    }
  };

  const handleRun = () => {
    if (monacoEditorRef.current) {
      const code = monacoEditorRef.current.getValue();
      console.log('Java code to run:', code);
      // Add your execution logic here
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex gap-2 p-4 border-b">
        <button
          onClick={handleCompile}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Compile
        </button>
        <button
          onClick={handleRun}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Run
        </button>
      </div>
      <div className="flex-1">
        {/* <div ref={editorRef} className="h-full w-full" /> */}
        <MonacoEditor
          value={code}
          onChange={(newValue) => setCode(newValue)}
          width="100%"
          height="50vh"
          language="java"
          theme="vs-dark"
          options={options}
        />
      </div>
    </div>
  );
}