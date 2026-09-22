import { createElement, useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store';
import { incrementUnreadCount, setSocketConnected } from '@/store/slices/uiSlice';
import type { OrderStatus } from '@/types/auth.types';

interface OrderStatusUpdatedEvent {
  orderId: string;
  status: OrderStatus;
}

const SOCKET_URL = import.meta.env.VITE_WS_URL || window.location.origin;

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-gray-100 text-gray-700',
  },
  processing: {
    label: 'Processing',
    className: 'bg-blue-100 text-blue-700',
  },
  shipped: {
    label: 'Shipped',
    className: 'bg-purple-100 text-purple-700',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-green-100 text-green-700',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-700',
  },
};

export function useSocket() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  useEffect(() => {
    if (!accessToken) {
      dispatch(setSocketConnected(false));
      return;
    }

    const socket: Socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      reconnection: true,
      reconnectionAttempts: Infinity,
    });

    const handleConnect = () => {
      dispatch(setSocketConnected(true));
    };

    const handleDisconnect = () => {
      dispatch(setSocketConnected(false));
    };

    const handleConnectError = () => {
      dispatch(setSocketConnected(false));
    };

    const handleOrderStatusUpdated = (event: OrderStatusUpdatedEvent) => {
      dispatch(incrementUnreadCount());

      const config = statusConfig[event.status];

      toast.custom(() =>
        createElement(
          'div',
          {
            className:
              'flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-lg ring-1 ring-black/5',
          },
          createElement(
            'div',
            null,
            createElement(
              'p',
              {
                className: 'text-sm font-semibold text-gray-900',
              },
              `Order #${event.orderId}`
            ),
            createElement(
              'p',
              {
                className: 'text-xs text-gray-500',
              },
              'Status updated'
            )
          ),
          createElement(
            'span',
            {
              className:
                'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ' +
                config.className,
            },
            config.label
          )
        )
      );
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('order:status-updated', handleOrderStatusUpdated);

    return () => {
      socket.off();
      socket.disconnect();
      dispatch(setSocketConnected(false));
    };
  }, [accessToken, dispatch]);
}
