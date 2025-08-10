import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box, Typography, Slider, Divider } from '@mui/material';

const marks = [
  { value: 0, label: 'E' },
  { value: 4, label: '1/2' },
  { value: 8, label: 'F' },
];

const KeyReturnDialog = ({ open, onClose, onConfirm, trip }) => {
  const [endMileage, setEndMileage] = useState(0);
  const [fuelLevel, setFuelLevel] = useState(4);

  useEffect(() => {
    if (trip && open) {
      setEndMileage(trip.endMileage || 0);
      setFuelLevel(parseInt(trip.fuelLevel, 10) || 4);
    }
  }, [trip, open]);

  const handleConfirm = () => {
    const endMileageValue = parseInt(endMileage, 10);

    // --- ส่วนที่แก้ไข: เพิ่มการตรวจสอบเลขไมล์ ---
    if (endMileageValue < trip.startMileage) {
      alert(`เลขไมล์สิ้นสุด (${endMileageValue.toLocaleString()}) ต้องไม่น้อยกว่าเลขไมล์เริ่มต้น (${trip.startMileage.toLocaleString()})`);
      return;
    }
    // ------------------------------------------

    onConfirm({
      endMileage: endMileageValue,
      fuelLevel: fuelLevel.toString(),
    });
  };

  if (!trip) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>ตรวจสอบข้อมูลคืนรถ</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Typography variant="h6">
            ทะเบียนรถ: <Box component="span" sx={{ color: 'red', fontWeight: 'bold' }}>{trip.vehicle.licensePlate}</Box>
          </Typography>
          <Divider />
          <TextField
            label="เลขไมล์ที่บันทึก (แก้ไขได้)"
            type="number"
            fullWidth
            variant="outlined"
            value={endMileage}
            onChange={(e) => setEndMileage(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ '& .MuiOutlinedInput-root': { '& input': { color: 'red' } } }}
            helperText={`เลขไมล์เริ่มต้น: ${trip.startMileage.toLocaleString()}`}
          />
          <Typography sx={{ color: 'text.secondary' }}>
            ระดับน้ำมันที่บันทึก (แก้ไขได้)
          </Typography>
          <Slider
            value={fuelLevel}
            onChange={(e, newValue) => setFuelLevel(newValue)}
            step={1} min={0} max={8}
            marks={marks}
            valueLabelDisplay="auto"
            sx={{ color: 'red' }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose}>ยกเลิก</Button>
        <Button onClick={handleConfirm} variant="contained">ยืนยันข้อมูล</Button>
      </DialogActions>
    </Dialog>
  );
};

export default KeyReturnDialog;