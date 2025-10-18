import CollaborationPanel from '../CollaborationPanel';
import { ActiveUser } from '@shared/schema';

export default function CollaborationPanelExample() {
  const activeUsers: ActiveUser[] = [
    { id: '1', username: 'Sarah Chen', color: '#3b82f6' },
    { id: '2', username: 'Mike Johnson', color: '#22c55e' },
    { id: '3', username: 'Emma Davis', color: '#a855f7' },
  ];

  const sessionUrl = 'https://whiteboard.app/session/abc123';

  return (
    <div className="p-8 bg-background min-h-screen">
      <CollaborationPanel
        activeUsers={activeUsers}
        sessionUrl={sessionUrl}
      />
    </div>
  );
}
