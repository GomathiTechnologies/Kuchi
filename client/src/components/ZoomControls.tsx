import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export default function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: ZoomControlsProps) {
  return (
    <div className="flex flex-col gap-2 p-2 bg-card/95 backdrop-blur-md border border-card-border rounded-md shadow-lg">
      <Button
        size="icon"
        variant="ghost"
        onClick={onZoomIn}
        data-testid="button-zoom-in"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <div className="text-xs text-center font-medium px-1" data-testid="text-zoom-level">
        {Math.round(zoom * 100)}%
      </div>
      <Button
        size="icon"
        variant="ghost"
        onClick={onZoomOut}
        data-testid="button-zoom-out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={onResetZoom}
        data-testid="button-reset-zoom"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
