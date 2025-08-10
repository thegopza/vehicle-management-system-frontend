import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Grid, Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
// --- *** START: ส่วนที่แก้ไข *** ---
// เปลี่ยนจากการ import 'API_BASE_URL' มาเป็น import 'apiClient' ซึ่งเป็น default export
import apiClient from '../../api/axiosConfig'; 
// --- *** END: ส่วนที่แก้ไข *** ---

const AttachmentViewerDialog = ({ open, onClose, attachments = [] }) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                ไฟล์แนบ
                <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {attachments.length > 0 ? (
                    <Grid container spacing={2}>
                        {attachments.map((fileName, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                {/* --- *** START: ส่วนที่แก้ไข *** --- */}
                                {/* เปลี่ยนมาใช้ apiClient.defaults.baseURL ในการสร้าง URL ที่สมบูรณ์ */}
                                <a href={`${apiClient.defaults.baseURL}/files/${fileName}`} target="_blank" rel="noopener noreferrer">
                                    <Box
                                        component="img"
                                        src={`${apiClient.defaults.baseURL}/files/${fileName}`}
                                        alt={`Attachment ${index + 1}`}
                                        sx={{
                                            width: '100%',
                                            height: 200,
                                            objectFit: 'cover',
                                            borderRadius: 2,
                                            border: '1px solid #ddd'
                                        }}
                                    />
                                </a>
                                {/* --- *** END: ส่วนที่แก้ไข *** --- */}
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography>ไม่มีไฟล์แนบ</Typography>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AttachmentViewerDialog;
