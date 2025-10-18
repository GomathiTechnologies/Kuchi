import ZoomControls from '../ZoomControls';
import { useState } from 'react';

export default function ZoomControlsExample() {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="flex items-center justify-center p-8">
      <ZoomControls
        zoom={zoom}
        onZoomIn={() => setZoom(z => Math.min(z + 0.1, 3))}
        onZoomOut={() => setZoom(z => Math.max(z - 0.1, 0.5))}
        onResetZoom={() => setZoom(1)}
      />
    </div>
  );
}
