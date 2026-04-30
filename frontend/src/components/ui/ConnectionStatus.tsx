import clsx from 'clsx';

interface ConnectionStatusProps {
  isConnected: boolean;
  className?: string;
}

export function ConnectionStatus({ isConnected, className }: Readonly<ConnectionStatusProps>) {
  return (
    <div
      className={clsx('inline-flex items-center gap-2 text-sm text-gray-600', className)}
      aria-live="polite"
    >
      <span
        className={clsx('h-2.5 w-2.5 rounded-full', isConnected ? 'bg-green-500' : 'bg-gray-400')}
        aria-hidden="true"
      />
      <span>{isConnected ? 'Live' : 'Offline'}</span>
    </div>
  );
}
