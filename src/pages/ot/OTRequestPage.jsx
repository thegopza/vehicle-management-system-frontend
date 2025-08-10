import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
// *** จุดที่แก้ไข: เปลี่ยน Path ให้ถูกต้อง ***
import OTRequestForm from '../../components/specific/OTRequestForm';

const OTRequestPage = () => {
    const navigate = useNavigate();

    // ฟังก์ชันนี้จะถูกเรียกเมื่อสร้างคำขอสำเร็จ
    const handleCreateSuccess = () => {
        // สามารถเพิ่ม Logic อื่นๆ ตรงนี้ได้ เช่น reset form (ซึ่ง form จัดการตัวเองอยู่แล้ว)
        // หรือจะนำทางผู้ใช้ไปหน้าอื่นก็ได้
        // navigate('/ot/my-history'); 
    };

    return (
        <Paper elevation={3} sx={{ p: 3, borderRadius: '16px' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                สร้างใบขออนุมัติ OT
            </Typography>
            <Box mt={2}>
                {/* เรียกใช้ Form กลางในโหมด "สร้างใหม่" (ไม่ส่ง editId)
                  เมื่อสำเร็จ (onSuccess) ให้เรียก handleCreateSuccess
                */}
                <OTRequestForm onSuccess={handleCreateSuccess} />
            </Box>
        </Paper>
    );
};

export default OTRequestPage;