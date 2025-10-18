import { useRef, useEffect, useState, useCallback } from 'react';
import { DrawPoint, DrawingStroke, ActiveUser } from '@shared/schema';

interface CanvasImage {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  image: HTMLImageElement;
}

interface CanvasText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
}

interface CanvasShape {
  id: string;
  type: 'rectangle' | 'circle' | 'arrow';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
}

interface WhiteboardCanvasProps {
  strokes: DrawingStroke[];
  images: CanvasImage[];
  texts: CanvasText[];
  shapes: CanvasShape[];
  activeUsers: ActiveUser[];
  currentUserId: string;
  currentColor: string;
  currentWidth: number;
  currentTool: 'pen' | 'eraser' | 'text' | 'rectangle' | 'circle' | 'square' | 'arrow';
  onStrokeComplete: (stroke: DrawingStroke) => void;
  onTextAdd: (text: CanvasText) => void;
  onShapeAdd: (shape: CanvasShape) => void;
  onCursorMove?: (x: number, y: number) => void;
}

export default function WhiteboardCanvas({
  strokes,
  images,
  texts,
  shapes,
  activeUsers,
  currentUserId,
  currentColor,
  currentWidth,
  currentTool,
  onStrokeComplete,
  onTextAdd,
  onShapeAdd,
  onCursorMove,
}: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<DrawPoint[]>([]);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [currentShape, setCurrentShape] = useState<{ start: DrawPoint; end: DrawPoint } | null>(null);

  const getCanvasPoint = useCallback((e: React.MouseEvent | React.TouchEvent): DrawPoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number, pressure = 0.5;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      pressure = (e.touches[0] as any).force || 0.5;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
      pressure = (e as any).pressure || 0.5;
    }

    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
      pressure,
    };
  }, []);

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, lineWidth: number) => {
    const headLength = Math.max(10, lineWidth * 3);
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const point = getCanvasPoint(e);
    if (!point) return;

    if (currentTool === 'text') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      
      const text = prompt('Enter text:');
      if (text) {
        const newText: CanvasText = {
          id: `${currentUserId}-${Date.now()}`,
          x: point.x,
          y: point.y,
          text,
          color: currentColor,
          fontSize: 24,
        };
        onTextAdd(newText);
      }
      return;
    }

    if (currentTool === 'rectangle' || currentTool === 'circle' || currentTool === 'square' || currentTool === 'arrow') {
      setIsDrawing(true);
      setShapeStart({ x: point.x, y: point.y });
      setCurrentShape({ start: point, end: point });
      return;
    }

    setIsDrawing(true);
    setCurrentStroke([point]);
  }, [getCanvasPoint, currentTool, currentUserId, currentColor, onTextAdd]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const point = getCanvasPoint(e);
    if (!point) return;

    if (onCursorMove) {
      onCursorMove(point.x, point.y);
    }

    if (!isDrawing) return;

    if (currentTool === 'rectangle' || currentTool === 'circle' || currentTool === 'square' || currentTool === 'arrow') {
      setCurrentShape(prev => prev ? { ...prev, end: point } : null);
      return;
    }

    setCurrentStroke(prev => [...prev, point]);
  }, [isDrawing, getCanvasPoint, onCursorMove, currentTool]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) {
      setIsDrawing(false);
      setCurrentStroke([]);
      setShapeStart(null);
      setCurrentShape(null);
      return;
    }

    if ((currentTool === 'rectangle' || currentTool === 'circle' || currentTool === 'square' || currentTool === 'arrow') && currentShape) {
      const width = Math.abs(currentShape.end.x - currentShape.start.x);
      const height = currentTool === 'square' 
        ? width 
        : Math.abs(currentShape.end.y - currentShape.start.y);
      
      const shape: CanvasShape = {
        id: `${currentUserId}-${Date.now()}`,
        type: currentTool === 'square' ? 'rectangle' : (currentTool === 'arrow' ? 'arrow' : currentTool),
        x: Math.min(currentShape.start.x, currentShape.end.x),
        y: Math.min(currentShape.start.y, currentShape.end.y),
        width,
        height,
        color: currentColor,
        strokeWidth: currentWidth,
      };
      onShapeAdd(shape);
      setCurrentShape(null);
      setShapeStart(null);
      setIsDrawing(false);
      return;
    }

    if (currentStroke.length === 0) {
      setIsDrawing(false);
      setCurrentStroke([]);
      return;
    }

    const stroke: DrawingStroke = {
      id: `${currentUserId}-${Date.now()}`,
      points: currentStroke,
      color: currentTool === 'eraser' ? '#ffffff' : currentColor,
      width: currentTool === 'eraser' ? currentWidth * 3 : currentWidth,
      tool: currentTool === 'eraser' ? 'eraser' : 'pen',
      userId: currentUserId,
    };

    onStrokeComplete(stroke);
    setIsDrawing(false);
    setCurrentStroke([]);
  }, [isDrawing, currentStroke, currentShape, currentUserId, currentColor, currentWidth, currentTool, onStrokeComplete, onShapeAdd]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    ctx.fillStyle = 'hsl(var(--background))';
    ctx.fillRect(0, 0, rect.width, rect.height);

    images.forEach(img => {
      ctx.drawImage(
        img.image,
        img.x * rect.width,
        img.y * rect.height,
        img.width * rect.width,
        img.height * rect.height
      );
    });

    const drawStroke = (stroke: DrawingStroke) => {
      if (stroke.points.length < 2) return;

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';

      ctx.beginPath();
      const firstPoint = stroke.points[0];
      ctx.moveTo(firstPoint.x * rect.width, firstPoint.y * rect.height);

      for (let i = 1; i < stroke.points.length; i++) {
        const point = stroke.points[i];
        ctx.lineTo(point.x * rect.width, point.y * rect.height);
      }

      ctx.stroke();
    };

    strokes.forEach(drawStroke);

    ctx.globalCompositeOperation = 'source-over';
    shapes.forEach(shape => {
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = shape.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (shape.type === 'rectangle') {
        ctx.strokeRect(
          shape.x * rect.width,
          shape.y * rect.height,
          shape.width * rect.width,
          shape.height * rect.height
        );
      } else if (shape.type === 'circle') {
        const centerX = (shape.x + shape.width / 2) * rect.width;
        const centerY = (shape.y + shape.height / 2) * rect.height;
        const radiusX = (shape.width / 2) * rect.width;
        const radiusY = (shape.height / 2) * rect.height;
        
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (shape.type === 'arrow') {
        drawArrow(
          ctx,
          shape.x * rect.width,
          (shape.y + shape.height / 2) * rect.height,
          (shape.x + shape.width) * rect.width,
          (shape.y + shape.height / 2) * rect.height,
          shape.strokeWidth
        );
      }
    });

    texts.forEach(text => {
      ctx.fillStyle = text.color;
      ctx.font = `${text.fontSize}px Inter`;
      ctx.fillText(text.text, text.x * rect.width, text.y * rect.height);
    });

    if (currentStroke.length > 0 && (currentTool === 'pen' || currentTool === 'eraser')) {
      const tempStroke: DrawingStroke = {
        id: 'temp',
        points: currentStroke,
        color: currentTool === 'eraser' ? '#ffffff' : currentColor,
        width: currentTool === 'eraser' ? currentWidth * 3 : currentWidth,
        tool: currentTool,
        userId: currentUserId,
      };
      drawStroke(tempStroke);
    }

    if (currentShape && (currentTool === 'rectangle' || currentTool === 'circle' || currentTool === 'square' || currentTool === 'arrow')) {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      const width = Math.abs(currentShape.end.x - currentShape.start.x);
      const height = currentTool === 'square' 
        ? width 
        : Math.abs(currentShape.end.y - currentShape.start.y);
      const x = Math.min(currentShape.start.x, currentShape.end.x);
      const y = Math.min(currentShape.start.y, currentShape.end.y);
      
      if (currentTool === 'rectangle' || currentTool === 'square') {
        ctx.strokeRect(
          x * rect.width,
          y * rect.height,
          width * rect.width,
          height * rect.height
        );
      } else if (currentTool === 'circle') {
        const centerX = (x + width / 2) * rect.width;
        const centerY = (y + height / 2) * rect.height;
        const radiusX = (width / 2) * rect.width;
        const radiusY = (height / 2) * rect.height;
        
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (currentTool === 'arrow') {
        drawArrow(
          ctx,
          currentShape.start.x * rect.width,
          currentShape.start.y * rect.height,
          currentShape.end.x * rect.width,
          currentShape.end.y * rect.height,
          currentWidth
        );
      }
    }

    activeUsers.forEach(user => {
      if (user.id !== currentUserId && user.cursor) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = user.color;
        ctx.beginPath();
        ctx.arc(user.cursor.x * rect.width, user.cursor.y * rect.height, 6, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = 'hsl(var(--foreground))';
        ctx.font = '12px Inter';
        ctx.fillText(user.username, user.cursor.x * rect.width + 10, user.cursor.y * rect.height - 10);
      }
    });
  }, [strokes, images, texts, shapes, currentStroke, currentShape, activeUsers, currentUserId, currentColor, currentWidth, currentTool]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full touch-none cursor-crosshair"
      data-testid="canvas-whiteboard"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  );
}
