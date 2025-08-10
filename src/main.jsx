import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { SnackbarProvider } from './contexts/SnackbarContext.jsx';
// --- *** START: ส่วนที่เพิ่มเข้ามา *** ---
import { NotificationProvider } from './contexts/NotificationContext.jsx';
// --- *** END: ส่วนที่เพิ่มเข้ามา *** ---
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        {/* --- *** START: ส่วนที่แก้ไข *** --- */}
        <NotificationProvider>
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </NotificationProvider>
        {/* --- *** END: ส่วนที่แก้ไข *** --- */}
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);