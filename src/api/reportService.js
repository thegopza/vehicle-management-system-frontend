import apiClient from './axiosConfig.js';

const reportService = {
  getMonthlySummary: (startDate, endDate) => {
    return apiClient.get('/reports/monthly-summary', {
      params: {
        startDate, // YYYY-MM-DD
        endDate,   // YYYY-MM-DD
      },
    });
  },
};

export default reportService;
