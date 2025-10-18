import JoinSessionDialog from '../JoinSessionDialog';
import { useState } from 'react';

export default function JoinSessionDialogExample() {
  const [open] = useState(true);

  return (
    <JoinSessionDialog
      open={open}
      onJoin={(username) => console.log('Joining as:', username)}
    />
  );
}
