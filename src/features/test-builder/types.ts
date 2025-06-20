interface Block {
    type: string;
    id: string;
    parentId?: string;
}

interface FunctionBlock extends Block {
    type: 'FUNCTION';
    funcName: string;
    funcBody: string;
}

interface VariableBlock extends Block {
    type: 'VARIABLE';
    varName: string;
    varType: string;
    value: string;
}

interface AssertThatBlock extends Block {
    type: 'ASSERT_THAT';
    target: string;
}

interface ExceptionAssertBlock extends Block {
    type: 'EXCEPTION_ASSERT';
    exceptionType: string;
    code: string;
}

interface StaticAssertBlock extends Block {
    type: 'STATIC_ASSERT';
    checkType: string;
    value?: string;
    className?: string;
    methodName?: string;
}

interface StructureCheckBlock extends Block {
    type: 'STRUCTURE_CHECK';
    checkType: string;
}

export type { AssertThatBlock, Block, ExceptionAssertBlock, FunctionBlock, StaticAssertBlock, StructureCheckBlock, VariableBlock };
