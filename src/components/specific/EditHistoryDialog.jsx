import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Slider } from '@mui/material';

const marks = [
  { value: 0, label: 'E' },
  { value: 4, label: '1/2' },
  { value: 8, label: 'F' },
];

const EditHistoryDialog = ({ open, onClose, onSave, trip }) => {
  const [endMileage, setEndMileage] = useState(0);
  const [fuelLevel, setFuelLevel] = useState(4);

  useEffect(() => {
    if (trip && open) {
      setEndMileage(trip.endMileage || 0);
      setFuelLevel(parseInt(trip.fuelLevel, 10) || 4);
    }
  }, [trip, open]);

  const handleSave = () => {
    const endMileageValue = parseInt(endMileage, 10);
    if (endMileageValue < trip.startMileage) {
        alert('เลขไมล์สิ้นสุดต้องไม่น้อยกว่าเลขไมล์เริ่มต้น');
        return;
    }
    onSave({
      endMileage: endMileageValue,
      fuelLevel: fuelLevel.toString(),
    });
  };

  if (!trip) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>แก้ไขข้อมูล Trip ID: {trip.id}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="เลขไมล์ที่คืน (แก้ไข)"
          type="number"
          fullWidth
          variant="outlined"
          value={endMileage}
          onChange={(e) => setEndMileage(e.target.value)}
          helperText={`เลขไมล์เริ่มต้น: ${trip.startMileage.toLocaleString()}`}
          sx={{ mt: 2 }}
        />
        <Typography gutterBottom sx={{ mt: 2, color: 'text.secondary' }}>ระดับน้ำมันที่คืน (แก้ไข)</Typography>
        <Slider
          value={fuelLevel}
          onChange={(e, newValue) => setFuelLevel(newValue)}
          step={1} min={0} max={8}
          marks={marks}
          valueLabelDisplay="auto"
        />
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose}>ยกเลิก</Button>
        <Button onClick={handleSave} variant="contained">บันทึก</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditHistoryDialog;
