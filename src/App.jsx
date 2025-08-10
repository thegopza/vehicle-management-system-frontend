import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { CssBaseline } from '@mui/material';

function App() {
  return (
    <>
      <CssBaseline /> {/* ช่วย Reset CSS ของ Browser ให้เป็นมาตรฐาน */}
      <AppRoutes />
    </>
  );
}

export default App;