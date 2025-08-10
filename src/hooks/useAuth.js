import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

const useAuth = () => {
  return useContext(AuthContext);
};

// ตรวจสอบให้แน่ใจว่ามีคำว่า "default" อยู่ตรงนี้
export default useAuth;