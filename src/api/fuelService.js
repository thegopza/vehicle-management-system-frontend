import apiClient from './axiosConfig.js';

const fuelService = {
  recordFuel: (tripId, fuelData, file) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(fuelData));
    if (file) {
      formData.append('file', file);
    }
    return apiClient.post(`/fuel/record/${tripId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getPendingFuelRecords: () => {
    return apiClient.get('/fuel/pending');
  },

  clearBill: (recordId, clearData, file) => {
     const formData = new FormData();
     formData.append('data', JSON.stringify(clearData));
     if (file) {
       formData.append('file', file);
     }
     return apiClient.put(`/fuel/clear/${recordId}`, formData, {
       headers: { 'Content-Type': 'multipart/form-data' },
     });
  },

  // --- เพิ่มเมธอดนี้เข้ามาใหม่ ---
  getFuelReport: (startDate, endDate, vehicleId) => {
    return apiClient.get('/fuel/report', {
      params: {
        startDate, // YYYY-MM-DD
        endDate,   // YYYY-MM-DD
        vehicleId, // number or null
      },
    });
  },
  // ----------------------------
};

export default fuelService;
