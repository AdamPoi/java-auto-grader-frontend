import { type LucideProps } from 'lucide-react';
import { type FC } from 'react';

export type BlockType = 'FUNCTION' | 'ANALYZE_FUNCTION' | 'VARIABLE' | 'ASSERT_THAT'
    | 'EXCEPTION_ASSERT' | 'STATIC_ASSERT' | 'STRUCTURE_CHECK'
    | 'COMMENT' | 'IS_EQUAL_TO' | 'IS_NOT_NULL' | 'HAS_LENGTH'
    | 'IS_INSTANCE_OF' | 'CONTAINS' | 'DOES_NOT_CONTAIN'
    | 'EXTRACTING' | 'MATCHES' | 'STARTS_WITH' | 'ENDS_WITH'
    | 'TEMPLATE_FUNCTION';

export type StaticAssertType = 'CLASS_EXISTS' | 'FUNCTION_EXISTS' | 'VARIABLE_EXISTS' |
    'FUNCTION_EXISTS_IN_CLASS' | 'VARIABLE_EXISTS_IN_CLASS' | 'VARIABLE_EXISTS_IN_FUNCTION'
    | 'VARIABLE_CALLED_IN_FUNCTION' | 'VARIABLE_CALLED_IN_CLASS';

export type StructureType = 'HAS_LOOP' | 'HAS_CONDITIONAL' | 'HAS_VARIABLE' |
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
export interface AnalyzeFunctionBlock extends BaseBlock {
    type: 'ANALYZE_FUNCTION'; funcName: string; rubricId?: string | null;
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

export type Block = FunctionBlock | AnalyzeFunctionBlock | VariableBlock | AssertThatBlock | ExceptionAssertBlock | StaticAssertBlock | StructureCheckBlock | CommentBlock | MatcherBlock;

export type OmittedBlock = Omit<FunctionBlock, 'id' | 'parentId'>
    | Omit<AnalyzeFunctionBlock, 'id' | 'parentId'>
    | Omit<VariableBlock, 'id' | 'parentId'>
    | Omit<AssertThatBlock, 'id' | 'parentId'>
    | Omit<ExceptionAssertBlock, 'id' | 'parentId'>
    | Omit<StaticAssertBlock, 'id' | 'parentId'>
    | Omit<StructureCheckBlock, 'id' | 'parentId'>
    | Omit<CommentBlock, 'id' | 'parentId'>
    | Omit<MatcherBlock, 'id' | 'parentId'>;

export type AnyBlock = Block | TemplateFunction;

export interface RubricItem { id: string; name: string; points: number; }
export interface SourceFile { name: string; content: string; }
export interface TestSuite { id: string; name: string; blocks: Block[]; }

export type TemplateFunction = {
    type: 'TEMPLATE_FUNCTION';
    templateName: string;
    icon: FC<LucideProps>;
    func: Omit<FunctionBlock, 'id' | 'parentId' | 'rubricId'> | Omit<AnalyzeFunctionBlock, 'id' | 'parentId' | 'rubricId'>;
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