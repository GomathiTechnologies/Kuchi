import { useState, useEffect, useRef, useCallback } from 'react';
import { useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import WhiteboardCanvas from '@/components/WhiteboardCanvas';
import DrawingToolbar from '@/components/DrawingToolbar';
import CollaborationPanel from '@/components/CollaborationPanel';
import JoinSessionDialog from '@/components/JoinSessionDialog';
import TeamsIntegrationBadge from '@/components/TeamsIntegrationBadge';
import ZoomControls from '@/components/ZoomControls';
import MobileToolbar from '@/components/MobileToolbar';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { DrawingStroke, ActiveUser } from '@shared/schema';
import QRCode from 'qrcode';
import { useToast } from '@/hooks/use-toast';
import { getSocket } from '@/lib/socket';
import { apiRequest } from '@/lib/queryClient';

interface CanvasImage {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  image: HTMLImageElement;
  dataUrl?: string;
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

export default function WhiteboardPage() {
  const { toast } = useToast();
  const [match, params] = useRoute('/session/:id');
  const sessionIdFromUrl = params?.id;
  
  const [sessionId, setSessionId] = useState<string>(sessionIdFromUrl || '');
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [images, setImages] = useState<CanvasImage[]>([]);
  const [texts, setTexts] = useState<CanvasText[]>([]);
  const [shapes, setShapes] = useState<CanvasShape[]>([]);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'text' | 'rectangle' | 'circle' | 'square' | 'arrow'>('pen');
  const [currentColor, setCurrentColor] = useState('#3b82f6');
  const [currentWidth, setCurrentWidth] = useState(3);
  const [zoom, setZoom] = useState(1);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [showPanel, setShowPanel] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>();
  const [connected, setConnected] = useState(false);

  const socketRef = useRef(getSocket());

  const sessionUrl = typeof window !== 'undefined' && sessionId
    ? `${window.location.origin}/session/${sessionId}`
    : 'https://whiteboard.app/session/demo';

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (sessionId) {
      QRCode.toDataURL(sessionUrl, { width: 256, margin: 2 })
        .then(setQrCodeDataUrl)
        .catch(console.error);
    }
  }, [sessionUrl, sessionId]);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleImageUpload(file);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [sessionId]);

  useEffect(() => {
    return () => {
      const socket = socketRef.current;
      socket.off('connect');
      socket.off('disconnect');
      socket.off('session-joined');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('stroke-added');
      socket.off('image-added');
      socket.off('text-added');
      socket.off('shape-added');
      socket.off('canvas-cleared');
      socket.off('cursor-updated');
    };
  }, []);

  const createOrJoinSession = useCallback(async (name: string) => {
    try {
      let currentSessionId = sessionId;

      if (!currentSessionId) {
        const response = await apiRequest('POST', '/api/sessions', {
          name: `${name}'s Whiteboard`,
        });
        const data: any = await response.json();
        currentSessionId = data.id;
        setSessionId(currentSessionId);
        window.history.pushState({}, '', `/session/${currentSessionId}`);
      }

      const socket = socketRef.current;
      
      socket.on('connect', () => {
        setConnected(true);
        console.log('Connected to server');
      });

      socket.on('disconnect', () => {
        setConnected(false);
        console.log('Disconnected from server');
      });

      socket.on('session-joined', (data: any) => {
        setUserId(data.userId);
        setStrokes(data.strokes || []);
        setTexts(data.texts || []);
        setShapes(data.shapes || []);
        setActiveUsers(data.users || []);
        
        if (data.images && data.images.length > 0) {
          const loadedImages = data.images.map((imgData: any) => {
            const img = new Image();
            img.src = imgData.dataUrl;
            return {
              ...imgData,
              image: img,
            };
          });
          setImages(loadedImages);
        }
      });

      socket.on('user-joined', (user: ActiveUser) => {
        setActiveUsers(prev => [...prev, user]);
        toast({
          title: 'User joined',
          description: `${user.username} joined the session`,
        });
      });

      socket.on('user-left', (userId: string) => {
        setActiveUsers(prev => prev.filter(u => u.id !== userId));
      });

      socket.on('stroke-added', (stroke: DrawingStroke) => {
        setStrokes(prev => [...prev, stroke]);
      });

      socket.on('image-added', (imageData: any) => {
        const img = new Image();
        img.src = imageData.dataUrl;
        setImages(prev => [...prev, { ...imageData, image: img }]);
      });

      socket.on('text-added', (text: CanvasText) => {
        setTexts(prev => [...prev, text]);
      });

      socket.on('shape-added', (shape: CanvasShape) => {
        setShapes(prev => [...prev, shape]);
      });

      socket.on('canvas-cleared', (data?: { clearedBy?: string }) => {
        setStrokes([]);
        setImages([]);
        setTexts([]);
        setShapes([]);
        
        if (data?.clearedBy !== socket.id) {
          toast({
            title: 'Canvas cleared',
            description: 'Another user cleared the canvas',
          });
        }
      });

      socket.on('cursor-updated', (data: { userId: string; x: number; y: number }) => {
        setActiveUsers(prev => 
          prev.map(user => 
            user.id === data.userId 
              ? { ...user, cursor: { x: data.x, y: data.y } }
              : user
          )
        );
      });

      socket.connect();
      socket.emit('join-session', { sessionId: currentSessionId, username: name });
      
      setUsername(name);
    } catch (error) {
      console.error('Failed to create/join session:', error);
      toast({
        title: 'Error',
        description: 'Failed to join session. Please try again.',
        variant: 'destructive',
      });
    }
  }, [sessionId, toast]);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxWidth = 0.3;
        const maxHeight = 0.3;
        let width = maxWidth;
        let height = (img.height / img.width) * maxWidth;

        if (height > maxHeight) {
          height = maxHeight;
          width = (img.width / img.height) * maxHeight;
        }

        const newImage: CanvasImage = {
          id: `img-${Date.now()}`,
          x: 0.35,
          y: 0.35,
          width,
          height,
          image: img,
          dataUrl,
        };
        
        setImages(prev => [...prev, newImage]);
        
        if (sessionId) {
          socketRef.current.emit('add-image', {
            sessionId,
            image: {
              id: newImage.id,
              x: newImage.x,
              y: newImage.y,
              width: newImage.width,
              height: newImage.height,
              dataUrl,
            },
          });
        }
        
        toast({
          title: 'Image added',
          description: 'Your image has been added to the canvas',
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleStrokeComplete = (stroke: DrawingStroke) => {
    setStrokes(prev => [...prev, stroke]);
    if (sessionId) {
      socketRef.current.emit('draw-stroke', { sessionId, stroke });
    }
  };

  const handleTextAdd = (text: CanvasText) => {
    setTexts(prev => [...prev, text]);
    if (sessionId) {
      socketRef.current.emit('add-text', { sessionId, text });
    }
  };

  const handleShapeAdd = (shape: CanvasShape) => {
    setShapes(prev => [...prev, shape]);
    if (sessionId) {
      socketRef.current.emit('add-shape', { sessionId, shape });
    }
  };

  const handleCursorMove = (x: number, y: number) => {
    if (sessionId) {
      socketRef.current.emit('cursor-move', { sessionId, x, y });
    }
  };

  const handleClear = () => {
    setStrokes([]);
    setImages([]);
    setTexts([]);
    setShapes([]);
    
    if (sessionId) {
      socketRef.current.emit('clear-canvas', { sessionId });
    }
    
    toast({
      title: 'Canvas cleared',
      description: 'All content has been removed',
    });
  };

  const handleDownload = () => {
    const canvas = document.querySelector('[data-testid="canvas-whiteboard"]') as HTMLCanvasElement;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `whiteboard-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: 'Download started',
        description: 'Your whiteboard is being downloaded as PNG',
      });
    });
  };

  if (!username) {
    return <JoinSessionDialog open={true} onJoin={createOrJoinSession} />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 bg-card/80 backdrop-blur-md border-b border-card-border">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowPanel(!showPanel)}
            className="lg:hidden"
            data-testid="button-toggle-panel"
          >
            {showPanel ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="text-lg font-semibold hidden sm:block">Whiteboard</h1>
          {connected && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground hidden sm:inline">Connected</span>
            </div>
          )}
        </div>

        <div className="hidden lg:block">
          <DrawingToolbar
            currentTool={currentTool}
            currentColor={currentColor}
            currentWidth={currentWidth}
            onToolChange={setCurrentTool}
            onColorChange={setCurrentColor}
            onWidthChange={setCurrentWidth}
            onClear={handleClear}
            onDownload={handleDownload}
            onImageUpload={handleImageUpload}
          />
        </div>

        <div className="flex items-center gap-3">
          <TeamsIntegrationBadge connected={false} />
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setDarkMode(!darkMode)}
            data-testid="button-theme-toggle"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <div className="absolute inset-0 pt-16 pb-16 lg:pb-0">
        <div className="relative w-full h-full">
          <WhiteboardCanvas
            strokes={strokes}
            images={images}
            texts={texts}
            shapes={shapes}
            activeUsers={activeUsers}
            currentUserId={userId}
            currentColor={currentColor}
            currentWidth={currentWidth}
            currentTool={currentTool}
            onStrokeComplete={handleStrokeComplete}
            onTextAdd={handleTextAdd}
            onShapeAdd={handleShapeAdd}
            onCursorMove={handleCursorMove}
          />
        </div>
      </div>

      <aside
        className={`absolute top-16 right-0 bottom-0 z-30 transition-transform duration-300 ${
          showPanel ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <CollaborationPanel
          activeUsers={activeUsers}
          sessionUrl={sessionUrl}
          qrCodeDataUrl={qrCodeDataUrl}
        />
      </aside>

      <div className="absolute bottom-6 right-6 z-10 hidden lg:block">
        <ZoomControls
          zoom={zoom}
          onZoomIn={() => setZoom(z => Math.min(z + 0.1, 3))}
          onZoomOut={() => setZoom(z => Math.max(z - 0.1, 0.5))}
          onResetZoom={() => setZoom(1)}
        />
      </div>

      <MobileToolbar
        currentTool={currentTool}
        currentColor={currentColor}
        onToolChange={setCurrentTool}
        onColorChange={setCurrentColor}
        onShowUsers={() => setShowPanel(!showPanel)}
        onClear={handleClear}
        onDownload={handleDownload}
      />
    </div>
  );
}
