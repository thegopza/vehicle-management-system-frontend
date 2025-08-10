import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // แสดง loading spinner ขณะกำลังตรวจสอบสถานะ Login
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // ถ้า Login แล้ว ให้แสดงหน้าที่ร้องขอ (children)
  // ถ้ายังไม่ Login ให้ Redirect ไปหน้า /login
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// ตรวจสอบให้แน่ใจว่ามีคำว่า "default" อยู่ตรงนี้
export default PrivateRoute;