import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://test888.ddns.net:8080/api', // URL พื้นฐานของ Backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;