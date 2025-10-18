import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Pen, Eraser, Circle, Trash2, Square, Type, Download, Image as ImageIcon, ArrowRight } from 'lucide-react';

interface DrawingToolbarProps {
  currentTool: 'pen' | 'eraser' | 'text' | 'rectangle' | 'circle' | 'square' | 'arrow';
  currentColor: string;
  currentWidth: number;
  onToolChange: (tool: 'pen' | 'eraser' | 'text' | 'rectangle' | 'circle' | 'square' | 'arrow') => void;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  onClear: () => void;
  onDownload: () => void;
  onImageUpload: (file: File) => void;
}

const PRESET_COLORS = [
  '#000000',
  '#3b82f6',
  '#ef4444',
  '#22c55e',
  '#eab308',
  '#a855f7',
  '#ec4899',
  '#f97316',
];

export default function DrawingToolbar({
  currentTool,
  currentColor,
  currentWidth,
  onToolChange,
  onColorChange,
  onWidthChange,
  onClear,
  onDownload,
  onImageUpload,
}: DrawingToolbarProps) {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
    e.target.value = '';
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-card/95 backdrop-blur-md border border-card-border rounded-full shadow-lg">
      <Button
        size="icon"
        variant={currentTool === 'pen' ? 'default' : 'ghost'}
        onClick={() => onToolChange('pen')}
        data-testid="button-tool-pen"
      >
        <Pen className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        variant={currentTool === 'eraser' ? 'default' : 'ghost'}
        onClick={() => onToolChange('eraser')}
        data-testid="button-tool-eraser"
      >
        <Eraser className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        variant={currentTool === 'text' ? 'default' : 'ghost'}
        onClick={() => onToolChange('text')}
        data-testid="button-tool-text"
      >
        <Type className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button
        size="icon"
        variant={currentTool === 'rectangle' ? 'default' : 'ghost'}
        onClick={() => onToolChange('rectangle')}
        data-testid="button-tool-rectangle"
      >
        <Square className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        variant={currentTool === 'circle' ? 'default' : 'ghost'}
        onClick={() => onToolChange('circle')}
        data-testid="button-tool-circle"
      >
        <Circle className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        variant={currentTool === 'arrow' ? 'default' : 'ghost'}
        onClick={() => onToolChange('arrow')}
        data-testid="button-tool-arrow"
      >
        <ArrowRight className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="relative"
            data-testid="button-color-picker"
          >
            <Circle className="h-4 w-4" style={{ color: currentColor, fill: currentColor }} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48">
          <div className="space-y-3">
            <p className="text-sm font-medium">Color</p>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  className="w-10 h-10 rounded-md border-2 hover-elevate active-elevate-2"
                  style={{
                    backgroundColor: color,
                    borderColor: currentColor === color ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                  }}
                  onClick={() => onColorChange(color)}
                  data-testid={`button-color-${color}`}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button size="icon" variant="ghost" data-testid="button-width-picker">
            <div
              className="rounded-full bg-foreground"
              style={{ width: `${Math.max(4, currentWidth)}px`, height: `${Math.max(4, currentWidth)}px` }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56">
          <div className="space-y-3">
            <p className="text-sm font-medium">Stroke Width</p>
            <Slider
              value={[currentWidth]}
              onValueChange={([value]) => onWidthChange(value)}
              min={1}
              max={20}
              step={1}
              data-testid="slider-stroke-width"
            />
            <p className="text-xs text-muted-foreground text-center">{currentWidth}px</p>
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-6" />

      <label htmlFor="image-upload">
        <Button
          size="icon"
          variant="ghost"
          asChild
          data-testid="button-upload-image"
        >
          <div>
            <ImageIcon className="h-4 w-4" />
          </div>
        </Button>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </label>

      <Button
        size="icon"
        variant="ghost"
        onClick={onDownload}
        data-testid="button-download"
      >
        <Download className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={onClear}
        data-testid="button-clear-canvas"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
