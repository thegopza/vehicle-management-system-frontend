import React, { useState, useEffect } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  Box, Typography, Slider, FormControlLabel, Checkbox, List, ListItem, ListItemText, IconButton
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';

const marks = [
  { value: 0, label: 'E' },
  { value: 4, label: '1/2' },
  { value: 8, label: 'F' },
];

const EndTripDialog = ({ open, onClose, onConfirm, trip }) => {
  const [endMileage, setEndMileage] = useState('');
  const [fuelLevel, setFuelLevel] = useState(4);
  const [notes, setNotes] = useState('');
  const [hasAccident, setHasAccident] = useState(false);
  const [accidentDescription, setAccidentDescription] = useState('');
  const [accidentLocation, setAccidentLocation] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    if (trip && open) {
        const initialFuel = trip.status === 'PENDING_KEY_RETURN' 
            ? trip.fuelLevel
            : trip.vehicle?.lastFuelLevel;
        setEndMileage(trip.endMileage || '');
        setFuelLevel(parseInt(initialFuel, 10) || 4);
        setNotes(trip.notes || '');
        setHasAccident(false);
        setAccidentDescription('');
        setAccidentLocation('');
        setSelectedFiles([]);
    }
  }, [trip, open]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (selectedFiles.length + files.length > 4) {
      alert('สามารถอัปโหลดรูปภาพได้สูงสุด 4 รูปเท่านั้น');
      return;
    }
    setSelectedFiles(prevFiles => [...prevFiles, ...files]);
  };

  const handleRemoveFile = (fileName) => {
    setSelectedFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
  };

  const handleConfirm = () => {
    const endMileageValue = parseInt(endMileage, 10);
    if (!endMileage || endMileageValue < trip.startMileage) {
      alert('กรุณากรอกเลขไมล์สิ้นสุดให้ถูกต้อง (ต้องไม่น้อยกว่าเลขไมล์เริ่มต้น)');
      return;
    }
    if (hasAccident && (!accidentDescription || !accidentLocation)) {
        alert('กรุณากรอกรายละเอียดอุบัติเหตุให้ครบถ้วน');
        return;
    }
    
    const endTripData = {
      endMileage: endMileageValue,
      fuelLevel: fuelLevel.toString(),
      notes,
      hasAccident,
      accidentDescription,
      accidentLocation,
    };

    onConfirm(endTripData, selectedFiles);
  };

  if (!trip) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{trip.status === 'PENDING_KEY_RETURN' ? 'แก้ไขข้อมูลคืนรถ' : 'กรอกข้อมูลคืนรถ'}: {trip.vehicle.licensePlate}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            autoFocus
            required
            label="เลขไมล์สิ้นสุด"
            type="number"
            fullWidth
            variant="outlined"
            value={endMileage}
            onChange={(e) => setEndMileage(e.target.value)}
            helperText={`เลขไมล์เริ่มต้น: ${trip.startMileage.toLocaleString()} กม.`}
          />
          <Typography gutterBottom sx={{ color: 'text.secondary' }}>ระดับน้ำมัน</Typography>
          <Slider
            value={fuelLevel}
            onChange={(e, newValue) => setFuelLevel(newValue)}
            step={1} min={0} max={8}
            marks={marks}
            valueLabelDisplay="auto"
          />
          <TextField
            label="บันทึกเพิ่มเติม (ถ้ามี)"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <FormControlLabel
            control={<Checkbox checked={hasAccident} onChange={(e) => setHasAccident(e.target.checked)} />}
            label={
                <Typography sx={{ fontWeight: hasAccident ? 'bold' : 'normal', color: hasAccident ? 'error.main' : 'inherit' }}>
                    บันทึกอุบัติเหตุ
                </Typography>
            }
          />
          {hasAccident && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, border: '1px dashed grey', borderRadius: 2 }}>
              <Typography fontWeight="bold">รายละเอียดอุบัติเหตุ</Typography>
              <TextField required label="สถานที่เกิดเหตุ" fullWidth value={accidentLocation} onChange={(e) => setAccidentLocation(e.target.value)} />
              <TextField required label="อธิบายลักษณะเหตุการณ์" fullWidth multiline rows={3} value={accidentDescription} onChange={(e) => setAccidentDescription(e.target.value)} />
              
              <Box>
                <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AttachFileIcon />}
                    disabled={selectedFiles.length >= 4}
                >
                    เพิ่มรูปภาพ (สูงสุด 4 รูป)
                    <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
                </Button>
                <List dense>
                    {selectedFiles.map((file, index) => (
                        <ListItem
                            key={index}
                            secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFile(file.name)}>
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(2)} KB`} />
                        </ListItem>
                    ))}
                </List>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose}>ยกเลิก</Button>
        <Button onClick={handleConfirm} variant="contained" color="warning">ยืนยันข้อมูล</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EndTripDialog;
