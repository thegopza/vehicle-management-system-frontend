import apiClient from './axiosConfig.js';

const tripService = {
  startTrip: (tripData) => {
    return apiClient.post('/trips/start', tripData);
  },

  // --- ส่วนที่แก้ไข ---
  getMyActiveTrips: () => {
    return apiClient.get('/trips/my/active-trips');
  },
  // -------------------

  getMyTripHistory: () => {
    return apiClient.get('/trips/my/history');
  },
  endTrip: (tripId, endTripData, files) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(endTripData));
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }
    return apiClient.post(`/trips/end/${tripId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getPendingProcessTrips: () => {
    return apiClient.get('/trips/pending-process');
  },
  getAllTripHistory: () => {
    return apiClient.get('/trips/history/all');
  },
  updateTripHistory: (tripId, data) => {
    return apiClient.put(`/trips/history/${tripId}`, data);
  }

};

export default tripService;