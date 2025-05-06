import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PageContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, scrollable = true }) => {
  return (
    <div className="w-full h-full min-h-screen flex flex-col px-4 md:px-8 lg:px-16 py-4">
      <div className="w-full h-full rounded-xl border bg-card p-4 shadow-sm">
        {scrollable ? (
          <ScrollArea className="h-[calc(100dvh-52px)] overflow-y-auto">
            <div>{children}</div>
          </ScrollArea>
        ) : (
          <div>{children}</div>
        )}
      </div>
    </div>
  );
};

export default PageContainer;
