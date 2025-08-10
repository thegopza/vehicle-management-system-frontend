import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OTRequestForm from './OTRequestForm';

const ApprovalEditDialog = ({ open, onClose, onSuccess, requestId }) => {
  if (!open || !requestId) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="lg"
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        ตรวจสอบและแก้ไขใบขออนุมัติ OT #{requestId}
        <IconButton edge="end" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2, pb: 2 }}>
        {/* --- *** START: ส่วนที่แก้ไข *** --- */}
        {/* Pass the isApproverEditMode prop to show the edit notes field */}
        <OTRequestForm
          editId={requestId}
          onSuccess={onSuccess}
          onCancel={onClose}
          isApproverEditMode={true}
        />
        {/* --- *** END: ส่วนที่แก้ไข *** --- */}
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalEditDialog;
