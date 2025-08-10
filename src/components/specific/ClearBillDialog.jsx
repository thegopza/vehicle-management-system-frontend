import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogContent, DialogTitle, IconButton, Box, Typography, Button,
  Divider, TextField, InputAdornment, DialogActions, Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import dayjs from 'dayjs';

const ClearBillDialog = ({ open, onClose,  record }) => {
  const printContentRef = useRef(); 
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (record && open) {
      setFormData({
        mileageAtRefuel: record.mileageAtRefuel || '',
        amountPaid: record.amountPaid || '',
        project: record.project || '',
        serviceProvider: record.serviceProvider || '',
        amountWithdrawn: record.amountWithdrawn || 0,
      });
    }
  }, [record, open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const content = printContentRef.current.innerHTML; 
    printWindow.document.write(`
        <html>
        <head>
            <title>ใบสำคัญจ่ายค่าเติมน้ำมัน - Record ${record.id}</title>
            <style>
            body { font-family: 'Sarabun', sans-serif; margin: 2rem; }
            .print-container { max-width: 800px; margin: auto; }
            .header { text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 1.5rem; margin-top: 1.5rem; font-size: 14px; }
            .full-width { grid-column: 1 / -1; }
            .info-item { padding: 8px 0; border-bottom: 1px dotted #999; }
            .info-item b { font-weight: 600; }
            .signature-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem; text-align: center; margin-top: 80px; }
            .signature-box { padding-top: 40px; border-top: 1px dotted black; }
            @media print { .no-print { display: none; } }
            </style>
            <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600&display=swap" rel="stylesheet">
        </head>
        <body>
            <div class="print-container">${content}</div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
   };

  if (!record) return null;

  const amountPaid = parseFloat(formData.amountPaid) || 0;
  const amountWithdrawn = parseFloat(formData.amountWithdrawn) || 0;
  const difference = amountPaid - amountWithdrawn;

  return (
    <>
      <div style={{ display: 'none' }}>
        <div ref={printContentRef}>
            <div className="header">
                <h1>ใบสำคัญจ่ายค่าเติมน้ำมัน</h1>
            </div>
            <br/>
            <div className="info-grid">
                <div className="info-item"><b>ผู้บันทึก:</b> {`${record.recordedByFirstName || ''} ${record.recordedByLastName || ''}`}</div>
                <div className="info-item"><b>วันที่บันทึก:</b> {dayjs(record.recordTimestamp).format('DD/MM/YYYY HH:mm')}</div>
                
                {/* --- ส่วนที่แก้ไข --- */}
                <div className="info-item"><b>โครงการ:</b> {formData.project || '..............................'}</div>
                <div className="info-item"><b>ทะเบียนรถ:</b> {record.licensePlate || '-'}</div>
                {/* ------------------- */}
                
                <div className="info-item full-width"><b>บริษัทผู้ให้บริการ:</b> {formData.serviceProvider || '..............................'}</div>
                <div className="info-item"><b>เลขไมล์:</b> {Number(formData.mileageAtRefuel || 0).toLocaleString()} กม.</div>
                <div className="info-item"><b>จำนวนเงินที่เติม:</b> {Number(formData.amountPaid || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</div>
                <div className="info-item full-width"><b>จำนวนเงินที่เบิก:</b> {Number(formData.amountWithdrawn || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</div>
                
                {difference !== 0 && (
                    <div className="info-item full-width">
                        <b>ผลต่าง:</b> {
                            difference > 0 
                            ? `เบิกเพิ่ม ${difference.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท`
                            : `เงินทอน ${(-difference).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท`
                        }
                    </div>
                )}
            </div>
            <div className="signature-grid">
                <div className="signature-box">ผู้จ่ายเงิน</div>
                <div className="signature-box">ผู้ตรวจสอบ</div>
                <div className="signature-box">ผู้อนุมัติ</div>
            </div>
        </div>
      </div>

      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          เคลียร์บิลน้ำมัน (ID: {record.id})
          <Box>
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} className="no-print">พิมพ์</Button>
            <IconButton onClick={onClose} sx={{ ml: 2 }} className="no-print"><CloseIcon /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <Typography variant="h5" component="h1" fontWeight="bold">เคลียร์บิลน้ำมัน</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <div className="info-grid" style={{ display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
                <Typography variant="body2"><b>ผู้เติม:</b> {`${record.recordedByFirstName || ''} ${record.recordedByLastName || ''}`}</Typography>
                <Typography variant="body2"><b>เวลาที่เติม:</b> {dayjs(record.recordTimestamp).format('DD/MM/YYYY HH:mm')}</Typography>
              </div>
              <div style={{ padding: '8px 0' }}>
                <TextField label="โครงการ" name="project" value={formData.project || ''} onChange={handleInputChange} fullWidth variant="standard" />
              </div>
              <div style={{ padding: '8px 0' }}>
                <TextField label="ชื่อบริษัทผู้ให้บริการ" name="serviceProvider" value={formData.serviceProvider || ''} onChange={handleInputChange} fullWidth variant="standard" />
              </div>
              <div style={{ display: 'flex', gap: '1rem', padding: '8px 0' }}>
                <TextField label="เลขไมล์ (แก้ไขได้)" name="mileageAtRefuel" type="number" value={formData.mileageAtRefuel || ''} onChange={handleInputChange} fullWidth variant="standard" />
                <TextField label="จำนวนเงินที่เติม (แก้ไขได้)" name="amountPaid" type="number" value={formData.amountPaid || ''} onChange={handleInputChange} fullWidth variant="standard" InputProps={{ endAdornment: <InputAdornment position="end">บาท</InputAdornment> }} />
              </div>
              <div style={{ padding: '8px 0' }}>
                <TextField label="จำนวนเงินที่เบิก" name="amountWithdrawn" type="number" value={formData.amountWithdrawn || 0} onChange={handleInputChange} fullWidth variant="standard" InputProps={{ endAdornment: <InputAdornment position="end">บาท</InputAdornment> }} />
              </div>
              <div style={{ paddingTop: '8px' }}>
                {difference > 0 && (
                  <Typography color="error.main"><b>เบิกเพิ่ม:</b> {difference.toLocaleString('en-US', { minimumFractionDigits: 2 })} บาท</Typography>
                )}
                {difference < 0 && (
                  <Typography color="success.main"><b>เงินทอน:</b> {(-difference).toLocaleString('en-US', { minimumFractionDigits: 2 })} บาท</Typography>
                )}
              </div>
            </div>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={onClose}>ยกเลิก</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClearBillDialog;