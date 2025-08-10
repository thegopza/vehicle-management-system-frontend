import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import notificationService from '../api/notificationService';

const NotificationContext = createContext();

export const useNotifications = () => {
    return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const [countRes, notificationsRes] = await Promise.all([
                notificationService.getUnreadCount(),
                notificationService.getUnreadNotifications()
            ]);
            setUnreadCount(countRes.data.count);
            setNotifications(notificationsRes.data);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchNotifications(); // Fetch immediately on load
        const intervalId = setInterval(fetchNotifications, 30000); // Fetch every 30 seconds

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [fetchNotifications]);

    const markNotificationAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            // Optimistically update UI
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const value = {
        notifications,
        unreadCount,
        loading,
        markNotificationAsRead,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};