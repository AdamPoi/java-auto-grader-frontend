import { type LucideProps } from 'lucide-react';
import { type FC } from 'react';

export type BlockType = 'FUNCTION' | 'TEST_CASE_FUNCTION' | 'VARIABLE' | 'ASSERT_THAT'
    | 'EXCEPTION_ASSERT' | 'STATIC_ASSERT' | 'STRUCTURE_CHECK'
    | 'COMMENT' | 'TEMPLATE_FUNCTION' | 'CASE_SOURCE' | 'FUNCTION_TEST' | & MatcherBlockType;

export type MatcherBlockType = 'IS_EQUAL_TO' | 'IS_NOT_EQUAL_TO' | 'IS_NOT_NULL' | 'HAS_SIZE'
    | 'IS_INSTANCE_OF' | 'CONTAINS' | 'CONTAINS_ONLY' | 'CONTAINS_EXACTLY' | 'CONTAINS_EXACTLY_IN_ANY_ORDER'
    | 'CONTAINS_SEQUENCE' | 'CONTAINS_SUBSEQUENCE' | 'CONTAINS_ONLY_ONCE' | 'CONTAINS_ANY_OF'
    | 'DOES_NOT_CONTAIN' | 'EXTRACTING' | 'MATCHES' | 'STARTS_WITH' | 'ENDS_WITH'
    | 'IS_TRUE' | 'IS_FALSE' | 'IS_NULL' | 'IS_NOT_NULL' | 'IS_EMPTY' | 'IS_NOT_EMPTY';

export type StaticAssertType = 'CLASS_EXISTS' | 'FUNCTION_EXISTS' | 'VARIABLE_EXISTS' |
    'FUNCTION_EXISTS_IN_CLASS' | 'VARIABLE_EXISTS_IN_CLASS' | 'VARIABLE_EXISTS_IN_FUNCTION'
    | 'VARIABLE_CALLED_IN_FUNCTION' | 'VARIABLE_CALLED_IN_CLASS';

export type StructureType = 'HAS_LOOP' | 'HAS_CONDITIONAL' |
    'HAS_PARAMETER' | 'HAS_RETURN';

export interface BaseBlock {
    id: string;
    parentId: string | null;
    type: BlockType;
}
export interface FunctionBlock extends BaseBlock {
    type: 'FUNCTION';
    funcName: string;
    rubricId?: string | null;
}

export interface FunctionTestBlock extends BaseBlock {
    id: string;
    type: 'FUNCTION_TEST';
    className: string;
    methodName: string;
    parameters: Array<{ name: string; varType: string, value: string }>;
    expected: { name: string; varType: string, value: string };
}



export type CaseData = {
    inputs: string;
    expected: string;
}
export interface TestCaseFunctionBlock extends BaseBlock {
    type: 'TEST_CASE_FUNCTION';
    funcName: string; rubricId?: string | null;
    methodName?: string;
    inputs?: string;
    expected?: string;
}
export interface VariableBlock extends BaseBlock {
    type: 'VARIABLE'; varType: string; varName: string; value: string;
}
export interface AssertThatBlock extends BaseBlock {
    type: 'ASSERT_THAT'; target: string;
}
export interface ExceptionAssertBlock extends BaseBlock {
    type: 'EXCEPTION_ASSERT'; exceptionType: string; code: string;
}
export interface StaticAssertBlock extends BaseBlock {
    type: 'STATIC_ASSERT'; checkType: StaticAssertType; varName: string; className?: string; methodName?: string;
}
export interface StructureCheckBlock extends BaseBlock {
    type: 'STRUCTURE_CHECK'; checkType: StructureType;
    varType?: string;
    varName?: string;
    value?: string;
    className?: string;
    methodName?: string;
}
export interface CommentBlock extends BaseBlock {
    type: 'COMMENT';
    value: string;
}
export interface MatcherBlock extends BaseBlock { value?: string; }


export interface CaseSourceBlock extends BaseBlock {
    type: 'CASE_SOURCE'
    name: string
    parameters: { name: string }[]
    cases: string[][]
}


export type Block =
    FunctionBlock | VariableBlock
    | AssertThatBlock | ExceptionAssertBlock | StaticAssertBlock
    | StructureCheckBlock | CommentBlock | MatcherBlock
    | CaseSourceBlock | FunctionTestBlock;

export type OmittedBlock = Omit<FunctionBlock, 'id' | 'parentId'>
    | Omit<TestCaseFunctionBlock, 'id' | 'parentId'>
    | Omit<VariableBlock, 'id' | 'parentId'>
    | Omit<AssertThatBlock, 'id' | 'parentId'>
    | Omit<ExceptionAssertBlock, 'id' | 'parentId'>
    | Omit<StaticAssertBlock, 'id' | 'parentId'>
    | Omit<StructureCheckBlock, 'id' | 'parentId'>
    | Omit<CommentBlock, 'id' | 'parentId'>
    | Omit<MatcherBlock, 'id' | 'parentId'>
    | Omit<CaseSourceBlock, 'id' | 'parentId'>
    | Omit<FunctionTestBlock, 'id' | 'parentId'>
    ;

export type OmittedFunctionBlock = Omit<FunctionBlock, 'id' | 'parentId' | 'rubricId'>

export type AnyBlock = Block | TemplateFunction;

export interface RubricItem { id: string; name: string; points: number; }
export interface SourceFile { name: string; content: string; }
export interface TestSuite { id: string; name: string; blocks: Block[]; }

export type TemplateFunction = {
    type: 'TEMPLATE_FUNCTION';
    templateName: string;
    icon: FC<LucideProps>;
    func: OmittedFunctionBlock;
    children: Array<any>;
};

export interface HistoricalState {
    testSuites: TestSuite[];
    activeSuiteId: string;
    rubrics: RubricItem[];
    sourceFiles: SourceFile[];
}

export interface AppState extends HistoricalState {
    history: HistoricalState[];
    historyIndex: number;
}

export interface AppActions {
    addBlock: (payload: { suiteId: string; block: Omit<AnyBlock, 'id' | 'parentId'>; parentId: string | null; overId: string | null; }) => void;
    addTemplate: (payload: { suiteId: string; template: TemplateFunction; overId: string | null; }) => void;
    moveBlock: (payload: { suiteId: string; activeId: string; overId: string; }) => void;
    removeBlock: (payload: { suiteId: string; id: string; }) => void;
    updateBlockData: (payload: { suiteId: string; id: string; field: string; value: any; }) => void;
    setSuiteBlocks: (payload: { suiteId: string; blocks: Block[] }) => void;
    addRubricItem: (payload?: { id?: string, name?: string; points?: number }) => void;
    updateRubricItem: (payload: { id: string; name: string; points: number; }) => void;
    removeRubricItem: (payload: { id: string; }) => void;
    setSourceFiles: (payload: SourceFile[]) => void;
    addTestSuite: () => void;
    setActiveSuite: (payload: string) => void;
    updateSuiteName: (payload: { id: string; name: string }) => void;
    setRubrics: (payload: RubricItem[]) => void;
    undo: () => void;
    redo: () => void;
    _commit: () => void;
}