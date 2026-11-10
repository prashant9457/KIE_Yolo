import { XIcon } from '@phosphor-icons/react';
import Button from './Button';

export default function Notice({ children, onDismiss, tone = 'error', className = '' }) {
  return (
    <div
      className={`notice notice--${tone} ${className}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <div>{children}</div>
      {onDismiss && (
        <Button iconOnly variant="ghost" size="sm" aria-label="Dismiss message" onClick={onDismiss}>
          <XIcon size={16} />
        </Button>
      )}
    </div>
  );
}
