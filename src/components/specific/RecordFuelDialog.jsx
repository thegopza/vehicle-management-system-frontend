import React, { useState, useEffect } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  Box, Typography, IconButton, ListItem, ListItemText
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';

const RecordFuelDialog = ({ open, onClose, onConfirm, trip }) => {
  const [mileage, setMileage] = useState('');
  const [amount, setAmount] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setMileage('');
      setAmount('');
      setReceiptFile(null);
    }
  }, [open]);



  const handleRemoveFile = () => {
    setReceiptFile(null);
  };

  const handleConfirm = () => {
    const mileageValue = parseInt(mileage, 10);
    const amountValue = parseFloat(amount);

    if (!mileage || isNaN(mileageValue) || mileageValue < trip.startMileage) {
      alert(`กรุณากรอกเลขไมล์ให้ถูกต้อง (ต้องไม่น้อยกว่าเลขไมล์เริ่มต้น: ${trip.startMileage.toLocaleString()})`);
      return;
    }
    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      alert('กรุณากรอกจำนวนเงินให้ถูกต้อง');
      return;
    }

    const fuelData = {
      mileageAtRefuel: mileageValue,
      amountPaid: amountValue,
    };

    onConfirm(fuelData, receiptFile);
  };

  if (!trip) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>บันทึกการเติมน้ำมัน</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            สำหรับ Trip ID: {trip.id} ({trip.vehicle.licensePlate})
          </Typography>
          <TextField
            autoFocus
            required
            label="เลขไมล์ปัจจุบัน"
            type="number"
            fullWidth
            variant="outlined"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
          />
          <TextField
            required
            label="จำนวนเงินที่เติม (บาท)"
            type="number"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          
          {receiptFile && (
            <ListItem
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={handleRemoveFile}>
                  <DeleteIcon />
                </IconButton>
              }
              sx={{ bgcolor: 'grey.100', borderRadius: 1 }}
            >
              <ListItemText primary={receiptFile.name} secondary={`${(receiptFile.size / 1024).toFixed(2)} KB`} />
            </ListItem>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose}>ยกเลิก</Button>
        <Button onClick={handleConfirm} variant="contained">บันทึก</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecordFuelDialog;
