import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, CircularProgress, Chip, Button, IconButton, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import AttachmentIcon from '@mui/icons-material/Attachment';
import useSnackbar from '../../hooks/useSnackbar';
import otService from '../../api/otService';
import dayjs from 'dayjs';
import EditOTRequestDialog from '../../components/specific/EditOTRequestDialog';
import AttachmentViewerDialog from '../../components/specific/AttachmentViewerDialog';

const generateTaskSummary = (row) => {
    if (row.reason || row.project) {
        return row.reason || row.project;
    }
    if (!row.tasks || row.tasks.length === 0) {
        return 'ไม่มีรายละเอียดงาน (ระบบทีม)';
    }
    const firstTask = row.tasks[0];
    const subject = firstTask.customRepairItem || firstTask.equipmentName || 'งาน';
    const description = firstTask.customFixDescription || 'N/A';
    let summary = `${subject}: ${description}`;
    if (row.tasks.length > 1) {
        summary += ` (และอีก ${row.tasks.length - 1} รายการ)`;
    }
    return summary;
};

const MyOTHistoryPage = () => {
    const [historyRows, setHistoryRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showSnackbar } = useSnackbar();

    const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
    const [selectedAttachments, setSelectedAttachments] = useState([]);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingRequestId, setEditingRequestId] = useState(null);

    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true);
            const response = await otService.getMyOtHistory();
            const processedRows = [];
            response.data.forEach(request => {
                if (request.otDates && request.otDates.length > 0) {
                    const sortedDates = [...request.otDates].sort((a, b) => dayjs(a.workDate).diff(dayjs(b.workDate)));
                    sortedDates.forEach((date, index) => {
                        processedRows.push({
                            ...request,
                            uniqueId: `${request.id}-${index}`,
                            workDate: date.workDate,
                            isFirstInGroup: index === 0,
                            isLastInGroup: index === sortedDates.length - 1,
                        });
                    });
                }
            });
            setHistoryRows(processedRows);
        } catch (error) {
            console.error(error);
            showSnackbar('ไม่สามารถโหลดประวัติได้', 'error');
        } finally {
            setLoading(false);
        }
    }, [showSnackbar]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);
    
    const handleViewAttachments = (attachments) => {
        setSelectedAttachments(attachments);
        setAttachmentDialogOpen(true);
    };

    const handleOpenEditDialog = (id) => {
        setEditingRequestId(id);
        setEditDialogOpen(true);
    };

    const handleCloseEditDialog = () => {
        setEditDialogOpen(false);
        setEditingRequestId(null);
    };

    const handleEditSuccess = () => {
        handleCloseEditDialog();
        fetchHistory(); // Refresh the grid data
    };

    const statusColors = {
        APPROVED: 'success',
        REJECTED: 'error',
        EDITED: 'info', // Use 'info' for the blue color
        PENDING_MANAGER_APPROVAL: 'warning',
        PENDING_ASSISTANT_REVIEW: 'secondary'
    };
    
    const columns = [
        { field: 'id', headerName: 'ID', width: 80, renderCell: (params) => (params.row.isFirstInGroup ? params.value : '') },
        { field: 'workDate', headerName: 'วันที่', width: 120, renderCell: (params) => dayjs(params.value).format('DD/MM/YY') },
        { field: 'startTime', headerName: 'เวลา', width: 130, renderCell: (params) => `${dayjs(params.value, 'HH:mm:ss').format('HH:mm')} - ${dayjs(params.row.endTime, 'HH:mm:ss').format('HH:mm')}` },
        { 
            field: 'calculatedHours', 
            headerName: 'ชม.', 
            width: 80, 
            type: 'number', 
            align: 'center', 
            headerAlign: 'center', 
            valueGetter: (value, row) => {
                const startTime = dayjs(row.startTime, 'HH:mm:ss');
                const endTime = dayjs(row.endTime, 'HH:mm:ss');
                if (startTime.isValid() && endTime.isValid()) {
                    let difference = endTime.diff(startTime, 'minute');
                    if (difference < 0) {
                        difference += 24 * 60;
                    }
                    return difference / 60;
                }
                return null;
            },
            valueFormatter: (value) => value != null ? Number(value).toFixed(2) : '-' 
        },
        { 
            field: 'reason', 
            headerName: 'เหตุผล/งาน', 
            flex: 1, 
            minWidth: 200, 
            renderCell: (params) => {
                const summary = generateTaskSummary(params.row);
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Tooltip title={summary}>
                            <Typography variant="body2" noWrap>{summary}</Typography>
                        </Tooltip>
                        {params.row.isFirstInGroup && params.row.attachments?.length > 0 && (
                            <Tooltip title="ดูไฟล์แนบ">
                                <IconButton size="small" sx={{ ml: 1 }} onClick={() => handleViewAttachments(params.row.attachments)}>
                                    <AttachmentIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                );
            }
        },
        // --- *** START: ส่วนที่แก้ไข *** ---
        // Combine rejectionReason and editNotes into a single "Notes" column
        { 
            field: 'notes', 
            headerName: 'หมายเหตุ', 
            width: 200, 
            renderCell: (params) => {
                const rejectionReason = params.row.rejectionReason;
                const editNotes = params.row.editNotes;
                const note = rejectionReason || editNotes;
                const color = rejectionReason ? 'error.main' : 'info.main';

                if (!note || !params.row.isFirstInGroup) return null;

                return (
                    <Tooltip title={note}>
                        <Typography variant="body2" color={color} noWrap>
                            {note}
                        </Typography>
                    </Tooltip>
                );
            } 
        },
        // --- *** END: ส่วนที่แก้ไข *** ---
        { field: 'status', headerName: 'สถานะ', width: 200, renderCell: (params) => params.row.isFirstInGroup ? <Chip label={params.value === 'EDITED' ? 'ถูกแก้ไข' : params.value} color={statusColors[params.value] || 'default'} size="small" /> : '' },
        {
            field: 'actions',
            headerName: 'จัดการ',
            width: 120,
            align: 'center',
            headerAlign: 'center',
            sortable: false,
            renderCell: (params) => {
                if (params.row.isLastInGroup && params.row.status === 'REJECTED') {
                    return (
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleOpenEditDialog(params.row.id)}
                        >
                            แก้ไข
                        </Button>
                    );
                }
                return null;
            }
        }
    ];

    if (loading) return <CircularProgress />;
    
    return (
        <>
            <Paper 
                elevation={3} 
                sx={{ 
                    p:3, 
                    borderRadius: '16px', 
                    height: 'calc(100vh - 120px)',
                    '& .MuiDataGrid-row.group-last-row': { borderBottom: '2px solid #ccc' },
                    '& .MuiDataGrid-row.rejected-row': { backgroundColor: 'rgba(255, 0, 0, 0.05)', '&:hover': { backgroundColor: 'rgba(255, 0, 0, 0.1) !important' } },
                    // --- *** START: ส่วนที่เพิ่มเข้ามาใหม่ *** ---
                    '& .MuiDataGrid-row.edited-row': { backgroundColor: '#e3f2fd', '&:hover': { backgroundColor: '#bbdefb !important' } },
                    // --- *** END: ส่วนที่เพิ่มเข้ามาใหม่ *** ---
                }}
            >
                <Typography variant="h5" fontWeight="bold" gutterBottom>ประวัติการขอ OT ของฉัน</Typography>
                <DataGrid 
                    rows={historyRows} 
                    columns={columns}
                    getRowId={(row) => row.uniqueId}
                    getRowClassName={(params) => {
                        let classes = [];
                        if (params.row.isLastInGroup) classes.push('group-last-row');
                        if (params.row.status === 'REJECTED') classes.push('rejected-row');
                        // --- *** START: ส่วนที่เพิ่มเข้ามาใหม่ *** ---
                        if (params.row.status === 'EDITED') classes.push('edited-row');
                        // --- *** END: ส่วนที่เพิ่มเข้ามาใหม่ *** ---
                        return classes.join(' ');
                    }}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    pageSizeOptions={[10, 25, 50]}
                    disableRowSelectionOnClick
                />
            </Paper>
             <AttachmentViewerDialog
                open={attachmentDialogOpen}
                onClose={() => setAttachmentDialogOpen(false)}
                attachments={selectedAttachments}
            />
            <EditOTRequestDialog
                open={editDialogOpen}
                onClose={handleCloseEditDialog}
                onSuccess={handleEditSuccess}
                requestId={editingRequestId}
            />
        </>
    );
};

export default MyOTHistoryPage;
