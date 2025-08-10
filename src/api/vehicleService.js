import apiClient from './axiosConfig.js';

const vehicleService = {

  getVehiclesForDropdown: () => {
    return apiClient.get('/vehicles/all-simple');
  },

  getVehicleStatuses: () => {
    return apiClient.get('/vehicles/status');
  },

  getAllVehicles: () => {
    return apiClient.get('/vehicles');
  },
  
  addVehicle: (vehicleData) => {
    return apiClient.post('/vehicles', vehicleData);
  },

  updateVehicle: (id, vehicleData) => {
    return apiClient.put(`/vehicles/${id}`, vehicleData);
  },

  deleteVehicle: (id) => {
    return apiClient.delete(`/vehicles/${id}`);
  },

  reactivateVehicle: (id) => {
    return apiClient.post(`/vehicles/${id}/reactivate`);
  },
};

export default vehicleService;