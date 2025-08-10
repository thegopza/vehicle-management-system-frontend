import React from 'react';
import { Typography, Paper, Grid, Box, Container } from '@mui/material';
import { useNavigate, useOutletContext } from 'react-router-dom'; // <-- 1. Import hooks ที่จำเป็น
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// --- *** START: ส่วนที่แก้ไข *** ---
// 2. แก้ไข MenuCard ให้รับ props เพิ่ม และจัดการ event เอง
const MenuCard = ({ title, description, icon, path, groupKey, onCardClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    onCardClick(groupKey); // เรียกฟังก์ชันที่ได้รับจาก context เพื่อเปิด sidebar
    navigate(path);      // นำทางไปยังหน้าที่กำหนด
  };

  return (
    <Grid item xs={12} md={5}>
      <Paper
        onClick={handleClick} // <-- ใช้ onClick ที่สร้างขึ้น
        elevation={2}
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textDecoration: 'none',
          color: 'inherit',
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider',
          cursor: 'pointer', // <-- เพิ่ม cursor pointer
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
            borderColor: 'primary.main',
          },
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <Box sx={{ color: 'primary.main', mb: 2 }}>
          {React.cloneElement(icon, { sx: { fontSize: 40 } })}
        </Box>
        <Typography variant="h6" component="h2" fontWeight="bold">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {description}
        </Typography>
      </Paper>
    </Grid>
  );
};
// --- *** END: ส่วนที่แก้ไข *** ---

const DashboardPage = () => {
  // --- *** START: ส่วนที่แก้ไข *** ---
  // 3. ดึงฟังก์ชันมาจาก Layout ผ่าน useOutletContext
  const { handleGroupSelect } = useOutletContext();
  // --- *** END: ส่วนที่แก้ไข *** ---

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Box>
        <Grid container spacing={4} justifyContent="center">
          {/* --- *** START: ส่วนที่แก้ไข *** --- */}
          {/* 4. ส่ง props ที่จำเป็นเข้าไปใน MenuCard */}
          <MenuCard 
            title="ระบบจัดการยานพาหนะ"
            description="จัดการข้อมูลรถยนต์ และการเบิก-จ่าย"
            icon={<DirectionsCarIcon />}
            path="/vehicles/status"
            groupKey="vehicle"
            onCardClick={handleGroupSelect}
          />
          <MenuCard 
            title="ระบบลงเวลาทำงาน (OT)"
            description="บันทึกและจัดการเวลาทำงานล่วงเวลา"
            icon={<AccessTimeIcon />}
            path="/ot/request"
            groupKey="ot"
            onCardClick={handleGroupSelect}
          />
          {/* --- *** END: ส่วนที่แก้ไข *** --- */}
        </Grid>
      </Box>
    </Container>
  );
};

export default DashboardPage;