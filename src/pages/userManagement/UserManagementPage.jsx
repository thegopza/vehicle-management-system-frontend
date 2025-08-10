import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, CircularProgress, Paper, Chip, IconButton, Button, Tabs, Tab, Divider, Tooltip } from '@mui/material'; // <-- เพิ่ม Tooltip ที่นี่
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import userService from '../../api/userService.js';
import useSnackbar from '../../hooks/useSnackbar.js';
import UserDialog from '../../components/specific/UserDialog.jsx';
import useAuth from '../../hooks/useAuth.js';
import ConfirmationDialog from '../../components/common/ConfirmationDialog.jsx';

const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbar();
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);

  const columns = useMemo(() => [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'username', headerName: 'Username', width: 180 },
    { field: 'fullName', headerName: 'ชื่อ-นามสกุล', flex: 1, minWidth: 200, valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}` },
    {
      field: 'roles',
      headerName: 'Roles',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {params.value.map(role => <Chip key={role} label={role.toUpperCase()} size="small" />)}
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'จัดการ',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => {
        const isTargetCao = params.row.roles.includes('cao');
        const isCurrentUserAdminOnly = currentUser?.roles?.includes('ROLE_ADMIN') && !currentUser?.roles?.includes('ROLE_CAO');
        const isEditDisabled = isTargetCao && isCurrentUserAdminOnly;

        return (
            <Box>
                <Tooltip title="แก้ไข">
                    <span>
                        <IconButton onClick={() => handleOpenEditDialog(params.row)} disabled={isEditDisabled}>
                            <EditIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title={params.row.active ? "ปิดการใช้งาน" : "เปิดใช้งานอีกครั้ง"}>
                    <span>
                        <IconButton 
                            onClick={() => handleOpenConfirmDialog(params.row)} 
                            disabled={isEditDisabled}
                            color={params.row.active ? "error" : "success"}
                        >
                            {params.row.active ? <ToggleOffIcon /> : <ToggleOnIcon />}
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>
        );
      },
    },
  ], [currentUser]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      showSnackbar('ไม่สามารถดึงข้อมูลผู้ใช้งานได้', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  const activeUsers = useMemo(() => users.filter(u => u.active), [users]);
  const inactiveUsers = useMemo(() => users.filter(u => !u.active), [users]);

  const handleOpenAddDialog = () => {
    setEditingUser(null);
    setUserDialogOpen(true);
  };

  const handleOpenEditDialog = (user) => {
    setEditingUser(user);
    setUserDialogOpen(true);
  };
  
  const handleOpenConfirmDialog = (user) => {
    setUserToToggle(user);
    setConfirmDialogOpen(true);
  };

  const handleToggleActive = async () => {
    if (!userToToggle) return;
    try {
        const updatedData = {
            ...userToToggle,
            roles: userToToggle.roles,
            active: !userToToggle.active
        };
      await userService.updateUser(userToToggle.id, updatedData);
      showSnackbar(`เปลี่ยนสถานะผู้ใช้ ${userToToggle.username} สำเร็จ`, 'success');
      setConfirmDialogOpen(false);
      fetchUsers();
    } catch (err) {
      showSnackbar('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ', 'error');
      console.error(err);
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, userData);
        showSnackbar('อัปเดตข้อมูลผู้ใช้สำเร็จ', 'success');
      } else {
        await userService.createUser(userData);
        showSnackbar('เพิ่มผู้ใช้งานใหม่สำเร็จ', 'success');
      }
      setUserDialogOpen(false);
      fetchUsers();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาด';
      showSnackbar(errorMessage, 'error');
      console.error(err);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Paper elevation={3} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">จัดการผู้ใช้งาน</Typography>
        <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
        >
            เพิ่มผู้ใช้งาน
        </Button>
      </Box>
      <Divider />
      <Box>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ px: 3 }}>
          <Tab label={`ผู้ใช้งานอยู่ (${activeUsers.length})`} />
          <Tab label={`ผู้ใช้ที่ไม่ใช้งาน (${inactiveUsers.length})`} />
        </Tabs>
      </Box>
      <Box sx={{ height: 600, width: '100%' }}>
        {tabValue === 0 && (
            <DataGrid
                rows={activeUsers}
                columns={columns}
                getRowId={(row) => row.id}
                pageSizeOptions={[10, 25, 50]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                disableRowSelectionOnClick
            />
        )}
        {tabValue === 1 && (
            <DataGrid
                rows={inactiveUsers}
                columns={columns}
                getRowId={(row) => row.id}
                pageSizeOptions={[10, 25, 50]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                disableRowSelectionOnClick
            />
        )}
      </Box>
      <UserDialog 
        open={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        onSave={handleSaveUser}
        user={editingUser}
      />
      <ConfirmationDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleToggleActive}
        title={`ยืนยันการ${userToToggle?.active ? 'ปิด' : 'เปิด'}การใช้งาน`}
        message={`คุณแน่ใจหรือไม่ว่าต้องการ${userToToggle?.active ? 'ปิด' : 'เปิด'}การใช้งานผู้ใช้ ${userToToggle?.username}?`}
      />
    </Paper>
  );
};

export default UserManagementPage;
