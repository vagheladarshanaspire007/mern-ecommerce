import clsx from 'clsx';

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export function NotificationBadge({ count, className }: Readonly<NotificationBadgeProps>) {
  if (count <= 0) return null;

  return (
    <span
      className={clsx(
        'inline-flex min-h-6 min-w-6 items-center justify-center rounded-full border border-indigo-400/20 bg-indigo-500 px-2 py-1 text-xs font-semibold text-white shadow-md',
        className
      )}
      aria-label={`${count} unread notifications`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
