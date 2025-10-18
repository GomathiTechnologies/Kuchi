import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface JoinSessionDialogProps {
  open: boolean;
  onJoin: (username: string) => void;
}

export default function JoinSessionDialog({ open, onJoin }: JoinSessionDialogProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onJoin(username.trim());
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Whiteboard</DialogTitle>
          <DialogDescription>
            Enter your name to start collaborating
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Your Name</Label>
            <Input
              id="username"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              data-testid="input-username"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!username.trim()}
            data-testid="button-join-session"
          >
            Join Session
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
