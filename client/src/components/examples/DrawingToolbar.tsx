import DrawingToolbar from '../DrawingToolbar';
import { useState } from 'react';

export default function DrawingToolbarExample() {
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'text' | 'rectangle' | 'circle' | 'square' | 'arrow'>('pen');
  const [currentColor, setCurrentColor] = useState('#3b82f6');
  const [currentWidth, setCurrentWidth] = useState(3);

  return (
    <div className="flex items-center justify-center p-8">
      <DrawingToolbar
        currentTool={currentTool}
        currentColor={currentColor}
        currentWidth={currentWidth}
        onToolChange={setCurrentTool}
        onColorChange={setCurrentColor}
        onWidthChange={setCurrentWidth}
        onClear={() => console.log('Clear canvas')}
        onDownload={() => console.log('Download canvas')}
        onImageUpload={(file) => console.log('Upload image:', file.name)}
      />
    </div>
  );
}
