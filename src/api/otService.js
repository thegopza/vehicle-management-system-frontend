import apiClient from './axiosConfig.js';

const otService = {
  // --- Settings API ---
  setOtMode: (mode) => {
    return apiClient.put('/ot/settings/mode', { mode });
  },
  getAssistants: () => {
    return apiClient.get('/ot/settings/assistants');
  },
  addAssistant: (assistantId) => {
    return apiClient.post('/ot/settings/assistants', { assistantId });
  },
  removeAssistant: (assistantId) => {
    return apiClient.delete(`/ot/settings/assistants/${assistantId}`);
  },
  getMyCheckpoints: () => {
    return apiClient.get('/ot/settings/checkpoints');
  },
  createCheckpoint: (name) => {
    return apiClient.post('/ot/settings/checkpoints', { name });
  },
  deleteCheckpoint: (checkpointId) => {
    return apiClient.delete(`/ot/settings/checkpoints/${checkpointId}`);
  },
  createLane: (checkpointId, name) => {
    return apiClient.post(`/ot/settings/checkpoints/${checkpointId}/lanes`, { name });
  },
  deleteLane: (laneId) => {
    return apiClient.delete(`/ot/settings/lanes/${laneId}`);
  },

  // --- START: เปลี่ยนเป็น Endpoint ชุดใหม่สำหรับ Global Equipment ---
  getAllEquipments: () => {
    return apiClient.get('/ot/settings/equipments');
  },
  createEquipment: (name) => {
    return apiClient.post('/ot/settings/equipments', { name });
  },
  deleteEquipment: (equipmentId) => {
    return apiClient.delete(`/ot/settings/equipments/${equipmentId}`);
  },
  // --- END ---

  // --- Request API ---
  getManagers: () => {
    return apiClient.get('/users/role/MANAGER'); 
  },
  createOtRequest: (data, files) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }
    return apiClient.post('/ot/requests', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getOtRequestById: (id) => {
    return apiClient.get(`/ot/requests/${id}`);
  },
  updateOtRequest: (id, data, files) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }
    return apiClient.put(`/ot/requests/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // --- Approval & History API ---
  getPendingApprovals: () => {
    return apiClient.get('/ot/approvals');
  },
  approveRequest: (id, overwrite = false) => {
    return apiClient.post(`/ot/approvals/${id}/approve?overwrite=${overwrite}`);
  },
  rejectRequest: (id, reason) => {
    return apiClient.post(`/ot/approvals/${id}/reject`, { reason });
  },
  reviewRequest: (id) => {
    return apiClient.post(`/ot/approvals/${id}/review`);
  },
  getMyOtHistory: () => {
    return apiClient.get('/ot/history/my-requests');
  },
  getOtSummary: (startDate, endDate) => {
    return apiClient.get('/ot/summary', {
      params: { 
        startDate, // YYYY-MM-DD
        endDate,   // YYYY-MM-DD
      }
    });
  }
};

export default otService;