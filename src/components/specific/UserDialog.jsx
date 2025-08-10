import React, { useState, useEffect } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  Box, Typography, FormGroup, FormControlLabel, Checkbox, Switch
} from '@mui/material';
import useAuth from '../../hooks/useAuth';

const allRoles = ['admin', 'manager', 'user', 'key_returner', 'cao'];

const UserDialog = ({ open, onClose, onSave, user }) => {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({});
  const isEditing = !!user;

  const isTargetCao = user?.roles?.includes('cao');
  const isCurrentUserCao = currentUser?.roles?.includes('ROLE_CAO');
  const isCurrentUserAdminOnly = currentUser?.roles?.includes('ROLE_ADMIN') && !isCurrentUserCao;
  const isFormDisabled = isEditing && isTargetCao && isCurrentUserAdminOnly;

  useEffect(() => {
    if (open) {
      if (isEditing) {
        setFormData({
          username: user.username || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          password: '',
          roles: new Set(user.roles || []),
          active: user.active,
        });
      } else {
        setFormData({
          username: '',
          firstName: '',
          lastName: '',
          password: '',
          roles: new Set(['user']),
          active: true,
        });
      }
    }
  }, [user, open, isEditing]);

  const handleRoleChange = (event) => {
    const { name, checked } = event.target;
    setFormData(prev => {
      const newRoles = new Set(prev.roles);
      if (checked) {
        newRoles.add(name);
      } else {
        newRoles.delete(name);
      }
      return { ...prev, roles: newRoles };
    });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleActiveChange = (event) => {
    setFormData(prev => ({ ...prev, active: event.target.checked }));
  };

  const handleSave = () => {
    const dataToSend = { ...formData, roles: Array.from(formData.roles) };
    if (!isEditing && !dataToSend.password) {
        alert('กรุณากำหนดรหัสผ่านสำหรับผู้ใช้ใหม่');
        return;
    }
    onSave(dataToSend);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isEditing ? `แก้ไขผู้ใช้งาน: ${user.username}` : 'เพิ่มผู้ใช้งานใหม่'}</DialogTitle>
      <DialogContent>
        <TextField margin="dense" label="Username" name="username" fullWidth value={formData.username || ''} onChange={handleFormChange} sx={{ mt: 2 }} disabled={isEditing} />
        
        {!isEditing && (
            <TextField margin="dense" label="Password" name="password" type="password" fullWidth value={formData.password || ''} onChange={handleFormChange} />
        )}

        <TextField margin="dense" label="ชื่อจริง" name="firstName" fullWidth value={formData.firstName || ''} onChange={handleFormChange} disabled={isFormDisabled} />
        <TextField margin="dense" label="นามสกุล" name="lastName" fullWidth value={formData.lastName || ''} onChange={handleFormChange} disabled={isFormDisabled} />
        
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>Roles</Typography>
        <FormGroup sx={{ pl: 1 }}>
          {allRoles.map(role => {
            // --- ส่วนที่แก้ไข: ซ่อนตัวเลือก CAO ถ้าไม่ใช่ CAO ---
            if (role === 'cao' && !isCurrentUserCao) {
              return null;
            }
            // ---------------------------------------------
            return (
              <FormControlLabel
                key={role}
                control={<Checkbox checked={formData.roles?.has(role)} onChange={handleRoleChange} name={role} disabled={isFormDisabled} />}
                label={role.toUpperCase()}
              />
            );
          })}
        </FormGroup>

        <FormControlLabel
            control={<Switch checked={formData.active} onChange={handleActiveChange} disabled={isFormDisabled} />}
            label={formData.active ? "Active" : "Inactive"}
        />
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose}>ยกเลิก</Button>
        <Button onClick={handleSave} variant="contained" disabled={isFormDisabled}>บันทึก</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDialog;
