import apiClient from './axiosConfig.js';

const accidentService = {
  getAccidents: () => {
    return apiClient.get('/accidents');
  },
  clearAccidentsForVehicle: (vehicleId) => {
    return apiClient.delete(`/accidents/vehicle/${vehicleId}`);
  },
};

export default accidentService;
