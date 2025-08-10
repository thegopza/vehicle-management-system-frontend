import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, CircularProgress, Button, Chip, IconButton, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import AttachmentIcon from '@mui/icons-material/Attachment';
import EditIcon from '@mui/icons-material/Edit';
import useSnackbar from '../../hooks/useSnackbar';
import useAuth from '../../hooks/useAuth';
import otService from '../../api/otService';
import dayjs from 'dayjs';
import AttachmentViewerDialog from '../../components/specific/AttachmentViewerDialog';
import ApprovalEditDialog from '../../components/specific/ApprovalEditDialog';

// --- *** START: ส่วนที่เพิ่มเข้ามาใหม่ *** ---
// Helper function to generate a summary for the 'reason' column
const generateTaskSummary = (row) => {
    // If it's a GENERAL request, use reason/project
    if (row.reason || row.project) {
        return row.reason || row.project;
    }

    // If it's a TEAM request but has no tasks, show a default message
    if (!row.tasks || row.tasks.length === 0) {
        return 'ไม่มีรายละเอียดงาน (ระบบทีม)';
    }

    // Take the first task for a concise summary
    const firstTask = row.tasks[0];
    
    // Determine the primary subject of the task (equipment or custom item)
    const subject = firstTask.customRepairItem || firstTask.equipmentName || 'งาน';
    
    // Get the description of the fix
    const description = firstTask.customFixDescription || 'N/A';
    
    let summary = `${subject}: ${description}`;

    // If there are more tasks, add an indicator
    if (row.tasks.length > 1) {
        summary += ` (และอีก ${row.tasks.length - 1} รายการ)`;
    }

    return summary;
};
// --- *** END: ส่วนที่เพิ่มเข้ามาใหม่ *** ---


const OTApprovalPage = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showSnackbar } = useSnackbar();

    const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
    const [selectedAttachments, setSelectedAttachments] = useState([]);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingRequestId, setEditingRequestId] = useState(null);

    const isManager = user?.roles.includes('ROLE_MANAGER') || user?.roles.includes('ROLE_CAO');

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            const response = await otService.getPendingApprovals();
            setRequests(response.data);
        } catch (error) {
            console.error(error);
            showSnackbar('ไม่สามารถโหลดข้อมูลคำขอได้', 'error');
        } finally {
            setLoading(false);
        }
    }, [showSnackbar]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

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
        showSnackbar('แก้ไขข้อมูลคำขอสำเร็จ', 'success');
        fetchRequests(); 
    };
    
    const handleReview = async (id) => {
        try {
            await otService.reviewRequest(id);
            showSnackbar(`ตรวจสอบและส่งต่อคำขอ #${id} สำเร็จ`, 'success');
            fetchRequests();
        } catch (error) {
            showSnackbar('เกิดข้อผิดพลาดในการส่งต่อ', 'error');
            console.error(error);
        }
    };

    const handleApprove = async (id) => {
        try {
            await otService.approveRequest(id, false);
            showSnackbar(`อนุมัติคำขอ #${id} สำเร็จ`, 'success');
            fetchRequests();
        } catch (error) {
            if (error.response && error.response.status === 409) {
                if (window.confirm(`คำเตือน: ${error.response.data.message}\n\nคุณต้องการอนุมัติทับซ้อนข้อมูลเดิมหรือไม่?`)) {
                    try {
                        await otService.approveRequest(id, true);
                        showSnackbar(`อนุมัติทับซ้อนข้อมูลสำเร็จ`, 'success');
                        fetchRequests();
                    } catch (finalError) {
                        console.error(finalError);
                        showSnackbar('เกิดข้อผิดพลาดในการอนุมัติทับซ้อน', 'error');
                    }
                }
            } else {
                console.error(error);
                showSnackbar('เกิดข้อผิดพลาดในการอนุมัติ', 'error');
            }
        }
    };
    
    const handleReject = async (id) => {
        const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ:');
        if (reason) {
            try {
                await otService.rejectRequest(id, reason);
                showSnackbar(`ปฏิเสธคำขอ #${id} สำเร็จ`, 'warning');
                fetchRequests();
            } catch (error) {
                console.error(error);
                showSnackbar('เกิดข้อผิดพลาดในการปฏิเสธ', 'error');
            }
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { 
            field: 'requester', 
            headerName: 'ผู้ขอ', 
            width: 180, 
            valueGetter: (value, row) => `${row.requester?.firstName} ${row.requester?.lastName}`
        },
        { 
            field: 'otDates',
            headerName: 'วันที่', 
            width: 150, 
            renderCell: (params) => (
                <Tooltip title={params.value?.map(d => dayjs(d.workDate).format('DD/MM/YYYY')).join(', ') || ''}>
                    <span>{params.value?.map(d => dayjs(d.workDate).format('DD/MM/YY')).join(', ') || ''}</span>
                </Tooltip>
            )
        },
        { 
            field: 'startTime',
            headerName: 'เวลา', 
            width: 130, 
            valueGetter: (value, row) => `${dayjs(row.startTime, 'HH:mm:ss').format('HH:mm')} - ${dayjs(row.endTime, 'HH:mm:ss').format('HH:mm')}`
        },
        {
            field: 'calculatedHours',
            headerName: 'ชม.',
            width: 90,
            type: 'number',
            align: 'center',
            headerAlign: 'center',
            valueGetter: (value, row) => {
                const startTime = dayjs(row.startTime, 'HH:mm:ss');
                const endTime = dayjs(row.endTime, 'HH:mm:ss');
                if (startTime.isValid() && endTime.isValid()) {
                    let difference = endTime.diff(startTime, 'minute');
                    if (difference < 0) {
                        difference += 24 * 60; // Add 24 hours (1440 minutes)
                    }
                    return difference / 60;
                }
                return null; // Return null for invalid data
            },
            valueFormatter: (value) => value != null ? Number(value).toFixed(2) : '-'
        },
        // --- *** START: ส่วนที่แก้ไข *** ---
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
                            <Typography variant="body2" noWrap>
                                {summary}
                            </Typography>
                        </Tooltip>
                        {params.row.attachments && params.row.attachments.length > 0 && (
                            <Tooltip title="ดูไฟล์แนบ">
                                <IconButton size="small" sx={{ ml: 1 }} onClick={() => handleViewAttachments(params.row.attachments)}>
                                    <AttachmentIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                )
            }
        },
        // --- *** END: ส่วนที่แก้ไข *** ---
        { 
            field: 'status', 
            headerName: 'สถานะ', 
            width: 220,
            renderCell: (params) => <Chip label={params.value} color={params.value === 'PENDING_ASSISTANT_REVIEW' ? 'info' : 'warning'} size="small" /> 
        },
        {
            field: 'actions', headerName: 'การจัดการ', width: 280, align: 'center', headerAlign: 'center', sortable: false,
            renderCell: (params) => {
                const status = params.row?.status;
                return (
                    <Box sx={{display: 'flex', gap: 1}}>
                        <Tooltip title="ดูรายละเอียดและแก้ไข">
                            <IconButton color="default" onClick={() => handleOpenEditDialog(params.row.id)}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>

                        {isManager && status === 'PENDING_MANAGER_APPROVAL' && (
                            <>
                                <Button variant="contained" color="success" size="small" startIcon={<CheckCircleIcon />} onClick={() => handleApprove(params.row.id)}>อนุมัติ</Button>
                                <Button variant="contained" color="error" size="small" startIcon={<CancelIcon />} onClick={() => handleReject(params.row.id)}>ปฏิเสธ</Button>
                            </>
                        )}
                        
                        {!isManager && status === 'PENDING_ASSISTANT_REVIEW' && (
                             <Button variant="contained" color="primary" size="small" startIcon={<ForwardToInboxIcon />} onClick={() => handleReview(params.row.id)}>
                                ตรวจสอบและส่งต่อ
                            </Button>
                        )}
                    </Box>
                );
            }
        }
    ];

    if (loading) return <CircularProgress />;

    return (
        <>
            <Paper elevation={3} sx={{ p:3, borderRadius: '16px', height: 'calc(100vh - 120px)' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {isManager ? 'จัดการคำขอ OT (สำหรับผู้อนุมัติ)' : 'รายการ OT ที่ต้องตรวจสอบ'}
                </Typography>
                <DataGrid 
                    rows={requests} 
                    columns={columns} 
                    getRowId={(row) => row.id}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[10, 25, 50]}
                    disableRowSelectionOnClick
                />
            </Paper>
            <AttachmentViewerDialog
                open={attachmentDialogOpen}
                onClose={() => setAttachmentDialogOpen(false)}
                attachments={selectedAttachments}
            />
            <ApprovalEditDialog
                open={editDialogOpen}
                onClose={handleCloseEditDialog}
                onSuccess={handleEditSuccess}
                requestId={editingRequestId}
            />
        </>
    );
};

export default OTApprovalPage;
