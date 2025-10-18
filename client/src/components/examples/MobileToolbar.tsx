import MobileToolbar from '../MobileToolbar';
import { useState } from 'react';

export default function MobileToolbarExample() {
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'text' | 'rectangle' | 'circle' | 'square' | 'arrow'>('pen');
  const [currentColor, setCurrentColor] = useState('#3b82f6');

  return (
    <div className="relative h-screen bg-background">
      <MobileToolbar
        currentTool={currentTool}
        currentColor={currentColor}
        onToolChange={setCurrentTool}
        onColorChange={setCurrentColor}
        onShowUsers={() => console.log('Show users')}
        onClear={() => console.log('Clear canvas')}
        onDownload={() => console.log('Download canvas')}
      />
    </div>
  );
}
