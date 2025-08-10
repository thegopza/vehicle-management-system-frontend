import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Tabs, Tab, Paper, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import vehicleService from '../../api/vehicleService.js';
import VehicleTable from '../../components/specific/VehicleTable.jsx';
import VehicleDialog from '../../components/specific/VehicleDialog.jsx';
import ConfirmationDialog from '../../components/common/ConfirmationDialog.jsx';
import useSnackbar from '../../hooks/useSnackbar.js';

const VehicleManagementPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbar();
  const [tabValue, setTabValue] = useState(0);

  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deletingVehicleId, setDeletingVehicleId] = useState(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getAllVehicles();
      setVehicles(response.data);
    } catch (err) {
      showSnackbar('ไม่สามารถดึงข้อมูลรถยนต์ได้', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const activeVehicles = useMemo(() => vehicles.filter(v => v.active), [vehicles]);
  const inactiveVehicles = useMemo(() => vehicles.filter(v => !v.active), [vehicles]);

  const handleOpenAddDialog = () => {
    setEditingVehicle(null);
    setVehicleDialogOpen(true);
  };

  const handleOpenEditDialog = (vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleDialogOpen(true);
  };

  const handleOpenDeleteDialog = (id) => {
    setDeletingVehicleId(id);
    setConfirmDialogOpen(true);
  };

  const handleSaveVehicle = async (vehicleData) => {
    try {
      if (editingVehicle) {
        await vehicleService.updateVehicle(editingVehicle.id, vehicleData);
        showSnackbar('แก้ไขข้อมูลรถยนต์สำเร็จ', 'success');
      } else {
        await vehicleService.addVehicle(vehicleData);
        showSnackbar('เพิ่มรถยนต์ใหม่สำเร็จ', 'success');
      }
      setVehicleDialogOpen(false);
      fetchVehicles();
    } catch (err) {
      showSnackbar('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
      console.error(err);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await vehicleService.deleteVehicle(deletingVehicleId);
      showSnackbar('ปิดการใช้งานรถยนต์สำเร็จ', 'info');
      setConfirmDialogOpen(false);
      fetchVehicles();
    } catch (err) {
      showSnackbar('เกิดข้อผิดพลาดในการปิดการใช้งาน', 'error');
      console.error(err);
    }
  };

  const handleReactivate = async (id) => {
    try {
      await vehicleService.reactivateVehicle(id);
      showSnackbar('เปิดใช้งานรถยนต์อีกครั้งสำเร็จ', 'success');
      fetchVehicles();
    } catch (err) {
      showSnackbar('เกิดข้อผิดพลาดในการเปิดใช้งานอีกครั้ง', 'error');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="bold">
            รายการรถยนต์ทั้งหมด
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            เพิ่มรถยนต์ใหม่
          </Button>
        </Box>
      </Box>

      <Divider />

      <Box>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ px: 3 }}>
          <Tab label={`รถที่ใช้งานอยู่ (${activeVehicles.length})`} />
          <Tab label={`รถที่ไม่ใช้งาน (${inactiveVehicles.length})`} />
        </Tabs>
      </Box>

      <Box sx={{ p: 3 }}>
        {tabValue === 0 && (
          <VehicleTable
            vehicles={activeVehicles}
            onEdit={handleOpenEditDialog}
            onDelete={handleOpenDeleteDialog}
          />
        )}
        {tabValue === 1 && (
          <VehicleTable
            vehicles={inactiveVehicles}
            onReactivate={handleReactivate}
          />
        )}
      </Box>
      <VehicleDialog
        open={vehicleDialogOpen}
        onClose={() => setVehicleDialogOpen(false)}
        onSave={handleSaveVehicle}
        vehicle={editingVehicle}
      />
      <ConfirmationDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="ยืนยันการปิดใช้งาน"
        message="คุณแน่ใจหรือไม่ว่าต้องการปิดการใช้งานรถยนต์คันนี้?"
      />
    </Paper>
  );
};

export default VehicleManagementPage;