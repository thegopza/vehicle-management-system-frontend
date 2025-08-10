import React, { useState, useRef } from 'react';
import {
    Box, Typography, Paper, Button, CircularProgress, Grid, Divider, Accordion, AccordionSummary, AccordionDetails, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PrintIcon from '@mui/icons-material/Print';
import AssessmentIcon from '@mui/icons-material/Assessment';
import dayjs from 'dayjs';
import 'dayjs/locale/th'; // for thai locale
import useSnackbar from '../../hooks/useSnackbar.js';
import reportService from '../../api/reportService.js'; // สร้างไฟล์นี้ในขั้นตอนถัดไป

dayjs.locale('th');

// Component สำหรับแสดงผลสรุปภาพรวม
const OverallSummary = ({ summary }) => (
    <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: '16px' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>สรุปภาพรวม</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <Typography variant="h6" color="text.secondary">ยอดรวมค่าน้ำมันทั้งหมด</Typography>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {summary?.totalFuelCost?.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'} บาท
                </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
                <Typography variant="h6" color="text.secondary" gutterBottom>ค่าใช้จ่ายน้ำมัน (แยกตามคัน)</Typography>
                <TableContainer component={Paper} elevation={0} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>ทะเบียนรถ</TableCell>
                                <TableCell align="right">ยอดรวม (บาท)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {summary?.fuelCostByVehicle && Object.entries(summary.fuelCostByVehicle).map(([plate, cost]) => (
                                <TableRow key={plate}>
                                    <TableCell>{plate}</TableCell>
                                    <TableCell align="right">{cost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    </Paper>
);

// Component สำหรับแสดงรายละเอียดของรถแต่ละคัน
const VehicleReportDetails = ({ report }) => (
    <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>สรุปการใช้งานตามบุคคล</Typography>
            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>ชื่อผู้ใช้งาน</TableCell>
                            <TableCell align="right">ระยะทางรวม (กม.)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {report.userUsage?.map(u => (
                            <TableRow key={u.userName}>
                                <TableCell>{u.userName}</TableCell>
                                <TableCell align="right">{u.totalDistance.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
        <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>สรุปอุบัติเหตุ</Typography>
            {report.accidentSummary?.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead><TableRow><TableCell>ผู้รายงาน</TableCell><TableCell align="right">จำนวน (ครั้ง)</TableCell></TableRow></TableHead>
                        <TableBody>
                            {report.accidentSummary.map(a => (
                                <TableRow key={a.reportedBy}><TableCell>{a.reportedBy}</TableCell><TableCell align="right">{a.count}</TableCell></TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : <Typography>ไม่มีข้อมูลอุบัติเหตุ</Typography>}
        </Grid>
        <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>ประวัติการเติมน้ำมัน</Typography>
             {report.fuelSummary?.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                    <Table>
                        <TableHead><TableRow><TableCell>ผู้เติม</TableCell><TableCell>วันที่</TableCell><TableCell align="right">จำนวนเงิน (บาท)</TableCell></TableRow></TableHead>
                        <TableBody>
                            {report.fuelSummary.map((f, i) => (
                                <TableRow key={i}><TableCell>{f.filledBy}</TableCell><TableCell>{dayjs(f.date).format('D MMM YYYY')}</TableCell><TableCell align="right">{f.amountPaid.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</TableCell></TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : <Typography>ไม่มีข้อมูลการเติมน้ำมัน</Typography>}
        </Grid>
    </Grid>
);

const MonthlyReportPage = () => {
    const [startDate, setStartDate] = useState(dayjs().startOf('month'));
    const [endDate, setEndDate] = useState(dayjs().endOf('month'));
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showSnackbar } = useSnackbar();
    const printRef = useRef();

    const handleGenerateReport = async () => {
        if (!startDate || !endDate || endDate.isBefore(startDate)) {
            showSnackbar('กรุณาเลือกช่วงวันที่ให้ถูกต้อง', 'warning');
            return;
        }
        setLoading(true);
        setReportData(null);
        try {
            const response = await reportService.getMonthlySummary(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
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
                    <title>รายงานสรุปข้อมูลรายเดือน</title>
                    <style>
                        body { font-family: 'Sarabun', sans-serif; margin: 20px; }
                        .print-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
                        .print-header img { height: 50px; }
                        .print-header h1 { margin: 0; font-size: 24px; }
                        .print-section { margin-top: 20px; page-break-inside: avoid; }
                        h2, h3 { color: #333; }
                        table { width: 100%; border-collapse: collapse; font-size: 12px; }
                        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .summary-card { border: 1px solid #ccc; padding: 15px; margin-bottom: 15px; }
                        .overall-summary { background-color: #e3f2fd; }
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
    
    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>สรุปข้อมูลรายเดือน</Typography>
            
            <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: '16px' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
                            <DatePicker label="วันที่เริ่มต้น" value={startDate} onChange={setStartDate} sx={{ width: '100%' }} />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={5}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
                            <DatePicker label="วันที่สิ้นสุด" value={endDate} onChange={setEndDate} sx={{ width: '100%' }} />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Button variant="contained" fullWidth onClick={handleGenerateReport} disabled={loading} startIcon={<AssessmentIcon/>}>
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'สร้างรายงาน'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {reportData && (
                <>
                    <Button onClick={handlePrint} variant="contained" color="secondary" startIcon={<PrintIcon />} sx={{ mb: 2 }}>
                        พิมพ์รายงาน
                    </Button>
                    <Box ref={printRef}>
                        {/* Layout สำหรับพิมพ์ */}
                        <div className="print-header">
                            <h1>รายงานสรุปการใช้รถ</h1>
                            <div>
                                <p style={{margin:0}}>ช่วงวันที่: {dayjs(startDate).format('D MMM YYYY')} - {dayjs(endDate).format('D MMM YYYY')}</p>
                                <p style={{margin:0}}>วันที่พิมพ์: {dayjs().format('D MMM YYYY')}</p>
                            </div>
                        </div>
                        <div className="print-section overall-summary">
                            <h2>สรุปภาพรวม</h2>
                            <p><strong>ยอดรวมค่าน้ำมันทั้งหมด:</strong> {reportData.overallFuelSummary?.totalFuelCost?.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</p>
                            <h3>ค่าใช้จ่ายน้ำมัน (แยกตามคัน)</h3>
                            <table>
                                <thead><tr><th>ทะเบียนรถ</th><th>ยอดรวม (บาท)</th></tr></thead>
                                <tbody>
                                {reportData.overallFuelSummary?.fuelCostByVehicle && Object.entries(reportData.overallFuelSummary.fuelCostByVehicle).map(([plate, cost]) => (
                                    <tr key={plate}><td>{plate}</td><td>{cost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td></tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <h2 className="print-section">รายละเอียดแยกตามคัน</h2>
                        {reportData.vehicleReports?.map(report => (
                            <div key={report.vehicleId} className="print-section summary-card">
                                <h3>ทะเบียน: {report.licensePlate} ({report.vehicleName})</h3>
                                <p><strong>จำนวนครั้งที่ใช้:</strong> {report.totalTrips} ครั้ง | <strong>ระยะทางรวม:</strong> {report.totalDistance.toLocaleString()} กม.</p>
                                <h4>สรุปการใช้งานตามบุคคล</h4>
                                <table>
                                    <thead><tr><th>ชื่อผู้ใช้งาน</th><th>ระยะทางรวม (กม.)</th></tr></thead>
                                    <tbody>{report.userUsage?.map(u => (<tr key={u.userName}><td>{u.userName}</td><td>{u.totalDistance.toLocaleString()}</td></tr>))}</tbody>
                                </table>
                                <h4>ประวัติการเติมน้ำมัน</h4>
                                <table>
                                    <thead><tr><th>ผู้เติม</th><th>วันที่</th><th>จำนวนเงิน (บาท)</th></tr></thead>
                                    <tbody>{report.fuelSummary?.map((f, i) => (<tr key={i}><td>{f.filledBy}</td><td>{dayjs(f.date).format('D MMM YY')}</td><td>{f.amountPaid.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td></tr>))}</tbody>
                                </table>
                                <h4>สรุปอุบัติเหตุ</h4>
                                {report.accidentSummary?.length > 0 ? (
                                    <table>
                                        <thead><tr><th>ผู้รายงาน</th><th>จำนวน (ครั้ง)</th></tr></thead>
                                        <tbody>{report.accidentSummary.map(a => (<tr key={a.reportedBy}><td>{a.reportedBy}</td><td>{a.count}</td></tr>))}</tbody>
                                    </table>
                                ) : <p>ไม่มีข้อมูลอุบัติเหตุ</p>}
                            </div>
                        ))}
                    </Box>

                    {/* Layout สำหรับแสดงบนหน้าจอ */}
                    <Box className="no-print">
                        <OverallSummary summary={reportData.overallFuelSummary} />
                        <Typography variant="h5" fontWeight="bold" gutterBottom>รายละเอียดแยกตามคัน</Typography>
                        {reportData.vehicleReports?.map(report => (
                            <Accordion key={report.vehicleId} sx={{ mb: 1 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Grid container alignItems="center" spacing={2}>
                                        <Grid item xs={12} sm={4}><Typography fontWeight="bold">{report.licensePlate} ({report.vehicleName})</Typography></Grid>
                                        <Grid item><Chip label={`ใช้งาน ${report.totalTrips} ครั้ง`} /></Grid>
                                        <Grid item><Chip label={`ระยะทาง ${report.totalDistance.toLocaleString()} กม.`} color="primary" /></Grid>
                                    </Grid>
                                </AccordionSummary>
                                <AccordionDetails sx={{ backgroundColor: 'grey.50' }}>
                                    <VehicleReportDetails report={report} />
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>
                </>
            )}
        </Box>
    );
};

export default MonthlyReportPage;
