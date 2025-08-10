import React, { useState, useEffect } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  Box, Typography, Slider, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';

// --- Component ย่อยสำหรับหลอดน้ำมัน ---
const FuelGauge = ({ level = 0 }) => {
  const maxLevel = 8;
  const parsedLevel = parseInt(level, 10);
  const percentage = (parsedLevel / maxLevel) * 100;
  const barColor = percentage > 50 ? 'success.main' : percentage > 25 ? 'warning.main' : 'error.main';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', color: 'text.secondary' }}>
      <LocalGasStationIcon sx={{ fontSize: 18, mr: 1 }} />
      <Box sx={{ flexGrow: 1, height: '8px', backgroundColor: 'grey.300', borderRadius: '4px', overflow: 'hidden' }}>
        <Box sx={{ height: '100%', width: `${percentage}%`, backgroundColor: barColor, borderRadius: '4px' }} />
      </Box>
      <Typography variant="body2" sx={{ ml: 1.5, minWidth: '35px', textAlign: 'right', fontWeight: 500 }}>
        {parsedLevel}/8
      </Typography>
    </Box>
  );
};

// --- รายการสถานที่ที่กำหนดไว้ ---
const predefinedDestinations = ["M7-1", "M7-2", "M9", "นำรถเข้าศูนย์", "CCB7", "อื่นๆ"];

const StartTripDialog = ({ open, onClose, onConfirm, vehicle }) => {
  const [destination, setDestination] = useState('');
  const [otherDestination, setOtherDestination] = useState('');

  // Reset ฟอร์มทุกครั้งที่ Dialog เปิดขึ้นมาใหม่
  useEffect(() => {
    if (open) {
      setDestination('');
      setOtherDestination('');
    }
  }, [open]);

  const handleConfirm = () => {
    const finalDestination = destination === 'อื่นๆ' ? otherDestination : destination;
    
    if (!finalDestination) {
      alert('กรุณาระบุสถานที่');
      return;
    }
    
    onConfirm({
      vehicleId: vehicle.id,
      startMileage: vehicle.lastMileage, // ดึงค่าล่าสุดมาใช้
      destination: finalDestination,
      // purpose ถูกลบออกไปแล้ว
    });
  };

  if (!vehicle) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>ยืนยันการเบิกรถ</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="ทะเบียนรถ" value={vehicle.licensePlate} disabled fullWidth />
            <TextField
                label="เลขไมล์เริ่มต้น"
                type="number"
                fullWidth
                variant="outlined"
                value={vehicle.lastMileage || 0}
                disabled // --- ไม่สามารถแก้ไขได้ ---
            />
            <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>ระดับน้ำมันปัจจุบัน</Typography>
                <FuelGauge level={vehicle.lastFuelLevel} />
            </Box>
            
            <FormControl fullWidth required>
              <InputLabel id="destination-select-label">สถานที่</InputLabel>
              <Select
                labelId="destination-select-label"
                value={destination}
                label="สถานที่"
                onChange={(e) => setDestination(e.target.value)}
              >
                {predefinedDestinations.map(dest => (
                  <MenuItem key={dest} value={dest}>{dest}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {destination === 'อื่นๆ' && (
              <TextField
                label="ระบุสถานที่อื่นๆ"
                fullWidth
                required
                variant="outlined"
                value={otherDestination}
                onChange={(e) => setOtherDestination(e.target.value)}
              />
            )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose}>ยกเลิก</Button>
        <Button onClick={handleConfirm} variant="contained">ยืนยันการเบิกรถ</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StartTripDialog;