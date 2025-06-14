import { Construction, FunctionSquare, Puzzle, TestTube2, Variable } from 'lucide-react';
import React from 'react';
import { INITIAL_PALETTE_BLOCKS } from '../data/constants';
import { PaletteBlock } from './PaletteBlock';

export const Palette: React.FC = () => {
    return (
        <aside className="w-full md:w-72 p-4 bg-white border-r border-gray-200 flex flex-col">
            <h2 className="text-xl font-bold mb-6 flex items-center text-gray-700"><Puzzle className="mr-2 text-blue-500" />Blocks</h2>
            <div className="flex-grow overflow-y-auto pr-2">
                <h3 className="font-semibold mb-3 mt-2 text-gray-500 flex items-center text-sm uppercase tracking-wider"><Puzzle className="mr-2 h-5 w-5" />Templates</h3>
                {INITIAL_PALETTE_BLOCKS.templates.map((block, index) => <PaletteBlock key={`tmpl-${index}`} blockData={block} blockType={`tmpl-${index}`} />)}
                <h3 className="font-semibold mb-3 mt-6 text-gray-500 flex items-center text-sm uppercase tracking-wider"><FunctionSquare className="mr-2 h-5 w-5" />Functions</h3>
                {INITIAL_PALETTE_BLOCKS.functions.map((block, index) => <PaletteBlock key={`func-${index}`} blockData={block} blockType={`func-${index}`} />)}
                <h3 className="font-semibold mb-3 mt-6 text-gray-500 flex items-center text-sm uppercase tracking-wider"><Variable className="mr-2 h-5 w-5" />Setup</h3>
                {INITIAL_PALETTE_BLOCKS.setup.map((block, index) => <PaletteBlock key={`setup-${index}`} blockData={block} blockType={`setup-${index}`} />)}
                <h3 className="font-semibold mb-3 mt-6 text-gray-500 flex items-center text-sm uppercase tracking-wider"><TestTube2 className="mr-2 h-5 w-5" />Assertions</h3>
                {INITIAL_PALETTE_BLOCKS.assertions.map((block, index) => <PaletteBlock key={`assertion-${index}`} blockData={block} blockType={`assertion-${index}`} />)}
                <h3 className="font-semibold mb-3 mt-6 text-gray-500 flex items-center text-sm uppercase tracking-wider"><Construction className="mr-2 h-5 w-5" />Structure</h3>
                {INITIAL_PALETTE_BLOCKS.structure.map((block, index) => <PaletteBlock key={`struct-${index}`} blockData={block} blockType={`struct-${index}`} />)}
                <h3 className="font-semibold mb-3 mt-6 text-gray-500 flex items-center text-sm uppercase tracking-wider"><Puzzle className="mr-2 h-5 w-5" />Matchers</h3>
                {INITIAL_PALETTE_BLOCKS.matchers.map((block, index) => <PaletteBlock key={`matcher-${index}`} blockData={block} blockType={`matcher-${index}`} />)}
            </div>
        </aside>
    );
};