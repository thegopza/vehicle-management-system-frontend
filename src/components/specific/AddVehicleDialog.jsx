import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';

const AddVehicleDialog = ({ open, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [licensePlate, setLicensePlate] = useState('');

  const handleSave = () => {
    onSave({ name, licensePlate });
    setName('');
    setLicensePlate('');
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>เพิ่มรถยนต์ใหม่</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          กรุณากรอกข้อมูลรถยนต์ที่ต้องการเพิ่มเข้าระบบ
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="ชื่อ/รุ่นรถยนต์"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="dense"
          id="licensePlate"
          label="ป้ายทะเบียน"
          type="text"
          fullWidth
          variant="outlined"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ยกเลิก</Button>
        <Button onClick={handleSave} variant="contained">บันทึก</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddVehicleDialog;