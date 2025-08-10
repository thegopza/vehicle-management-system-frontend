import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Paper, Button, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import tripService from '../../api/tripService.js';
import fuelService from '../../api/fuelService.js';
import dayjs from 'dayjs';
import EndTripDialog from '../../components/specific/EndTripDialog.jsx';
import RecordFuelDialog from '../../components/specific/RecordFuelDialog.jsx';
import EditIcon from '@mui/icons-material/Edit';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import useSnackbar from '../../hooks/useSnackbar.js';

const EndTripListPage = () => {
    const [pendingTrips, setPendingTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showSnackbar } = useSnackbar();
    const [endTripDialogOpen, setEndTripDialogOpen] = useState(false);
    const [endingTrip, setEndingTrip] = useState(null);
    const [recordFuelDialogOpen, setRecordFuelDialogOpen] = useState(false);
    const [recordingTrip, setRecordingTrip] = useState(null);

    const columns = [
        { field: 'id', headerName: 'Trip ID', width: 80 },
        { 
            field: 'vehicleName', 
            headerName: 'รถยนต์', 
            width: 180, 
            valueGetter: (value, row) => `${row.vehicle?.name} (${row.vehicle?.licensePlate})` 
        },
        { 
            field: 'userName', 
            headerName: 'ผู้เบิก', 
            width: 180, 
            valueGetter: (value, row) => `${row.user?.firstName} ${row.user?.lastName}` 
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
            valueGetter: (value, row) => (row.endMileage != null && row.startMileage != null) ? row.endMileage - row.startMileage : null,
            renderCell: (params) => params.value != null ? params.value.toLocaleString() : '-'
        },
        { 
            field: 'status', 
            headerName: 'สถานะ', 
            width: 180 
        },
        {
            field: 'actions',
            headerName: 'จัดการ',
            sortable: false,
            flex: 1,
            minWidth: 250,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const isPending = params.row.status === 'PENDING_KEY_RETURN';
                const isInProgress = params.row.status === 'IN_PROGRESS';
                
                // --- ส่วนที่แก้ไข ---
                // เงื่อนไข: แสดงปุ่มเติมน้ำมันถ้าสถานะเป็น IN_PROGRESS หรือ PENDING_KEY_RETURN
                const canRecordFuel = isInProgress || isPending;

                return (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {canRecordFuel && (
                            <Tooltip title="บันทึกการเติมน้ำมัน">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    onClick={() => handleRecordFuelClick(params.row)}
                                    sx={{ minWidth: '40px', px: 1 }}
                                >
                                    <LocalGasStationIcon />
                                </Button>
                            </Tooltip>
                        )}
                        <Button
                            variant="contained"
                            color={isPending ? "secondary" : "warning"}
                            size="small"
                            startIcon={isPending ? <EditIcon /> : null}
                            onClick={() => handleEndTripClick(params.row)}
                        >
                            {isPending ? "แก้ไข" : "คืนรถ"}
                        </Button>
                    </Box>
                );
                // -------------------
            },
        },
    ];

    const fetchPendingProcessTrips = useCallback(async () => {
        try {
            setLoading(true);
            const response = await tripService.getPendingProcessTrips();
            setPendingTrips(response.data);
        } catch (err) {
            showSnackbar("ไม่สามารถดึงข้อมูลการเดินทางได้", 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [showSnackbar]);

    useEffect(() => {
        fetchPendingProcessTrips();
    }, [fetchPendingProcessTrips]);

    const handleEndTripClick = (trip) => {
        setEndingTrip(trip);
        setEndTripDialogOpen(true);
    };

    const handleConfirmEndTrip = async (endTripData, files) => {
        try {
            if (!endingTrip) return;
            await tripService.endTrip(endingTrip.id, endTripData, files);
            setEndTripDialogOpen(false);
            fetchPendingProcessTrips(); 
            showSnackbar('ส่งข้อมูลคืนรถสำเร็จ', 'success');
        } catch (err) {
            showSnackbar("เกิดข้อผิดพลาดในการคืนรถ", 'error');
            console.error(err);
        }
    };

    const handleRecordFuelClick = (trip) => {
        setRecordingTrip(trip);
        setRecordFuelDialogOpen(true);
    };

    const handleConfirmRecordFuel = async (fuelData, file) => {
        try {
            if (!recordingTrip) return;
            await fuelService.recordFuel(recordingTrip.id, fuelData, file);
            showSnackbar('บันทึกการเติมน้ำมันสำเร็จ', 'success');
            setRecordFuelDialogOpen(false);
        } catch (err) {
            showSnackbar("เกิดข้อผิดพลาดในการบันทึก", 'error');
            console.error(err);
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Paper elevation={3} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
            <Box sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold">รายการคืนรถ</Typography>
                <Typography variant="body2" color="text.secondary">แสดงรายการที่กำลังใช้งานและรายการที่รอคืนกุญแจ</Typography>
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
            <EndTripDialog
                open={endTripDialogOpen}
                onClose={() => setEndTripDialogOpen(false)}
                onConfirm={handleConfirmEndTrip}
                trip={endingTrip}
            />
            <RecordFuelDialog
                open={recordFuelDialogOpen}
                onClose={() => setRecordFuelDialogOpen(false)}
                onConfirm={handleConfirmRecordFuel}
                trip={recordingTrip}
            />
        </Paper>
    );
};

export default EndTripListPage;