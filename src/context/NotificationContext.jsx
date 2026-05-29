import { createContext, useContext } from 'react';
import useNotificationPolling from '../hooks/useNotificationPolling';

const NotificationContext = createContext({
    notifications: [],
    unreadCount: 0,
    unreadCounts: { approval: 0, alert: 0, info: 0, total: 0 },
    loading: false,
    error: null,
    handleMarkAsRead: () => {},
    handleMarkAllAsRead: () => {},
    refresh: () => {},
});

export function NotificationProvider({ children }) {
    const polling = useNotificationPolling("all");
    return (
        <NotificationContext.Provider value={polling}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    return useContext(NotificationContext);
}
