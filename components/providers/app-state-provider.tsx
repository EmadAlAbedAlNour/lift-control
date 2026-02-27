"use client";

import { createContext, useContext, useMemo, useState } from "react";

interface NotificationState {
  unreadCount: number;
  markAllRead: () => void;
}

const NotificationContext = createContext<NotificationState | undefined>(undefined);

interface AppStateProviderProps {
  children: React.ReactNode;
  initialUnread: number;
}

export function AppStateProvider({ children, initialUnread }: AppStateProviderProps) {
  const [unreadCount, setUnreadCount] = useState(initialUnread);

  const value = useMemo(
    () => ({
      unreadCount,
      markAllRead: () => setUnreadCount(0)
    }),
    [unreadCount]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotificationState(): NotificationState {
  const ctx = useContext(NotificationContext);

  if (!ctx) {
    throw new Error("useNotificationState must be used inside AppStateProvider");
  }

  return ctx;
}
