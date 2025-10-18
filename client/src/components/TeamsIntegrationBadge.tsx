import { Badge } from '@/components/ui/badge';
import { Video, VideoOff } from 'lucide-react';

interface TeamsIntegrationBadgeProps {
  connected: boolean;
  screenSharing?: boolean;
}

export default function TeamsIntegrationBadge({
  connected,
  screenSharing = false,
}: TeamsIntegrationBadgeProps) {
  if (!connected) {
    return (
      <Badge variant="secondary" className="gap-2" data-testid="badge-teams-disconnected">
        <VideoOff className="h-3 w-3" />
        Teams Disconnected
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="gap-2" data-testid="badge-teams-connected">
      <Video className="h-3 w-3" />
      {screenSharing ? (
        <>
          Teams Connected
          <span className="inline-block w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
        </>
      ) : (
        'Teams Connected'
      )}
    </Badge>
  );
}
