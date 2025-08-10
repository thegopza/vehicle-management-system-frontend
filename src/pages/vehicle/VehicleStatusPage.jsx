import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Paper, Button, Grid, Divider, Stack } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import PersonIcon from '@mui/icons-material/Person';
import PlaceIcon from '@mui/icons-material/Place';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // <-- ไอคอนใหม่สำหรับสถานะ
import vehicleService from '../../api/vehicleService.js';
import tripService from '../../api/tripService.js';
import StartTripDialog from '../../components/specific/StartTripDialog.jsx';
import useSnackbar from '../../hooks/useSnackbar.js';

const FuelGauge = ({ level = 0 }) => {
  const maxLevel = 8;
  const parsedLevel = parseInt(level, 10);
  const percentage = (parsedLevel / maxLevel) * 100;
  const barColor = percentage > 50 ? 'success.main' : percentage > 25 ? 'warning.main' : 'error.main';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', color: 'text.secondary' }}>
      <LocalGasStationIcon sx={{ fontSize: 18, mr: 1 }} />
      <Box sx={{ flexGrow: 1, height: '8px', backgroundColor: 'grey.300', borderRadius: '4px', overflow: 'hidden' }}>
        <Box sx={{
          height: '100%',
          width: `${percentage}%`,
          backgroundColor: barColor,
          borderRadius: '4px',
          transition: 'width 0.5s ease-in-out',
        }} />
      </Box>
      <Typography variant="body2" sx={{ ml: 1.5, minWidth: '35px', textAlign: 'right', fontWeight: 500 }}>
        {parsedLevel}/8
      </Typography>
    </Box>
  );
};

// --- ส่วนที่แก้ไข ---
// สร้าง Map สำหรับแปลงสถานะเป็นข้อความภาษาไทย
const tripStatusMap = {
  IN_PROGRESS: { text: 'กำลังใช้งาน', color: 'primary.main' },
  PENDING_KEY_RETURN: { text: 'รอคืนกุญแจ', color: 'warning.dark' },
};

const VehicleCard = ({ vehicle, onStartTrip }) => {
  const isAvailable = vehicle.available;
  const statusInfo = vehicle.tripStatus ? tripStatusMap[vehicle.tripStatus] : null;

  return (
    <Paper
      elevation={2}
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        width: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: 6,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          minWidth: 120,
          backgroundColor: isAvailable ? 'success.light' : 'error.light',
          color: isAvailable ? 'success.contrastText' : 'error.contrastText',
        }}
      >
        <DirectionsCarIcon sx={{ fontSize: 40 }} />
        <Typography variant="h6" fontWeight="bold">
          {isAvailable ? 'ว่าง' : 'ไม่ว่าง'}
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          {vehicle.licensePlate}
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          {vehicle.name}
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <SpeedIcon sx={{ fontSize: 18, mr: 1 }} />
            <Typography variant="body2">
              ไมล์: {(vehicle.lastMileage || 0).toLocaleString()} กม.
            </Typography>
          </Box>
          <FuelGauge level={vehicle.lastFuelLevel} />
        </Stack>

        {!isAvailable && (
          <Box sx={{ mt: 1.5, p: 1.5, backgroundColor: 'grey.100', borderRadius: '8px' }}>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                  <PersonIcon sx={{ fontSize: 16, mr: 1 }} />
                  <Typography variant="caption">
                    ใช้งานโดย: {vehicle.driverFirstName || '...'} {vehicle.driverLastName || ''}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                  <PlaceIcon sx={{ fontSize: 16, mr: 1 }} />
                  <Typography variant="caption">
                    สถานที่: {vehicle.destination || '-'}
                  </Typography>
                </Box>
                {/* เพิ่มการแสดงสถานะของ Trip */}
                {statusInfo && (
                  <Box sx={{ display: 'flex', alignItems: 'center', color: statusInfo.color }}>
                    <InfoOutlinedIcon sx={{ fontSize: 16, mr: 1 }} />
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      สถานะ: {statusInfo.text}
                    </Typography>
                  </Box>
                )}
              </Stack>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, borderLeft: '1px solid', borderColor: 'divider' }}>
        <Button
          variant="contained"
          onClick={() => onStartTrip(vehicle)}
          disabled={!isAvailable}
          sx={{ whiteSpace: 'nowrap' }}
        >
          เบิกรถ
        </Button>
      </Box>
    </Paper>
  );
};
// -------------------

const VehicleStatusPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbar();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const fetchVehicleStatuses = async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getVehicleStatuses();
      const sortedVehicles = response.data.sort((a, b) => (a.available === b.available) ? 0 : a.available ? -1 : 1);
      setVehicles(sortedVehicles);
    } catch (err) {
      showSnackbar('ไม่สามารถดึงข้อมูลสถานะรถยนต์ได้', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleStatuses();
  }, []);

  const handleOpenDialog = (vehicle) => {
    setSelectedVehicle(vehicle);
    setDialogOpen(true);
  };

  const handleStartTrip = async (tripData) => {
    try {
      await tripService.startTrip(tripData);
      showSnackbar('เบิกรถสำเร็จ', 'success');
      setDialogOpen(false);
      fetchVehicleStatuses();
    } catch (err) {
      showSnackbar('เกิดข้อผิดพลาดในการเบิกรถ', 'error');
      console.error(err);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
        สถานะรถยนต์
      </Typography>
      
      <Stack spacing={2}>
        {vehicles.map(vehicle => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} onStartTrip={handleOpenDialog} />
        ))}
      </Stack>

      <StartTripDialog 
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleStartTrip}
        vehicle={selectedVehicle}
      />
    </Box>
  );
};

export default VehicleStatusPage;
