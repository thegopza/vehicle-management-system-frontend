import React, { useState, useEffect, useCallback } from 'react'; // <-- ลบ useRef
import { Box, Typography, CircularProgress, Paper, Button, IconButton, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PrintIcon from '@mui/icons-material/Print';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EditIcon from '@mui/icons-material/Edit';
import tripService from '../../api/tripService.js';
import dayjs from 'dayjs';
import useSnackbar from '../../hooks/useSnackbar.js';
// import PrintableHistoryReport from '../../components/specific/PrintableHistoryReport.jsx'; // <-- ลบออก
import EditHistoryDialog from '../../components/specific/EditHistoryDialog.jsx';
import samLogo from '../../assets/logo.png';

const AllTripsHistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showSnackbar } = useSnackbar();
    // const componentRef = useRef(null); // <-- ลบออก

    const [editingTrip, setEditingTrip] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    // --- ส่วนที่แก้ไข: นำ Logic การพิมพ์แบบ "New Window" กลับมาใช้ ---
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        
        const tableRows = history.map(trip => `
            <tr>
                <td>${trip.id}</td>
                <td>${trip.vehicle?.name || ''} (${trip.vehicle?.licensePlate || ''})</td>
                <td>${trip.user?.firstName || ''} ${trip.user?.lastName || ''}</td>
                <td>${trip.returnedBy ? `${trip.returnedBy.firstName} ${trip.returnedBy.lastName}` : '-'}</td>
                <td>${dayjs(trip.startTime).format('DD/MM/YY HH:mm')}</td>
                <td>${trip.endTime ? dayjs(trip.endTime).format('DD/MM/YY HH:mm') : '-'}</td>
                <td class="num-cell">${(trip.endMileage && trip.startMileage) ? (trip.endMileage - trip.startMileage).toLocaleString() : '-'}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Trip History Report</title>
                    <style>
                        body { font-family: sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                        th { background-color: #f2f2f2; }
                        .header { display: flex; align-items: center; margin-bottom: 20px; }
                        .header img { height: 60px; margin-right: 20px; }
                        .header-text h1 { margin: 0; font-size: 24px; }
                        .header-text p { margin: 0; color: #555; }
                        .num-cell { text-align: right; }
                        @media print {
                            body { margin: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <img src="${samLogo}" alt="Logo" />
                        <div class="header-text">
                            <h1>รายงานประวัติการเดินทางทั้งหมด</h1>
                            <p>สร้างเมื่อ: ${dayjs().format('DD/MM/YYYY HH:mm')}</p>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Trip ID</th>
                                <th>รถยนต์</th>
                                <th>ผู้เบิก</th>
                                <th>ผู้คืน</th>
                                <th>เวลาเริ่ม</th>
                                <th>เวลาคืน</th>
                                <th class="num-cell">ระยะทาง (กม.)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };
    // ----------------------------------------------------------------

    const columns = [
        { field: 'id', headerName: 'Trip ID', width: 80 },
        {
            field: 'accidentReport',
            headerName: 'อุบัติเหตุ',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            sortable: false,
            renderCell: (params) => {
                return params.value ? <WarningAmberIcon color="error" /> : null;
            }
        },
        { field: 'vehicleName', headerName: 'รถยนต์', width: 180, valueGetter: (value, row) => `${row.vehicle?.name} (${row.vehicle?.licensePlate})` },
        { field: 'userName', headerName: 'ผู้เบิก', width: 180, valueGetter: (value, row) => `${row.user?.firstName} ${row.user?.lastName}` },
        { field: 'returnedBy', headerName: 'ผู้คืน', width: 180, valueGetter: (value, row) => row.returnedBy ? `${row.returnedBy.firstName} ${row.returnedBy.lastName}` : '-' },
        { field: 'startTime', headerName: 'เวลาเริ่ม', width: 160, valueGetter: (value, row) => dayjs(row.startTime).format('DD/MM/YYYY HH:mm') },
        { field: 'endTime', headerName: 'เวลาคืน', width: 160, valueGetter: (value, row) => row.endTime ? dayjs(row.endTime).format('DD/MM/YYYY HH:mm') : '-' },
        { field: 'distanceUsed', headerName: 'ระยะทาง (กม.)', width: 130, type: 'number', valueGetter: (value, row) => (row.endMileage && row.startMileage) ? row.endMileage - row.startMileage : null, renderCell: (params) => params.value != null ? params.value.toLocaleString() : '-' },
        { field: 'status', headerName: 'สถานะ', flex: 1, minWidth: 150 },
        {
            field: 'actions',
            headerName: 'จัดการ',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            sortable: false,
            renderCell: (params) => {
                if (params.row.latest) {
                    return (
                        <Tooltip title="แก้ไขข้อมูลล่าสุด">
                            <IconButton onClick={() => handleOpenEditDialog(params.row)}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    );
                }
                return null;
            }
        }
    ];

    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true);
            const response = await tripService.getAllTripHistory();
            setHistory(response.data);
        } catch (err) {
            showSnackbar("ไม่สามารถดึงข้อมูลประวัติได้", 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [showSnackbar]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleOpenEditDialog = (trip) => {
        setEditingTrip(trip);
        setEditDialogOpen(true);
    };

    const handleSaveEdit = async (data) => {
        try {
            await tripService.updateTripHistory(editingTrip.id, data);
            showSnackbar('อัปเดตข้อมูลสำเร็จ', 'success');
            setEditDialogOpen(false);
            fetchHistory();
        } catch (err) {
            showSnackbar(err.response?.data?.message || 'เกิดข้อผิดพลาด', 'error');
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <React.Fragment>
            <Paper elevation={3} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h5" fontWeight="bold">ประวัติการเดินทางทั้งหมด</Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<PrintIcon />}
                        onClick={handlePrint}
                        disabled={history.length === 0}
                    >
                        พิมพ์รายงาน
                    </Button>
                </Box>
                <Box sx={{ 
                    height: 650, 
                    width: '100%',
                    "& .MuiDataGrid-row.accident-row": {
                        backgroundColor: '#ffebee',
                        "&:hover": {
                            backgroundColor: '#ffcdd2 !important',
                        }
                    }
                }}>
                    <DataGrid 
                        rows={history}
                        columns={columns}
                        getRowId={(row) => row.id}
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                        getRowClassName={(params) => 
                            params.row.accidentReport ? 'accident-row' : ''
                        }
                    />
                </Box>
            </Paper>

            <EditHistoryDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                onSave={handleSaveEdit}
                trip={editingTrip}
            />

            {/* --- ส่วนที่แก้ไข: ลบ Component ที่ซ่อนอยู่ออกไป --- */}
        </React.Fragment>
    );
};

export default AllTripsHistoryPage;
