import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchNotifications, markAsRead, markAllAsRead } from '../services/notificationService';

const POLL_INTERVAL = 30000;

const playNotificationSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.4);
    } catch (e) {
        console.warn('Could not play notification sound:', e);
    }
};

export default function useNotificationPolling() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const prevUnreadCountRef = useRef(null);
    const hasInteractedRef = useRef(false);

    useEffect(() => {
        const onInteract = () => { hasInteractedRef.current = true; };
        document.addEventListener('click', onInteract, { once: true });
        document.addEventListener('keydown', onInteract, { once: true });
        return () => {
            document.removeEventListener('click', onInteract);
            document.removeEventListener('keydown', onInteract);
        };
    }, []);

    const fetchAndUpdate = useCallback(async () => {
        try {
            const data = await fetchNotifications();
            const currentUnread = data.filter(n => !n.read).length;

            if (
                prevUnreadCountRef.current !== null &&
                currentUnread > prevUnreadCountRef.current &&
                hasInteractedRef.current
            ) {
                playNotificationSound();
            }

            setNotifications(data);
            prevUnreadCountRef.current = currentUnread;
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAndUpdate();
        const interval = setInterval(fetchAndUpdate, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchAndUpdate]);

    const handleMarkAsRead = useCallback(async (id) => {
        try {
            await markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
            if (prevUnreadCountRef.current > 0) {
                prevUnreadCountRef.current -= 1;
            }
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    }, []);

    const handleMarkAllAsRead = useCallback(async () => {
        try {
            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            prevUnreadCountRef.current = 0;
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return {
        notifications,
        loading,
        error,
        unreadCount,
        handleMarkAsRead,
        handleMarkAllAsRead,
        refresh: fetchAndUpdate
    };
}
