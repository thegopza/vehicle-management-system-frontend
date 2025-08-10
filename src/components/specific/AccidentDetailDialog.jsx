import React, { useRef, useState } from 'react'; // --- START: เพิ่ม useState ---
import { Dialog, DialogContent, DialogTitle, IconButton, Box, Typography, Grid, Button, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import samLogo from '../../assets/logo.png';
import dayjs from 'dayjs';
import apiClient from '../../api/axiosConfig.js';
import ImageViewerDialog from '../common/ImageViewerDialog.jsx'; // --- START: เพิ่ม Import ---

const AccidentDetailDialog = ({ open, onClose, report }) => {
  const printRef = useRef();

  // --- START: เพิ่ม State สำหรับควบคุม Dialog รูปภาพ ---
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [viewingImageUrl, setViewingImageUrl] = useState('');
  // --- END: เพิ่ม State ---

  // --- START: เพิ่มฟังก์ชันสำหรับจัดการการคลิกรูปภาพ ---
  const handleViewImage = (imageUrl) => {
    setViewingImageUrl(imageUrl);
    setImageViewerOpen(true);
  };
  // --- END: เพิ่มฟังก์ชัน ---

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const content = printRef.current.innerHTML;
    printWindow.document.write(`
      <html>
        <head>
          <title>Accident Report - Trip ${report.tripId}</title>
          <style>
            body { font-family: sans-serif; margin: 20px; }
            .report-container { max-width: 800px; margin: auto; }
            .header { display: flex; align-items: center; margin-bottom: 20px; }
            .header img { height: 50px; margin-right: 16px; }
            .header-text h4, .header-text p { margin: 0; }
            .grid-item { padding: 8px; border: 1px solid #eee; border-radius: 8px; margin-bottom: 16px; }
            .photo-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-top: 16px;
            }
            .photo-placeholder {
              border: 2px dashed #ccc;
              background-color: #f9f9f9;
              height: 200px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #aaa;
              overflow: hidden;
            }
            .photo-placeholder img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
            @media print {
            }
          </style>
        </head>
        <body>
          <div class="report-container">${content}</div>
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

  if (!report) return null;

  const photoPlaceholders = Array(4).fill(null);
  if (report.photoUrls && Array.isArray(report.photoUrls)) {
    report.photoUrls.forEach((url, index) => {
      if (index < 4) {
        photoPlaceholders[index] = `${apiClient.defaults.baseURL}/files/${url}`;
      }
    });
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          รายละเอียดอุบัติเหตุ (Trip ID: {report.tripId})
          <Box>
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} className="no-print">
              พิมพ์
            </Button>
            <IconButton onClick={onClose} sx={{ ml: 2 }} className="no-print">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box ref={printRef}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <img src={samLogo} alt="Logo" style={{ height: '50px', marginRight: '16px' }} />
              <Box>
                <Typography variant="h5" component="h1" fontWeight="bold">บันทึกรายงานอุบัติเหตุ</Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box className="grid-item">
                  <Typography variant="caption" color="text.secondary">ผู้รายงาน</Typography>
                  <Typography>{report.reporterFirstName} {report.reporterLastName}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box className="grid-item">
                  <Typography variant="caption" color="text.secondary">วันที่/เวลาเกิดเหตุ</Typography>
                  <Typography>{dayjs(report.accidentTime).format('DD/MM/YYYY HH:mm')}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box className="grid-item">
                  <Typography variant="caption" color="text.secondary">สถานที่</Typography>
                  <Typography>{report.location}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box className="grid-item">
                  <Typography variant="caption" color="text.secondary">รายละเอียด</Typography>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{report.description}</Typography>
                </Box>
              </Grid>
            </Grid>
            <Box
              className="photo-grid"
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 2,
                mt: 3,
              }}
            >
              {photoPlaceholders.map((src, idx) => (
                <Box
                  key={idx}
                  // --- START: เพิ่ม Event Handler และ Style ---
                  onClick={() => src && handleViewImage(src)}
                  sx={{
                  // --- END: เพิ่ม Event Handler และ Style ---
                    border: '2px dashed #ccc',
                    backgroundColor: '#f9f9f9',
                    height: 200,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#aaa',
                    overflow: 'hidden',
                    // --- START: เพิ่ม Event Handler และ Style ---
                    cursor: src ? 'pointer' : 'default',
                    '&:hover': {
                      borderColor: src ? 'primary.main' : '#ccc',
                    }
                  }}
                  // --- END: เพิ่ม Event Handler และ Style ---
                >
                  {src
                    ? <img src={src} alt={`Accident photo ${idx + 1}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    : 'ไม่มีรูปภาพ'}
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* --- START: เพิ่ม Component สำหรับแสดงรูปภาพขนาดเต็ม --- */}
      <ImageViewerDialog
        open={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        imageUrl={viewingImageUrl}
      />
      {/* --- END: เพิ่ม Component --- */}
    </>
  );
};

export default AccidentDetailDialog;