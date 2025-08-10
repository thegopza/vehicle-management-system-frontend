import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import VehicleManagementPage from '../pages/vehicle/VehicleManagementPage';
import VehicleStatusPage from '../pages/vehicle/VehicleStatusPage';
import MyTripsPage from '../pages/vehicle/MyTripsPage';
import EndTripListPage from '../pages/vehicle/EndTripListPage';
import KeyReturnPage from '../pages/vehicle/KeyReturnPage';
import UserManagementPage from '../pages/userManagement/UserManagementPage';
import AllTripsHistoryPage from '../pages/vehicle/AllTripsHistoryPage';
import AccidentListPage from '../pages/vehicle/AccidentListPage';
import ClearBillPage from '../pages/vehicle/ClearBillPage';
import MonthlyReportPage from '../pages/vehicle/MonthlyReportPage';
import FuelReportPage from '../pages/vehicle/FuelReportPage';
import OTSettingsPage from '../pages/ot/OTSettingsPage';
import OTRequestPage from '../pages/ot/OTRequestPage';
import OTApprovalPage from '../pages/ot/OTApprovalPage';
import MyOTHistoryPage from '../pages/ot/MyOTHistoryPage'; // <-- Import หน้าใหม่
import OTSummaryPage from '../pages/ot/OTSummaryPage'; // <-- *** เพิ่ม Import ***

// หมายเหตุ: เราจะสร้างไฟล์ OT Summary Page ในขั้นตอนถัดไป
// import OTSummaryPage from '../pages/ot/OTSummaryPage'; 

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} /> 
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Vehicle Routes */}
        <Route path="vehicles/management" element={<VehicleManagementPage />} />
        <Route path="vehicles/status" element={<VehicleStatusPage />} />
        <Route path="vehicles/my-trips" element={<MyTripsPage />} />
        <Route path="vehicles/end-trip-list" element={<EndTripListPage />} />
        <Route path="vehicles/key-return" element={<KeyReturnPage />} />
        <Route path="vehicles/accidents" element={<AccidentListPage />} />
        <Route path="vehicles/clear-bills" element={<ClearBillPage />} />
        <Route path="vehicles/history" element={<AllTripsHistoryPage />} />
        <Route path="vehicles/reports/monthly" element={<MonthlyReportPage />} />
        <Route path="vehicles/reports/fuel" element={<FuelReportPage />} />

        {/* User Management */}
        <Route path="users" element={<UserManagementPage />} />

        {/* --- *** จุดที่แก้ไข: เพิ่ม Routes สำหรับ OT ให้ครบ *** --- */}
        <Route path="ot/request" element={<OTRequestPage />} />
        <Route path="ot/approve" element={<OTApprovalPage />} />
        <Route path="ot/settings" element={<OTSettingsPage />} />
        <Route path="ot/my-history" element={<MyOTHistoryPage />} />
        <Route path="ot/summary" element={<OTSummaryPage />} />

      </Route>
    </Routes>
  );
};

export default AppRoutes;