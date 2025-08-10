import React, { useState, useRef } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Grid, TextField, Divider } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import dayjs from 'dayjs';
import useSnackbar from '@/hooks/useSnackbar';
import otService from '@/api/otService';
import useAuth from '@/hooks/useAuth';
import ReactDOMServer from 'react-dom/server';
import PrintableOTSummary from '@/components/specific/ot/PrintableOTSummary'; 


const calculateOvernightHours = (startTimeStr, endTimeStr) => {
    const startTime = dayjs(startTimeStr, 'HH:mm:ss');
    const endTime = dayjs(endTimeStr, 'HH:mm:ss');
    if (startTime.isValid() && endTime.isValid()) {
        let difference = endTime.diff(startTime, 'minute');
        if (difference < 0) {
            difference += 24 * 60; 
        }
        return difference / 60;
    }
    return 0;
};


const OTSummaryPage = () => {
    const { user } = useAuth();
    const [startDate, setStartDate] = useState(dayjs().startOf('month'));
    const [endDate, setEndDate] = useState(dayjs().endOf('month'));
    const [otMultiplier, setOtMultiplier] = useState('1.5');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showSnackbar } = useSnackbar();
    
    const componentToPrintRef = useRef();

    const handlePrint = () => {
        if (!reportData) return;

        const printWindow = window.open('', '_blank');
        const printContent = ReactDOMServer.renderToStaticMarkup(
            <PrintableOTSummary 
                ref={componentToPrintRef}
                reportData={reportData}
                startDate={startDate}
                endDate={endDate}
                otMultiplier={otMultiplier}
            />
        );
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>รายงานสรุปการทำงานล่วงเวลา</title>
                    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap" rel="stylesheet">
                </head>
                <body>
                    ${printContent}
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

    const handleGenerateReport = async () => {
        setLoading(true);
        setReportData(null);
        try {
            const response = await otService.getOtSummary(
                startDate.format('YYYY-MM-DD'),
                endDate.format('YYYY-MM-DD')
            );
            const sortedData = response.data.sort((a, b) => {
                const dateA = dayjs(a.otDates[0]?.workDate);
                const dateB = dayjs(b.otDates[0]?.workDate);
                return dateA.diff(dateB);
            });
            setReportData(sortedData);
        } catch (error) {
            console.error(error);
            showSnackbar('ไม่สามารถสร้างรายงานได้', 'error');
        } finally {
            setLoading(false);
        }
    };
    
    const generateTaskSummary = (req) => {
        if (req.reason || req.project) return req.reason || req.project;
        if (!req.tasks || req.tasks.length === 0) return '-';
        const firstTask = req.tasks[0];
        const subject = firstTask.customRepairItem || firstTask.equipmentName || 'งาน';
        let summary = subject;
        if (req.tasks.length > 1) summary += ` (และอีก ${req.tasks.length - 1} รายการ)`;
        return summary;
    };

    const calculateTotals = (data) => {
        const totals = {};
        if (!data) return totals;
        data.forEach(req => {
            const allWorkers = [req.requester, ...req.coworkers];
            const hoursPerDay = calculateOvernightHours(req.startTime, req.endTime);
            const totalHoursForRequest = hoursPerDay * req.otDates.length;

            allWorkers.forEach(worker => {
                const workerName = `${worker.firstName} ${worker.lastName}`;
                if (!totals[workerName]) {
                    totals[workerName] = 0;
                }
                totals[workerName] += totalHoursForRequest;
            });
        });
        return totals;
    };
    
    const totals = calculateTotals(reportData);

    return (
        <Paper elevation={3} sx={{ p: 3, borderRadius: '16px' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>สรุปโอที</Typography>
            
            <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Grid item><DatePicker label="วันเริ่มต้น" value={startDate} onChange={setStartDate} /></Grid>
                    <Grid item><DatePicker label="วันสิ้นสุด" value={endDate} onChange={setEndDate} /></Grid>
                </LocalizationProvider>
                <Grid item><TextField label="OT คูณ" value={otMultiplier} onChange={(e) => setOtMultiplier(e.target.value)} sx={{ width: 100 }} /></Grid>
                <Grid item><Button variant="contained" startIcon={<SearchIcon />} onClick={handleGenerateReport} disabled={loading}>สร้างรายงาน</Button></Grid>
                <Grid item><Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} disabled={!reportData}>พิมพ์</Button></Grid>
            </Grid>

            {loading && <CircularProgress />}

            {reportData && (
                <Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6">รายงาน OT ประจำวันที่ {startDate.format('DD/MM/YY')} - {endDate.format('DD/MM/YY')}</Typography>
                    
                    <Box component="div" sx={{ mt: 2, maxHeight: '400px', overflowY: 'auto' }}>
                        {reportData.map((req) => (
                            <Box key={req.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                                <Typography variant="subtitle1" fontWeight="bold">ชื่องาน: {req.reason || req.project || generateTaskSummary(req)}</Typography>
                                {req.otDates.map(d => (
                                    <Typography key={d.id} variant="body2" color="text.secondary">
                                        วันที่: {dayjs(d.workDate).format('DD/MM/YYYY')} | เวลา: {dayjs(req.startTime, "HH:mm:ss").format("HH:mm")} - {dayjs(req.endTime, "HH:mm:ss").format("HH:mm")} ({calculateOvernightHours(req.startTime, req.endTime).toFixed(2)} ชม.)
                                    </Typography>
                                ))}
                                <Typography variant="body2">ผู้ปฏิบัติงาน: {[req.requester, ...req.coworkers].map(w => `${w.firstName} ${w.lastName}`).join(', ')}</Typography>
                                <Typography variant="body2">ผู้อนุมัติ: {req.manager.firstName} {req.manager.lastName}</Typography>
                            </Box>
                        ))}
                    </Box>

                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6">สรุปชั่วโมงรายบุคคล</Typography>
                    <ul>
                        {Object.entries(totals).map(([name, hours]) => (
                            <li key={name}><Typography>{name}: {hours.toFixed(2)} ชั่วโมง</Typography></li>
                        ))}
                    </ul>
                </Box>
            )}
        </Paper>
    );
};

export default OTSummaryPage;