import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Paper, Button, Accordion, AccordionSummary, AccordionDetails, List, ListItemButton, ListItemText, Divider, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import dayjs from 'dayjs';
import useSnackbar from '../../hooks/useSnackbar.js';
import accidentService from '../../api/accidentService.js';
import ConfirmationDialog from '../../components/common/ConfirmationDialog.jsx';
import AccidentDetailDialog from '../../components/specific/AccidentDetailDialog.jsx';

const AccidentListPage = () => {
    const [accidentsByVehicle, setAccidentsByVehicle] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showSnackbar } = useSnackbar();

    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [clearingVehicle, setClearingVehicle] = useState(null);
    
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    const fetchAccidents = useCallback(async () => {
        try {
            setLoading(true);
            const response = await accidentService.getAccidents();
            setAccidentsByVehicle(response.data);
        } catch (err) {
            showSnackbar("ไม่สามารถดึงข้อมูลอุบัติเหตุได้", "error");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [showSnackbar]);

    useEffect(() => {
        fetchAccidents();
    }, [fetchAccidents]);

    const handleOpenClearDialog = (vehicle) => {
        setClearingVehicle(vehicle);
        setConfirmDialogOpen(true);
    };

    const handleConfirmClear = async () => {
        if (!clearingVehicle) return;
        try {
            await accidentService.clearAccidentsForVehicle(clearingVehicle.vehicleId);
            showSnackbar(`ล้างประวัติอุบัติเหตุของรถ ${clearingVehicle.licensePlate} สำเร็จ`, 'success');
            setConfirmDialogOpen(false);
            fetchAccidents();
        } catch (err) {
            showSnackbar("เกิดข้อผิดพลาดในการล้างข้อมูล", "error");
            console.error(err);
        }
    };
    
    const handleViewDetail = (report) => {
        setSelectedReport(report);
        setDetailDialogOpen(true);
    };

    if (loading) return <CircularProgress />;

    return (
        <Paper elevation={3} sx={{ borderRadius: '16px' }}>
            <Box sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold">รายการอุบัติเหตุ</Typography>
                <Typography variant="body2" color="text.secondary">
                    แสดงรายการรถยนต์ทั้งหมดที่เคยมีบันทึกอุบัติเหตุ
                </Typography>
            </Box>
            <Divider />
            <Box sx={{ p: 2 }}>
                {accidentsByVehicle.length === 0 && !loading ? (
                    <Typography sx={{ textAlign: 'center', p: 3 }}>ไม่มีรายงานอุบัติเหตุในระบบ</Typography>
                ) : (
                    accidentsByVehicle.map((vehicle) => (
                        <Accordion key={vehicle.vehicleId} sx={{ mb: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography fontWeight="bold">{vehicle.licensePlate} ({vehicle.vehicleName})</Typography>
                                <Chip label={`${vehicle.accidentReports.length} รายการ`} size="small" sx={{ ml: 2 }} />
                            </AccordionSummary>
                            <AccordionDetails>
                                <List>
                                    {vehicle.accidentReports.map(report => (
                                        <ListItemButton key={report.id} onClick={() => handleViewDetail(report)}>
                                            <ListItemText 
                                                primary={`รายงานโดย: ${report.reporterFirstName} ${report.reporterLastName}`}
                                                secondary={`วันที่: ${dayjs(report.accidentTime).format('DD/MM/YYYY HH:mm')}`}
                                            />
                                        </ListItemButton>
                                    ))}
                                </List>
                                <Box sx={{ mt: 2, textAlign: 'right' }}>
                                    <Button 
                                        variant="outlined" 
                                        color="error"
                                        startIcon={<DeleteForeverIcon />}
                                        onClick={() => handleOpenClearDialog(vehicle)}
                                    >
                                        Clear ประวัติทั้งหมดของรถคันนี้
                                    </Button>
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    ))
                )}
            </Box>
            <ConfirmationDialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                onConfirm={handleConfirmClear}
                title="ยืนยันการล้างประวัติ"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบประวัติอุบัติเหตุทั้งหมดของรถทะเบียน ${clearingVehicle?.licensePlate}? การกระทำนี้ไม่สามารถย้อนกลับได้`}
            />
            <AccidentDetailDialog 
                open={detailDialogOpen}
                onClose={() => setDetailDialogOpen(false)}
                report={selectedReport}
            />
        </Paper>
    );
};

export default AccidentListPage;
