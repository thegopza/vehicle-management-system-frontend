import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OTRequestForm from './OTRequestForm'; // 1. Import คอมโพเนนต์กลาง

const EditOTRequestDialog = ({ open, onClose, onSuccess, requestId }) => {
  // 2. ลบ State และ Logic ที่เกี่ยวกับฟอร์มทั้งหมดออกไป
  // เหลือเพียงการรับ props และควบคุม Dialog

  if (!open) return null; // ไม่ต้อง Render อะไรเลยถ้า Dialog ไม่ได้เปิด

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        แก้ไขใบขออนุมัติ OT #{requestId}
        <IconButton edge="end" onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2, pb: 2 }}>
        {/* 3. เรียกใช้ OTRequestForm และส่ง props ที่จำเป็นเข้าไป */}
        <OTRequestForm
          editId={requestId}
          onSuccess={onSuccess}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditOTRequestDialog;