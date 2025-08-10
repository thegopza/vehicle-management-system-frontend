import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Paper, Divider, Button, Grid, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import tripService from '../../api/tripService.js';
import fuelService from '../../api/fuelService.js';
import dayjs from 'dayjs';
import EndTripDialog from '../../components/specific/EndTripDialog.jsx';
import RecordFuelDialog from '../../components/specific/RecordFuelDialog.jsx';
import useSnackbar from '../../hooks/useSnackbar.js';
import InfoIcon from '@mui/icons-material/Info';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import EditIcon from '@mui/icons-material/Edit';

const ActiveTripCard = ({ trip, onEndTrip, onRecordFuel }) => {
    const isPendingReturn = trip.status === 'PENDING_KEY_RETURN';
    const isInProgress = trip.status === 'IN_PROGRESS';

    return (
        <Paper 
            elevation={3} 
            sx={{ 
                p: { xs: 2, md: 3 }, 
                mb: 3,
                borderRadius: '16px', 
                background: isPendingReturn 
                    ? 'linear-gradient(120deg, #fff3e0 0%, #ffe0b2 100%)'
                    : 'linear-gradient(120deg, #e3f2fd 0%, #bbdefb 100%)',
                border: `1px solid ${isPendingReturn ? '#ffcc80' : '#90caf9'}`,
                flexShrink: 0
            }}
        >
            <Grid container alignItems="center" spacing={{ xs: 2, md: 3 }}>
                <Grid item xs={12} md>
                    <Stack spacing={1.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {isPendingReturn ? <HourglassTopIcon color="warning" /> : <InfoIcon color="primary" />}
                            <Typography variant="h6" fontWeight="bold">
                                {isPendingReturn ? 'การเดินทางที่รอคืนกุญแจ' : 'การเดินทางปัจจุบัน'}
                            </Typography>
                        </Box>
                        <Divider />
                        <Typography variant="body1"><b>รถยนต์:</b> {trip.vehicle.name} ({trip.vehicle.licensePlate})</Typography>
                        <Typography variant="body1"><b>จุดหมาย:</b> {trip.destination}</Typography>
                        <Typography variant="body2" color="text.secondary"><b>เวลาเริ่ม:</b> {dayjs(trip.startTime).format('DD/MM/YYYY HH:mm')}</Typography>
                        {isPendingReturn && (
                            <Typography variant="body2" color="warning.dark" sx={{ mt: 1, fontWeight: 'bold' }}>
                                สถานะ: โปรดนำรถและกุญแจไปคืนที่จุดบริการ
                            </Typography>
                        )}
                    </Stack>
                </Grid>
                <Grid item xs={12} md="auto">
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end" alignItems="center" height="100%">
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={() => onRecordFuel(trip)}
                            startIcon={<LocalGasStationIcon />}
                            sx={{ height: 'fit-content', py: 1.5, px: 3, borderRadius: '12px', fontWeight: 'bold' }}
                        >
                            บันทึกเติมน้ำมัน
                        </Button>
                        
                        {isInProgress && (
                            <Button 
                                variant="contained" 
                                color="warning" 
                                onClick={() => onEndTrip(trip)}
                                sx={{ height: 'fit-content', py: 1.5, px: 4, borderRadius: '12px', fontWeight: 'bold' }}
                            >
                                คืนรถ
                            </Button>
                        )}
                        {isPendingReturn && (
                             <Button 
                                variant="contained" 
                                color="secondary" 
                                onClick={() => onEndTrip(trip)}
                                startIcon={<EditIcon />}
                                sx={{ height: 'fit-content', py: 1.5, px: 4, borderRadius: '12px', fontWeight: 'bold' }}
                            >
                                แก้ไข
                            </Button>
                        )}
                    </Stack>
                </Grid>
            </Grid>
        </Paper>
    );
};

const MyTripsPage = () => {
    // --- ส่วนที่แก้ไข ---
    const [activeTrips, setActiveTrips] = useState([]); // เปลี่ยนเป็น Array
    // -------------------
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showSnackbar } = useSnackbar();
    const [endTripDialogOpen, setEndTripDialogOpen] = useState(false);
    const [endingTrip, setEndingTrip] = useState(null);
    const [recordFuelDialogOpen, setRecordFuelDialogOpen] = useState(false);
    const [recordingTrip, setRecordingTrip] = useState(null);

    const columns = [
        { field: 'id', headerName: 'Trip ID', width: 90 },
        { 
            field: 'vehicleName', 
            headerName: 'รถยนต์', 
            width: 200, 
            valueGetter: (value, row) => `${row.vehicle?.name || ''} (${row.vehicle?.licensePlate || ''})` 
        },
        { field: 'destination', headerName: 'จุดหมาย', flex: 1, minWidth: 200 },
        { 
            field: 'startTime', 
            headerName: 'เวลาเริ่ม', 
            width: 180, 
            valueGetter: (value, row) => dayjs(row.startTime).format('DD/MM/YYYY HH:mm') 
        },
        { 
            field: 'endTime', 
            headerName: 'เวลาสิ้นสุด', 
            width: 180, 
            valueGetter: (value, row) => row.endTime ? dayjs(row.endTime).format('DD/MM/YYYY HH:mm') : '-' 
        },
        { field: 'status', headerName: 'สถานะ', width: 150 },
    ];

    // --- ส่วนที่แก้ไข ---
    const fetchTrips = useCallback(async () => {
        try {
            setLoading(true);
            const activeTripsRes = await tripService.getMyActiveTrips(); // เรียกใช้ฟังก์ชันใหม่
            setActiveTrips(activeTripsRes.data || []); // เก็บข้อมูลเป็น Array
            
            const historyRes = await tripService.getMyTripHistory();
            setHistory(historyRes.data);
        } catch (err) {
            showSnackbar("ไม่สามารถดึงข้อมูลการเดินทางได้", 'error');
            console.error(err)
        } finally {
            setLoading(false);
        }
    }, [showSnackbar]);
    // -------------------

    useEffect(() => {
        fetchTrips();
    }, [fetchTrips]);

    const handleEndTripClick = (trip) => {
        setEndingTrip(trip);
        setEndTripDialogOpen(true);
    };

    const handleConfirmEndTrip = async (endTripData, files) => {
        try {
            if (!endingTrip) return;
            await tripService.endTrip(endingTrip.id, endTripData, files);
            showSnackbar('ส่งข้อมูลคืนรถสำเร็จ', 'success');
            setEndTripDialogOpen(false);
            fetchTrips();
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
            // ไม่ต้อง fetchTrips ใหม่ เพราะข้อมูลบิลน้ำมันไม่แสดงในหน้านี้โดยตรง
        } catch (err) {
            showSnackbar("เกิดข้อผิดพลาดในการบันทึก", 'error');
            console.error(err);
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px - (24px * 2))' }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, flexShrink: 0 }}>
                การเดินทางของฉัน
            </Typography>
            
            {/* --- ส่วนที่แก้ไข: วนลูปแสดงผลทุกการเดินทาง --- */}
            {activeTrips.length > 0 ? (
                activeTrips.map(trip => (
                    <ActiveTripCard 
                        key={trip.id} 
                        trip={trip} 
                        onEndTrip={handleEndTripClick} 
                        onRecordFuel={handleRecordFuelClick} 
                    />
                ))
            ) : (
                <Typography sx={{ mb: 3, color: 'text.secondary', textAlign: 'center' }}>
                    ไม่มีการเดินทางปัจจุบัน
                </Typography>
            )}
            {/* ------------------------------------------- */}

            <Paper 
                elevation={3} 
                sx={{ 
                    borderRadius: '16px', 
                    overflow: 'hidden', 
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <Box sx={{ p: 3, pb: 2, flexShrink: 0 }}>
                    <Typography variant="h5" fontWeight="bold">ประวัติการเดินทาง</Typography>
                </Box>
                <Box sx={{ flexGrow: 1, width: '100%' }}>
                    <DataGrid 
                        rows={history}
                        columns={columns}
                        getRowId={(row) => row.id}
                        pageSizeOptions={[5, 10, 20]}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 10 }
                            }
                        }}
                        sx={{ border: 0 }}
                    />
                </Box>
            </Paper>

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
        </Box>
    );
};

export default MyTripsPage;