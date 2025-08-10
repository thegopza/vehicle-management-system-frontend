import apiClient from './axiosConfig.js';

const userService = {
  getAllUsers: () => {
    return apiClient.get('/users');
  },
  updateUser: (id, userData) => {
    return apiClient.put(`/users/${id}`, userData);
  },
  // --- ฟังก์ชันที่เพิ่มเข้ามาใหม่ ---
  createUser: (userData) => {
    return apiClient.post('/users', userData);
  },

  getUsersByRole: (roleName) => {
    return apiClient.get(`/users/role/${roleName}`);
  },
};

export default userService;