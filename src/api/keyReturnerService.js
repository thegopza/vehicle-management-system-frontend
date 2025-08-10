import apiClient from './axiosConfig.js';

const keyReturnerService = {
  getPendingKeyReturnTrips: () => {
    return apiClient.get('/key-return/pending');
  },
  // --- ส่วนที่แก้ไข: เพิ่ม data เข้าไปใน parameter ---
  confirmKeyReturn: (tripId, data) => {
    return apiClient.post(`/key-return/confirm/${tripId}`, data);
  },
};

export default keyReturnerService;