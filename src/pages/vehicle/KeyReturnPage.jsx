import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Paper, Button, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import keyReturnerService from '../../api/keyReturnerService.js';
import dayjs from 'dayjs';
import ConfirmationDialog from '../../components/common/ConfirmationDialog.jsx';
import KeyReturnDialog from '../../components/specific/KeyReturnDialog.jsx';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import useSnackbar from '../../hooks/useSnackbar.js';

const KeyReturnPage = () => {
    const [pendingTrips, setPendingTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showSnackbar } = useSnackbar();
    
    const [keyReturnDialogOpen, setKeyReturnDialogOpen] = useState(false);
    const [confirmFinalDialogOpen, setConfirmFinalDialogOpen] = useState(false);
    
    const [processingTrip, setProcessingTrip] = useState(null);
    const [dataToConfirm, setDataToConfirm] = useState(null);

    const columns = [
        { field: 'id', headerName: 'Trip ID', width: 80 },
        { 
            field: 'vehicleName', 
            headerName: 'รถยนต์', 
            width: 180, 
            valueGetter: (value, row) => `${row.vehicle?.name} (${row.vehicle?.licensePlate})` 
        },
        { 
            field: 'returnedBy', 
            headerName: 'ผู้คืน', 
            width: 180, 
            valueGetter: (value, row) => row.returnedBy ? `${row.returnedBy.firstName} ${row.returnedBy.lastName}` : '-' 
        },
        { 
            field: 'endTime', 
            headerName: 'เวลาที่คืน', 
            width: 160, 
            valueGetter: (value, row) => row.endTime ? dayjs(row.endTime).format('DD/MM/YYYY HH:mm') : '-'
        },
        { 
            field: 'endMileage', 
            headerName: 'ไมล์ (คืน)', 
            width: 120, 
            type: 'number',
            valueGetter: (value, row) => row.endMileage,
            renderCell: (params) => params.value != null ? params.value.toLocaleString() : '-'
        },
        {
            field: 'distanceUsed',
            headerName: 'ระยะทาง (กม.)',
            width: 130,
            type: 'number',
            valueGetter: (value, row) => {
                if (row.endMileage != null && row.startMileage != null) {
                    return row.endMileage - row.startMileage;
                }
                return null;
            },
            renderCell: (params) => params.value != null ? params.value.toLocaleString() : '-'
        },
        {
            field: 'actions',
            headerName: 'ยืนยัน',
            sortable: false,
            flex: 1,
            minWidth: 120,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Tooltip title="ยืนยันการรับคืนกุญแจ">
                    <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckCircleOutlineIcon />}
                        onClick={() => handleOpenKeyReturnDialog(params.row)}
                    >
                        ยืนยัน
                    </Button>
                </Tooltip>
            ),
        },
    ];

    const fetchPendingTrips = async () => {
        try {
            setLoading(true);
            const response = await keyReturnerService.getPendingKeyReturnTrips();
            setPendingTrips(response.data);
        } catch (err) {
            showSnackbar("ไม่สามารถดึงข้อมูลได้", 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingTrips();
    }, []);

    const handleOpenKeyReturnDialog = (trip) => {
        setProcessingTrip(trip);
        setKeyReturnDialogOpen(true);
    };

    const handleConfirmEdits = (editedData) => {
        setDataToConfirm(editedData);
        setKeyReturnDialogOpen(false);
        setConfirmFinalDialogOpen(true);
    };

    const handleFinalConfirm = async () => {
        try {
            if (!processingTrip || !dataToConfirm) return;
            await keyReturnerService.confirmKeyReturn(processingTrip.id, dataToConfirm);
            setConfirmFinalDialogOpen(false);
            setProcessingTrip(null);
            setDataToConfirm(null);
            showSnackbar('ยืนยันการคืนกุญแจสำเร็จ! รถกลับสู่สถานะว่างแล้ว', 'success');
            fetchPendingTrips();
        } catch (err) {
            showSnackbar("เกิดข้อผิดพลาดในการยืนยัน", 'error');
            console.error(err);
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Paper elevation={3} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
            <Box sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold">ยืนยันการคืนกุญแจ</Typography>
                <Typography variant="body2" color="text.secondary">
                    รายการทั้งหมดที่ผู้ใช้ได้กรอกข้อมูลคืนรถแล้ว และกำลังรอการยืนยัน
                </Typography>
            </Box>
            <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid 
                    rows={pendingTrips}
                    columns={columns}
                    getRowId={(row) => row.id}
                    pageSizeOptions={[10, 25]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                />
            </Box>
            
            <KeyReturnDialog
                open={keyReturnDialogOpen}
                onClose={() => setKeyReturnDialogOpen(false)}
                onConfirm={handleConfirmEdits}
                trip={processingTrip}
            />

            <ConfirmationDialog
                open={confirmFinalDialogOpen}
                onClose={() => setConfirmFinalDialogOpen(false)}
                onConfirm={handleFinalConfirm}
                title="ยืนยันการจบการเดินทาง (ครั้งสุดท้าย)"
                message="คุณแน่ใจหรือไม่? การกระทำนี้จะทำให้ Trip เสร็จสมบูรณ์และรถกลับสู่สถานะ 'ว่าง'"
            />
        </Paper>
    );
};

export default KeyReturnPage;