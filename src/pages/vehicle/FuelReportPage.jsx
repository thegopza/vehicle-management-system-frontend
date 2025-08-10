import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box, Typography, Paper, Button, CircularProgress, Grid, Divider, Autocomplete, TextField
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DataGrid } from '@mui/x-data-grid';
import PrintIcon from '@mui/icons-material/Print';
import AssessmentIcon from '@mui/icons-material/Assessment';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import useSnackbar from '../../hooks/useSnackbar.js';
import fuelService from '../../api/fuelService.js';
import vehicleService from '../../api/vehicleService.js';

dayjs.locale('th');

const FuelReportPage = () => {
    const [startDate, setStartDate] = useState(dayjs().startOf('month'));
    const [endDate, setEndDate] = useState(dayjs().endOf('month'));
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showSnackbar } = useSnackbar();
    const printRef = useRef();

    const fetchVehicles = useCallback(async () => {
        try {
            const response = await vehicleService.getVehiclesForDropdown();
            setVehicles([{ id: null, licensePlate: 'รถทุกคัน' }, ...response.data]);
        } catch (error) {
            showSnackbar('ไม่สามารถดึงข้อมูลรถยนต์ได้', 'error');
            console.error(error);
        }
    }, [showSnackbar]);

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    const handleGenerateReport = async () => {
        if (!startDate || !endDate || endDate.isBefore(startDate)) {
            showSnackbar('กรุณาเลือกช่วงวันที่ให้ถูกต้อง', 'warning');
            return;
        }
        setLoading(true);
        setReportData(null);
        try {
            const response = await fuelService.getFuelReport(
                startDate.format('YYYY-MM-DD'),
                endDate.format('YYYY-MM-DD'),
                selectedVehicle?.id
            );
            setReportData(response.data);
        } catch (error) {
            showSnackbar('เกิดข้อผิดพลาดในการสร้างรายงาน', 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const content = printRef.current.innerHTML;
        printWindow.document.write(`
            <html>
                <head>
                    <title>รายงานสรุปบิลน้ำมัน</title>
                    <style>
                        body { font-family: 'Sarabun', sans-serif; margin: 20px; }
                        .print-header { text-align: center; margin-bottom: 20px; }
                        .print-header h1 { margin: 0; }
                        .print-header p { margin: 5px 0; }
                        table { width: 100%; border-collapse: collapse; font-size: 12px; }
                        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .summary-section { margin-top: 20px; text-align: right; font-weight: bold; }
                        @media print { .no-print { display: none; } }
                    </style>
                     <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
                </head>
                <body>${content}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
    };

    const columns = [
        { field: 'recordedBy', headerName: 'ผู้เติม', width: 200, valueGetter: (value, row) => `${row.recordedByFirstName} ${row.recordedByLastName}` },
        { field: 'licensePlate', headerName: 'ทะเบียนรถ', width: 150 },
        { field: 'recordTimestamp', headerName: 'วัน-เวลาที่เติม', width: 180, valueGetter: (value) => dayjs(value).format('D MMM YYYY HH:mm') },
        { field: 'mileageAtRefuel', headerName: 'เลขไมล์', width: 120, type: 'number', renderCell: (params) => params.value?.toLocaleString() },
        { field: 'amountPaid', headerName: 'จำนวนเงิน (บาท)', flex: 1, type: 'number', align: 'right', headerAlign: 'right', renderCell: (params) => params.value?.toLocaleString('th-TH', { minimumFractionDigits: 2 }) },
    ];

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>รายงานสรุปบิลน้ำมัน</Typography>
            
            <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: '16px' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={2}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
                            <DatePicker label="วันที่เริ่มต้น" value={startDate} onChange={setStartDate} sx={{ width: '100%' }} />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
                            <DatePicker label="วันที่สิ้นสุด" value={endDate} onChange={setEndDate} sx={{ width: '100%' }} />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Autocomplete
                            options={vehicles}
                            getOptionLabel={(option) => option.licensePlate}
                            value={selectedVehicle}
                            onChange={(event, newValue) => setSelectedVehicle(newValue)}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderInput={(params) => <TextField {...params} label="เลือกทะเบียนรถ" />}
                            sx={{ width: 150, maxWidth: '100%' }} // << เพิ่มตรงนี้ ปรับความกว้าง
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained" fullWidth onClick={handleGenerateReport} disabled={loading} startIcon={<AssessmentIcon/>}>
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'สร้างรายงาน'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {reportData && (
                <Paper elevation={3} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
                     <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5" fontWeight="bold">ผลการค้นหา</Typography>
                        <Button onClick={handlePrint} variant="outlined" startIcon={<PrintIcon />}>พิมพ์</Button>
                    </Box>
                    <Box sx={{ height: 500, width: '100%' }}>
                        <DataGrid rows={reportData.records} columns={columns} getRowId={(row) => row.id} />
                    </Box>
                    <Box sx={{ p: 3, backgroundColor: 'grey.100', textAlign: 'right' }}>
                        <Typography variant="h6">จำนวนครั้งที่เติมทั้งหมด: <strong>{reportData.totalCount.toLocaleString()}</strong> ครั้ง</Typography>
                        <Typography variant="h5" fontWeight="bold">ยอดเงินรวมทั้งหมด: <strong style={{color: '#d32f2f'}}>{reportData.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong> บาท</Typography>
                    </Box>
                </Paper>
            )}

            {/* Hidden div for printing */}
            <div style={{ display: 'none' }}>
                <div ref={printRef}>
                    <div className="print-header">
                        <h1>รายงานสรุปบิลน้ำมัน</h1>
                        <p>ช่วงวันที่: {dayjs(startDate).format('D MMMM YYYY')} ถึง {dayjs(endDate).format('D MMMM YYYY')}</p>
                        <p>รถยนต์: {selectedVehicle?.licensePlate || 'ทุกคัน'}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>ผู้เติม</th>
                                <th>ทะเบียนรถ</th>
                                <th>วัน-เวลาที่เติม</th>
                                <th>เลขไมล์</th>
                                <th>จำนวนเงิน (บาท)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData?.records.map(row => (
                                <tr key={row.id}>
                                    <td>{`${row.recordedByFirstName} ${row.recordedByLastName}`}</td>
                                    <td>{row.licensePlate}</td>
                                    <td>{dayjs(row.recordTimestamp).format('D MMM YY HH:mm')}</td>
                                    <td>{row.mileageAtRefuel?.toLocaleString()}</td>
                                    <td style={{textAlign: 'right'}}>{row.amountPaid?.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="summary-section">
                        <p>จำนวนครั้งที่เติมทั้งหมด: {reportData?.totalCount.toLocaleString()} ครั้ง</p>
                        <p>ยอดเงินรวมทั้งหมด: {reportData?.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</p>
                    </div>
                </div>
            </div>
        </Box>
    );
};

export default FuelReportPage;
