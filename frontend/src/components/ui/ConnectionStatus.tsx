import { useAppSelector } from '@/store';

export function ConnectionStatus() {
  const isConnected = useAppSelector((state) => state.ui.isSocketConnected);

  return (
    <div
      className="flex items-center gap-2 text-xs text-gray-600"
      aria-label={isConnected ? 'Connected' : 'Disconnected'}
      title={isConnected ? 'Real-time connected' : 'Real-time disconnected'}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}
      />
      <span className="hidden lg:inline">{isConnected ? 'Connected' : 'Disconnected'}</span>
    </div>
  );
}
