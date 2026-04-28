import { createElement, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

import { OrderStatusToast } from '@/components/ui/OrderStatusToast';
import { useAppDispatch, useAppSelector } from '@/store';
import { incrementUnreadCount, setSocketConnected } from '@/store/slices/uiSlice';
import type { OrderStatus } from '@/types/auth.types';

type OrderStatusUpdatedPayload = {
  orderId?: string;
  id?: string;
  status?: OrderStatus;
};

let socket: Socket | null = null;

function getSocketUrl() {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!apiUrl) return undefined;

  try {
    const url = new URL(apiUrl, globalThis.location.origin);
    return url.origin;
  } catch {
    return undefined;
  }
}

function renderStatusToast(orderId: string, status: OrderStatus) {
  return createElement(OrderStatusToast, { orderId, status });
}

const STATUS_TOAST_OPTIONS = {
  duration: 4000,
  style: {
    background: 'transparent',
    boxShadow: 'none',
    padding: 0,
  },
} as const;

export function useSocket() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  useEffect(() => {
    if (!accessToken) {
      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
      }
      dispatch(setSocketConnected(false));
      return;
    }

    const socketUrl = getSocketUrl();
    const nextSocket = io(socketUrl, {
      auth: { token: accessToken },
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling'],
    });

    socket = nextSocket;

    const handleConnect = () => {
      dispatch(setSocketConnected(true));
    };

    const handleDisconnect = () => {
      dispatch(setSocketConnected(false));
    };

    const handleOrderStatusUpdated = (payload: OrderStatusUpdatedPayload) => {
      const orderId = payload.orderId || payload.id;
      const status = payload.status;

      if (!orderId || !status) return;

      dispatch(incrementUnreadCount());
      toast.custom(renderStatusToast(orderId, status), STATUS_TOAST_OPTIONS);
    };

    nextSocket.on('connect', handleConnect);
    nextSocket.on('disconnect', handleDisconnect);
    nextSocket.on('order:status-updated', handleOrderStatusUpdated);

    return () => {
      nextSocket.off('connect', handleConnect);
      nextSocket.off('disconnect', handleDisconnect);
      nextSocket.off('order:status-updated', handleOrderStatusUpdated);
      nextSocket.disconnect();

      if (socket === nextSocket) {
        socket = null;
      }

      dispatch(setSocketConnected(false));
    };
  }, [accessToken, dispatch]);
}
