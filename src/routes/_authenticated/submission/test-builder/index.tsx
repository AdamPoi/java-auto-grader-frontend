import { Canvas } from '@/features/test-builder/components/Canvas';
import { CodePreview } from '@/features/test-builder/components/CodePreview';
import { Palette } from '@/features/test-builder/components/Palette';
import { useTestBuilderStore } from '@/features/test-builder/hooks/useTestBuilderStore';
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { createFileRoute } from '@tanstack/react-router';


export const Route = createFileRoute(
  '/_authenticated/submission/test-builder/',
)({
  component: TestBuilderComponent,
})


function TestBuilderComponent() {
  const { handleDragEnd } = useTestBuilderStore();
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 8 }
  }));

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[300px_1fr_0.8fr] h-screen bg-gray-50 gap-4 p-4">
        <Palette />
        <Canvas />
        <CodePreview />
      </div>
    </DndContext>
  );
}


