import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box, Typography, Slider } from '@mui/material';

const marks = [
  { value: 0, label: 'E' },
  { value: 4, label: '1/2' },
  { value: 8, label: 'F' },
];

const VehicleDialog = ({ open, onClose, onSave, vehicle }) => {
  const [name, setName] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [lastMileage, setLastMileage] = useState(0);
  const [lastFuelLevel, setLastFuelLevel] = useState(4);

  useEffect(() => {
    if (vehicle) {
      setName(vehicle.name || '');
      setLicensePlate(vehicle.licensePlate || '');
      setLastMileage(vehicle.lastMileage || 0);
      setLastFuelLevel(parseInt(vehicle.lastFuelLevel, 10) || 4);
    } else {
      setName('');
      setLicensePlate('');
      setLastMileage(0);
      setLastFuelLevel(4);
    }
  }, [vehicle, open]);

  const handleSave = () => {
    onSave({ 
        name, 
        licensePlate, 
        lastMileage: parseInt(lastMileage, 10) || 0, 
        lastFuelLevel: lastFuelLevel.toString() 
    });
  };

  const isEditing = !!vehicle;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isEditing ? 'แก้ไขข้อมูลรถยนต์' : 'เพิ่มรถยนต์ใหม่'}</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" label="ชื่อ/รุ่นรถยนต์" type="text" fullWidth variant="outlined" value={name} onChange={(e) => setName(e.target.value)} sx={{ mt: 2 }} />
        <TextField margin="dense" label="ป้ายทะเบียน" type="text" fullWidth variant="outlined" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} />
        <TextField margin="dense" label="เลขไมล์ล่าสุด" type="number" fullWidth variant="outlined" value={lastMileage} onChange={(e) => setLastMileage(e.target.value)} />
        <Typography gutterBottom sx={{mt: 2, color: 'text.secondary'}}>ระดับน้ำมันล่าสุด</Typography>
        <Slider
            value={lastFuelLevel}
            onChange={(e, newValue) => setLastFuelLevel(newValue)}
            step={1}
            min={0}
            max={8}
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

export default VehicleDialog;