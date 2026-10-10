import { Suspense } from 'react';
import InboxClientLayout from './InboxClientLayout';

export default function InboxLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="h-screen bg-surface flex items-center justify-center">Loading Inbox...</div>}>
      <InboxClientLayout>{children}</InboxClientLayout>
    </Suspense>
  );
}
