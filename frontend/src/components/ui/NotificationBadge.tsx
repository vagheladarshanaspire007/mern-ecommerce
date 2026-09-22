import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAppSelector } from '@/store';

export function NotificationBadge() {
  const unreadCount = useAppSelector((state) => state.ui.unreadCount);

  return (
    <Link
      to="/orders"
      aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
      className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    >
      <Bell className="h-5 w-5" />

      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-red-600 px-1 text-center text-[10px] font-semibold leading-5 text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
