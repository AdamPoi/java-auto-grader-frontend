import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Import hooks
import useCodeIntel from '../hooks/useCodeIntel';
import useDebounce from '../hooks/useDebounce';
import useFileManagement, { type FileData } from '../hooks/useFileManagement';
import useJavaSimulator from '../hooks/useJavaSimulator';

// Import UI components
import Modal from './Modal';
import MonacoEditor from './MonacoEditor';
import Tabs from './Tabs';
import TabsList from './TabsList';
import TabsTrigger from './TabsTrigger';
import Terminal from './Terminal';

const initialFilesData: FileData[] = [{ fileName: "Main.java", content: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Dog myDog = new Dog("Buddy", 3, "Golden Retriever");\n        myDog.displayInfo();\n\n        System.out.println("\\n--- Error Handling Demo ---");\n        try {\n            System.out.println("Attempting to divide by zero...");\n            int result = 10 / 0;\n            System.out.println("This will not be printed.");\n        } catch (ArithmeticException e) {\n            System.err.println("SUCCESS: Caught an exception as expected!");\n            System.err.println(e.getMessage());\n        }\n\n        System.out.println("\\nExecution continues after the catch block.");\n    }\n}` }, { fileName: "Animal.java", content: `public class Animal {\n    protected String name;\n    public int age;\n    public Animal(String name, int age) { this.name = name; this.age = age; }\n    public void makeSound() { System.out.println(name + " makes a sound"); }\n    public void displayInfo() { System.out.println("Name: " + name + ", Age: " + age); }\n    public static void showAnimalCount() { System.out.println("Animals are amazing creatures!"); }\n}` }, { fileName: "Dog.java", content: `public class Dog extends Animal {\n    private String breed;\n    public Dog(String name, int age, String breed) { super(name, age); this.breed = breed; }\n    @Override\n    public void makeSound() { System.out.println(name + " barks: Woof! Woof!"); }\n    @Override\n    public void displayInfo() { super.displayInfo(); System.out.println("Breed: " + breed); }\n    public void fetch() { System.out.println(name + " is fetching the ball!"); }\n    public static void dogFacts() { System.out.println("Dogs are loyal companions!"); }\n}` }, { fileName: "Cat.java", content: `public class Cat extends Animal {\n    private String furColor;\n    public Cat(String name, int age, String furColor) { super(name, age); this.furColor = furColor; }\n    @Override\n    public void makeSound() { System.out.println(name + " meows."); }\n    public void purr() { System.out.println(name + " is purring."); }\n}` }];


export default function CodeTerminal() {
    const { files, activeFileName, setActiveFileName, handleCreateFile, handleRenameFile, handleDeleteFile, handleEditorChange } = useFileManagement(initialFilesData);
    const debouncedFiles = useDebounce(files, 500);
    const { intel, errors, validateFile } = useCodeIntel(debouncedFiles);
    const { terminalOutput, isRunning, isAwaitingInput, terminalInputValue, setTerminalInputValue, clearTerminal, runCode, onInputSubmit } = useJavaSimulator();

    const [modal, setModal] = useState<{ type: 'create' | 'rename' | 'delete'; payload: string } | null>(null);
    const [fileNameInput, setFileNameInput] = useState('');
    const [modalError, setModalError] = useState('');
    const [terminalHeight, setTerminalHeight] = useState(256);
    const isResizingRef = useRef(false);

    const activeFile = useMemo(() => files.find(f => f.fileName === activeFileName), [files, activeFileName]);

    useEffect(() => {
        validateFile(activeFile);
    }, [activeFile, validateFile]);

    const handleMouseDown = (e: React.MouseEvent) => { isResizingRef.current = true; };
    const handleMouseUp = (e: MouseEvent) => { isResizingRef.current = false; };
    const handleMouseMove = useCallback((e: MouseEvent) => { if (isResizingRef.current) setTerminalHeight(window.innerHeight - e.clientY); }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove]);

    const showModal = (type: 'create' | 'rename' | 'delete', payload: string = '') => {
        setFileNameInput(payload);
        setModalError('');
        setModal({ type, payload });
    };

    const handleModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const name = fileNameInput.trim();

        if (!name) {
            setModalError('File name cannot be empty.');
            return;
        }

        if (modal?.type === 'create') {
            if (files.some(f => f.fileName === name)) {
                setModalError(`A file named "${name}" already exists.`);
                return;
            }
            handleCreateFile(name);
        } else if (modal?.type === 'rename') {
            if (name !== modal.payload && files.some(f => f.fileName === name)) {
                setModalError(`A file named "${name}" already exists.`);
                return;
            }
            handleRenameFile(modal.payload, name);
        }
        setModal(null);
    };

    return (
        <div className="bg-neutral-900 text-white h-screen flex flex-col font-sans">
            <div className="flex-shrink-0 p-4">
                <header className="mb-4">

                </header>
                <div className="flex items-center space-x-2">
                    <Tabs
                        value={activeFileName}
                        onValueChange={setActiveFileName}
                        className="flex-grow"
                        onDeleteFile={(name) => showModal('delete', name)}
                        onRenameFile={(name) => showModal('rename', name)}
                        filesLength={files.length}
                    >
                        <TabsList>
                            {files.map(f => (
                                <TabsTrigger key={f.fileName} value={f.fileName}>
                                    {f.fileName}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                    <button onClick={() => showModal('create')} disabled={isRunning} className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50" title="Create">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                    <button onClick={() => runCode(files)} disabled={isRunning} className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 bg-green-600 hover:bg-green-500 text-white disabled:opacity-50" title="Run">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        <span className="ml-2">Run</span>
                    </button>
                </div>
            </div>
            <div className="flex-grow flex flex-col min-h-0">
                <div className="flex-grow" style={{ height: `calc(100% - ${terminalHeight}px)` }}>
                    {activeFile ? (
                        <MonacoEditor
                            key={activeFile.fileName}
                            language={"java"}
                            value={activeFile.content || ''}
                            onChange={handleEditorChange}
                            codeIntel={intel}
                            errors={errors}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full bg-neutral-800">
                            <p className="text-neutral-400">No file selected.</p>
                        </div>
                    )}
                </div>
                <div
                    onMouseDown={handleMouseDown}
                    className="flex-shrink-0 h-2 bg-neutral-700 hover:bg-blue-600 cursor-row-resize"
                ></div>
                <div className="flex-shrink-0" style={{ height: `${terminalHeight}px` }}>
                    <Terminal
                        output={terminalOutput}
                        onClear={clearTerminal}
                        isRunning={isRunning}
                        isAwaitingInput={isAwaitingInput}
                        onInputSubmit={onInputSubmit}
                        inputValue={terminalInputValue}
                        onInputChange={setTerminalInputValue}
                    />
                </div>
            </div>

            {modal && modal.type !== 'delete' && (
                <Modal onClose={() => setModal(null)}>
                    <form onSubmit={handleModalSubmit}>
                        <h3 className="text-lg font-semibold mb-4">{modal.type.charAt(0).toUpperCase() + modal.type.slice(1)} File</h3>
                        <label htmlFor="fileNameInput" className="block text-sm mb-2">File Name</label>
                        <input
                            id="fileNameInput"
                            value={fileNameInput}
                            onChange={e => setFileNameInput(e.target.value)}
                            className="bg-neutral-900 border border-neutral-600 rounded-md w-full px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            placeholder="MyClass.java"
                            autoFocus
                        />
                        {modalError && <p className="text-red-400 text-sm mt-2">{modalError}</p>}
                        <div className="flex justify-end space-x-3 mt-6">
                            <button type="button" onClick={() => setModal(null)} className="px-4 py-2 rounded-md bg-neutral-700 hover:bg-neutral-600">Cancel</button>
                            <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500">
                                {modal.type === 'rename' ? 'Save' : 'Create'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {modal?.type === 'delete' && (
                <Modal onClose={() => setModal(null)}>
                    <h3 className="text-lg font-semibold mb-2">Confirm Deletion</h3>
                    <p className="text-neutral-300 mb-6">Are you sure you want to delete <span className="font-semibold text-red-400">{modal.payload}</span>?</p>
                    <div className="flex justify-end space-x-3">
                        <button onClick={() => setModal(null)} className="px-4 py-2 rounded-md bg-neutral-700 hover:bg-neutral-600">Cancel</button>
                        <button
                            onClick={() => {
                                handleDeleteFile(modal.payload);
                                setModal(null);
                            }}
                            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500"
                        >
                            Delete
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}