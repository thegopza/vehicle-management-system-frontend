import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Paper, Button, Tooltip, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import fuelService from '../../api/fuelService.js';
import dayjs from 'dayjs';
import useSnackbar from '../../hooks/useSnackbar.js';
import ClearBillDialog from '../../components/specific/ClearBillDialog.jsx';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ClearBillPage = () => {
    const [pendingRecords, setPendingRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showSnackbar } = useSnackbar();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const fetchPendingRecords = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fuelService.getPendingFuelRecords();
            setPendingRecords(response.data);
        } catch (err) {
            showSnackbar("ไม่สามารถดึงข้อมูลบิลน้ำมันได้", 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [showSnackbar]);

    useEffect(() => {
        fetchPendingRecords();
    }, [fetchPendingRecords]);

    const handleClearBillClick = (record) => {
        setSelectedRecord(record);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedRecord(null);
    };

    // --- ส่วนที่แก้ไข ---
    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { 
            field: 'licensePlate', 
            headerName: 'ทะเบียนรถ', 
            width: 130,
            renderCell: (params) => (
                <Chip label={params.value} size="small" variant="outlined" />
            )
        },
        { 
            field: 'recordedBy', 
            headerName: 'ผู้บันทึก', 
            width: 180,
            valueGetter: (value, row) => `${row.recordedByFirstName || ''} ${row.recordedByLastName || ''}`
        },
        { 
            field: 'recordTimestamp', 
            headerName: 'เวลาที่บันทึก', 
            width: 160,
            valueGetter: (value) => dayjs(value).format('DD/MM/YYYY HH:mm')
        },
        { 
            field: 'mileageAtRefuel', 
            headerName: 'เลขไมล์', 
            width: 120,
            type: 'number',
            valueGetter: (value) => value,
            renderCell: (params) => params.value?.toLocaleString() || '-'
        },
        { 
            field: 'amountPaid', 
            headerName: 'จำนวนเงิน (บาท)', 
            width: 150,
            type: 'number',
            renderCell: (params) => params.value?.toLocaleString('th-TH', { minimumFractionDigits: 2 })
        },
        {
            field: 'actions',
            headerName: 'จัดการ',
            sortable: false,
            flex: 1,
            minWidth: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleClearBillClick(params.row)}
                >
                    เคลียร์บิล
                </Button>
            ),
        },
    ];
    // -------------------

    if (loading) return <CircularProgress />;

    return (
        <>
            <Paper elevation={3} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
                <Box sx={{ p: 3 }}>
                    <Typography variant="h5" fontWeight="bold">รายการเคลียร์บิลน้ำมัน</Typography>
                    <Typography variant="body2" color="text.secondary">
                        แสดงรายการบิลน้ำมันทั้งหมดที่รอการตรวจสอบและเคลียร์ยอด
                    </Typography>
                </Box>
                <Box sx={{ height: 'calc(100vh - 250px)', width: '100%' }}>
                    <DataGrid 
                        rows={pendingRecords}
                        columns={columns}
                        getRowId={(row) => row.id}
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    />
                </Box>
            </Paper>

            {/* Dialog จะใช้ข้อมูลจาก DTO โดยอัตโนมัติ */}
            <ClearBillDialog
                open={dialogOpen}
                onClose={handleDialogClose}
                record={selectedRecord}
            />
        </>
    );
};

export default ClearBillPage;