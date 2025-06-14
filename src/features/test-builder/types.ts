
import { AllIcons } from './components/icons';

export type BlockType =
    | 'FUNCTION' | 'ANALYZE_FUNCTION' | 'VARIABLE' | 'ASSERT_THAT'
    | 'EXCEPTION_ASSERT' | 'STATIC_ASSERT' | 'STRUCTURE_CHECK'
    | 'COMMENT' | 'IS_EQUAL_TO' | 'IS_NOT_NULL' | 'HAS_LENGTH'
    | 'IS_INSTANCE_OF' | 'CONTAINS' | 'DOES_NOT_CONTAIN'
    | 'EXTRACTING' | 'MATCHES' | 'STARTS_WITH' | 'ENDS_WITH'
    | 'TEMPLATE_FUNCTION';

export interface BaseBlock {
    id: string;
    parentId: string | null;
    type: BlockType;
}

export interface FunctionBlock extends BaseBlock { type: 'FUNCTION'; funcName: string; }
export interface AnalyzeFunctionBlock extends BaseBlock { type: 'ANALYZE_FUNCTION'; funcName: string; }
export interface VariableBlock extends BaseBlock { type: 'VARIABLE'; varType: string; varName: string; value: string; }
export interface AssertThatBlock extends BaseBlock { type: 'ASSERT_THAT'; target: string; }
export interface ExceptionAssertBlock extends BaseBlock { type: 'EXCEPTION_ASSERT'; exceptionType: string; code: string; }
export interface StaticAssertBlock extends BaseBlock { type: 'STATIC_ASSERT'; checkType: 'CLASS_EXISTS' | 'FUNCTION_EXISTS' | 'VARIABLE_EXISTS'; value: string; }
export interface StructureCheckBlock extends BaseBlock { type: 'STRUCTURE_CHECK'; checkType: 'HAS_FOR_LOOP' | 'HAS_VARIABLE' | 'HAS_PARAMETER' | 'RETURNS_TYPE' | 'CALLS_METHOD' | 'USES_CONCATENATION'; varType?: string; varName?: string; value?: string }
export interface CommentBlock extends BaseBlock { type: 'COMMENT'; value: string; }
export interface MatcherBlock extends BaseBlock { value: string; }

export type Block = FunctionBlock | AnalyzeFunctionBlock | VariableBlock | AssertThatBlock | ExceptionAssertBlock | StaticAssertBlock | StructureCheckBlock | CommentBlock | MatcherBlock;
export type AnyBlock = Block | TemplateFunction;

// Map icon names to actual components for easier lookup
export type IconName = keyof typeof AllIcons;

export type TemplateFunction = {
    type: 'TEMPLATE_FUNCTION';
    templateName: string;
    icon: IconName;
    func: Omit<FunctionBlock, 'id' | 'parentId'> | Omit<AnalyzeFunctionBlock, 'id' | 'parentId'>;
    children: Array<Omit<AnyBlock, 'id' | 'parentId'> & { children?: Array<Omit<AnyBlock, 'id' | 'parentId'>> }>;
};

export type PaletteBlockData = Omit<Block, 'id' | 'parentId'>;
export type AnyPaletteBlock = PaletteBlockData | TemplateFunction;