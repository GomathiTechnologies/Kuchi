import WhiteboardCanvas from '../WhiteboardCanvas';
import { useState } from 'react';
import { DrawingStroke, ActiveUser } from '@shared/schema';

export default function WhiteboardCanvasExample() {
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [currentColor] = useState('#3b82f6');
  const [currentWidth] = useState(3);

  const handleStrokeComplete = (stroke: DrawingStroke) => {
    setStrokes(prev => [...prev, stroke]);
    console.log('Stroke completed:', stroke);
  };

  const activeUsers: ActiveUser[] = [
    { id: 'user-1', username: 'You', color: '#3b82f6' },
  ];

  return (
    <div className="w-full h-screen">
      <WhiteboardCanvas
        strokes={strokes}
        images={[]}
        texts={[]}
        shapes={[]}
        activeUsers={activeUsers}
        currentUserId="user-1"
        currentColor={currentColor}
        currentWidth={currentWidth}
        currentTool="pen"
        onStrokeComplete={handleStrokeComplete}
        onTextAdd={(text) => console.log('Text added:', text)}
        onShapeAdd={(shape) => console.log('Shape added:', shape)}
      />
    </div>
  );
}
