import { Button } from '@/components/ui/button';
import { Pen, Eraser, Palette, Users, Trash2, Download, Square, Circle, Type, ArrowRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface MobileToolbarProps {
  currentTool: 'pen' | 'eraser' | 'text' | 'rectangle' | 'circle' | 'square' | 'arrow';
  currentColor: string;
  onToolChange: (tool: 'pen' | 'eraser' | 'text' | 'rectangle' | 'circle' | 'square' | 'arrow') => void;
  onColorChange: (color: string) => void;
  onShowUsers: () => void;
  onClear: () => void;
  onDownload: () => void;
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

export default function MobileToolbar({
  currentTool,
  currentColor,
  onToolChange,
  onColorChange,
  onShowUsers,
  onClear,
  onDownload,
}: MobileToolbarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 safe-area-inset-bottom lg:hidden">
      <div className="flex items-center justify-around p-3 bg-card/95 backdrop-blur-md border-t border-card-border">
        <Button
          size="icon"
          variant={currentTool === 'pen' ? 'default' : 'ghost'}
          onClick={() => onToolChange('pen')}
          data-testid="button-mobile-pen"
        >
          <Pen className="h-5 w-5" />
        </Button>

        <Button
          size="icon"
          variant={currentTool === 'eraser' ? 'default' : 'ghost'}
          onClick={() => onToolChange('eraser')}
          data-testid="button-mobile-eraser"
        >
          <Eraser className="h-5 w-5" />
        </Button>

        <Button
          size="icon"
          variant={currentTool === 'text' ? 'default' : 'ghost'}
          onClick={() => onToolChange('text')}
          data-testid="button-mobile-text"
        >
          <Type className="h-5 w-5" />
        </Button>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              data-testid="button-mobile-more"
            >
              <Square className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto">
            <SheetHeader>
              <SheetTitle>More Tools</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-4 gap-3 mt-6">
              <Button
                variant={currentTool === 'rectangle' ? 'default' : 'outline'}
                onClick={() => onToolChange('rectangle')}
                className="h-16 flex flex-col gap-1"
                data-testid="button-mobile-rectangle"
              >
                <Square className="h-5 w-5" />
                <span className="text-xs">Rectangle</span>
              </Button>
              <Button
                variant={currentTool === 'circle' ? 'default' : 'outline'}
                onClick={() => onToolChange('circle')}
                className="h-16 flex flex-col gap-1"
                data-testid="button-mobile-circle"
              >
                <Circle className="h-5 w-5" />
                <span className="text-xs">Circle</span>
              </Button>
              <Button
                variant={currentTool === 'arrow' ? 'default' : 'outline'}
                onClick={() => onToolChange('arrow')}
                className="h-16 flex flex-col gap-1"
                data-testid="button-mobile-arrow"
              >
                <ArrowRight className="h-5 w-5" />
                <span className="text-xs">Arrow</span>
              </Button>
              <Button
                variant="outline"
                onClick={onDownload}
                className="h-16 flex flex-col gap-1"
                data-testid="button-mobile-download-sheet"
              >
                <Download className="h-5 w-5" />
                <span className="text-xs">Download</span>
              </Button>
              <Button
                variant="outline"
                onClick={onClear}
                className="h-16 flex flex-col gap-1 col-span-4"
                data-testid="button-mobile-clear-sheet"
              >
                <Trash2 className="h-5 w-5" />
                <span className="text-xs">Clear Canvas</span>
              </Button>
            </div>
            <div className="mt-6">
              <p className="text-sm font-medium mb-3">Color</p>
              <div className="grid grid-cols-8 gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    className="w-full aspect-square rounded-md border-2 hover-elevate active-elevate-2"
                    style={{
                      backgroundColor: color,
                      borderColor: currentColor === color ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                    }}
                    onClick={() => onColorChange(color)}
                    data-testid={`button-mobile-color-${color}`}
                  />
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Button
          size="icon"
          variant="ghost"
          onClick={onShowUsers}
          data-testid="button-mobile-users"
        >
          <Users className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
