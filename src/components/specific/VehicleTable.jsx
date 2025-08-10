import React from 'react';
import { Box, Tooltip, IconButton, Chip, Typography, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';

const FuelGauge = ({ level = 0 }) => {
  const maxLevel = 8;
  const parsedLevel = parseInt(level, 10);
  if (isNaN(parsedLevel)) return '-';

  const percentage = (parsedLevel / maxLevel) * 100;
  const barColor = percentage > 50 ? 'success.main' : percentage > 25 ? 'warning.main' : 'error.main';

  return (
    <Tooltip title={`${parsedLevel}/8`}>
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', height: '6px', backgroundColor: 'grey.300', borderRadius: '3px', overflow: 'hidden' }}>
          <Box sx={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: barColor,
            borderRadius: '3px',
          }} />
        </Box>
      </Box>
    </Tooltip>
  );
};

const VehicleTable = ({ vehicles, onEdit, onDelete, onReactivate }) => {
    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'ชื่อ/รุ่นรถยนต์', flex: 0.8, minWidth: 150 },
        { field: 'licensePlate', headerName: 'ป้ายทะเบียน', width: 130 },
        { 
            field: 'lastMileage', 
            headerName: 'เลขไมล์ล่าสุด', 
            width: 130, 
            type: 'number',
            valueFormatter: (value) => (value != null ? value.toLocaleString() : '0')
        },
        { 
            field: 'lastFuelLevel', 
            headerName: 'ระดับน้ำมัน', 
            width: 120,
            sortable: false,
            // --- ส่วนที่แก้ไข: เพิ่ม Box มาครอบเพื่อจัดกลาง ---
            renderCell: (params) => (
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', height: '100%' }}>
                    <FuelGauge level={params.value} />
                </Box>
            )
            // ----------------------------------------
        },
        {
          field: 'available',
          headerName: 'สถานะ',
          width: 120,
          align: 'center',
          headerAlign: 'center',
          renderCell: (params) => (
            <Chip
              label={params.value ? 'ว่าง' : 'ไม่ว่าง'}
              color={params.value ? 'success' : 'error'}
              size="small"
            />
          ),
        },
        {
          field: 'actions',
          headerName: 'จัดการ',
          sortable: false,
          filterable: false,
          width: 150,
          align: 'center',
          headerAlign: 'center',
          renderCell: (params) => {
            const vehicle = params.row;
            return vehicle.active ? (
              <Box>
                <Tooltip title="แก้ไข">
                  <IconButton color="primary" onClick={() => onEdit(vehicle)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="ปิดการใช้งาน">
                  <IconButton color="error" onClick={() => onDelete(vehicle.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            ) : (
              <Tooltip title="เปิดใช้งานอีกครั้ง">
                <IconButton color="success" onClick={() => onReactivate(vehicle.id)}>
                  <RestoreFromTrashIcon />
                </IconButton>
              </Tooltip>
            );
          },
        },
      ];

  if (!vehicles || vehicles.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography>ไม่มีข้อมูลรถยนต์ในหมวดหมู่นี้</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ height: 650, width: '100%' }}> 
      <DataGrid
        rows={vehicles}
        columns={columns}
        getRowId={(row) => row.id}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 20]}
        disableRowSelectionOnClick
        sx={{ border: 0 }}
      />
    </Box>
  );
};

export default VehicleTable;
