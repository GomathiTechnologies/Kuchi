import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Users } from 'lucide-react';
import { useState } from 'react';
import { ActiveUser } from '@shared/schema';

interface CollaborationPanelProps {
  activeUsers: ActiveUser[];
  sessionUrl: string;
  qrCodeDataUrl?: string;
}

export default function CollaborationPanel({
  activeUsers,
  sessionUrl,
  qrCodeDataUrl,
}: CollaborationPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sessionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-80 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Collaboration
        </CardTitle>
        <Badge variant="secondary" data-testid="badge-user-count">
          {activeUsers.length}
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 space-y-6 overflow-auto">
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Active Users</h3>
          <div className="space-y-2">
            {activeUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-2 rounded-md hover-elevate"
                data-testid={`user-card-${user.id}`}
              >
                <Avatar className="h-8 w-8" style={{ backgroundColor: user.color }}>
                  <AvatarFallback className="text-white text-xs font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium flex-1">{user.username}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Quick Join</h3>
          <p className="text-xs text-muted-foreground">Scan QR code to join on mobile</p>
          {qrCodeDataUrl && (
            <div className="flex justify-center p-4 bg-white rounded-md">
              <img
                src={qrCodeDataUrl}
                alt="QR Code"
                className="w-48 h-48"
                data-testid="img-qr-code"
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Share Link</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={sessionUrl}
              readOnly
              className="flex-1 px-3 py-2 text-xs bg-muted rounded-md border border-input"
              data-testid="input-share-link"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCopyLink}
              data-testid="button-copy-link"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
