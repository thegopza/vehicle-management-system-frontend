import apiClient from './axiosConfig.js';

const notificationService = {
  getUnreadNotifications: () => {
    return apiClient.get('/notifications/unread');
  },

  getUnreadCount: () => {
    return apiClient.get('/notifications/unread-count');
  },

  markAsRead: (id) => {
    return apiClient.post(`/notifications/${id}/read`);
  },
};

export default notificationService;