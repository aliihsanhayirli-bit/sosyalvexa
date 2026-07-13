import * as React from 'react';
import { cn } from '@/lib/utils';

const Dialog = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="dialog"
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-black/70 backdrop-blur-sm',
        className,
      )}
      {...props}
    />
  ),
);
Dialog.displayName = 'Dialog';

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative z-10 w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl shadow-black/40',
        'animate-fade-in',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
DialogContent.displayName = 'DialogContent';

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 mb-4', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn('font-display text-2xl font-semibold', className)} {...props} />
  ),
);
DialogTitle.displayName = 'DialogTitle';

const DialogClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        'absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-colors',
        'hover:bg-white/5 hover:text-foreground',
        className,
      )}
      {...props}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
      <span className="sr-only">Kapat</span>
    </button>
  ),
);
DialogClose.displayName = 'DialogClose';

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose };
