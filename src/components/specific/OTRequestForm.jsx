import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Button, CircularProgress, Grid, TextField, Autocomplete, Chip, IconButton, Switch, FormControlLabel } from '@mui/material';
import { LocalizationProvider, StaticDatePicker, TimePicker, PickersDay } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CancelIcon from '@mui/icons-material/Cancel';
import dayjs from 'dayjs';
import useSnackbar from '../../hooks/useSnackbar';
import useAuth from '../../hooks/useAuth';
import userService from '../../api/userService';
import otService from '../../api/otService';
import apiClient from '../../api/axiosConfig'; // Import apiClient to get base URL
// --- *** START: ส่วนที่แก้ไข *** ---
// Corrected the import path by removing one level of '..'
import ImageViewerDialog from '../common/ImageViewerDialog'; 
// --- *** END: ส่วนที่แก้ไข *** ---

const TeamTaskItem = ({ task, onUpdate, onRemove, managerId }) => {
    // This component remains unchanged
    const [isOther, setIsOther] = useState(!!task.customRepairItem);
    const [checkpoints, setCheckpoints] = useState([]);
    const [lanes, setLanes] = useState([]);
    const [allEquipments, setAllEquipments] = useState([]);
    const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
    const [selectedLane, setSelectedLane] = useState(null);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [loading, setLoading] = useState(true);

    const initialData = useMemo(() => ({
        checkpointId: task.checkpointId,
        laneId: task.laneId,
        equipmentId: task.equipmentId,
    }), [task.checkpointId, task.laneId, task.equipmentId]);

    useEffect(() => {
        const fetchAndSetData = async () => {
            if (!managerId) { setLoading(false); return; }
            try {
                setLoading(true);
                const [cpRes, eqRes] = await Promise.all([otService.getMyCheckpoints(), otService.getAllEquipments()]);
                const checkpointsData = cpRes.data;
                const equipmentsData = eqRes.data;
                setCheckpoints(checkpointsData);
                setAllEquipments(equipmentsData);

                if (initialData.equipmentId) {
                    setSelectedEquipment(equipmentsData.find(e => e.id === initialData.equipmentId) || null);
                }
                if (initialData.checkpointId) {
                    const foundCp = checkpointsData.find(c => c.id === initialData.checkpointId);
                    if (foundCp) {
                        setSelectedCheckpoint(foundCp);
                        const lanesData = foundCp.lanes || [];
                        setLanes(lanesData);
                        if (initialData.laneId) {
                            setSelectedLane(lanesData.find(l => l.id === initialData.laneId) || null);
                        }
                    }
                }
            } catch (error) { console.error("Failed to fetch task data", error); }
            finally { setLoading(false); }
        };
        fetchAndSetData();
    }, [managerId, initialData]);

    const handleCheckpointChange = (event, newValue) => {
        setSelectedCheckpoint(newValue);
        const newLanes = newValue ? newValue.lanes : [];
        setLanes(newLanes);
        setSelectedLane(null);
        onUpdate({ checkpointId: newValue?.id, laneId: null });
    };
    const handleLaneChange = (event, newValue) => { setSelectedLane(newValue); onUpdate({ laneId: newValue?.id }); };
    const handleEquipmentChange = (event, newValue) => { setSelectedEquipment(newValue); onUpdate({ equipmentId: newValue?.id }); };
    const handleSwitchChange = (event) => {
        setIsOther(event.target.checked);
        onUpdate({ isOther: event.target.checked, checkpointId: null, laneId: null, equipmentId: null, customRepairItem: '', customFixDescription: '' });
        setSelectedCheckpoint(null); setSelectedLane(null); setSelectedEquipment(null);
    };
    const handleTextChange = (field, value) => { onUpdate(field === 'item' ? { customRepairItem: value } : { customFixDescription: value }); };

    if (loading) return <CircularProgress size={20} />;
    return (
        <Box sx={{ p: 2, pt: 5, border: '1px dashed #ccc', borderRadius: 2, mb: 1.5, position: 'relative' }}>
            <FormControlLabel 
                control={<Switch size="small" checked={isOther} onChange={handleSwitchChange} />} 
                label="เป็นงานซ่อมอื่นๆ" 
                sx={{ position: 'absolute', top: 8, right: 48, zIndex: 1 }} 
            />
            {isOther ? (
                <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}><TextField label="สิ่งที่ซ่อม" defaultValue={task.customRepairItem || ''} onBlur={(e) => handleTextChange('item', e.target.value)} fullWidth size="small" /></Grid>
                    <Grid item xs={12} sm={6}><TextField label="การแก้ไข" defaultValue={task.customFixDescription || ''} onBlur={(e) => handleTextChange('desc', e.target.value)} fullWidth size="small" /></Grid>
                </Grid>
            ) : (
                <Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Autocomplete options={checkpoints} value={selectedCheckpoint} onChange={handleCheckpointChange} getOptionLabel={(o) => o.name} isOptionEqualToValue={(o,v) => o.id === v.id} sx={{ width: 200 }} renderInput={(params) => <TextField {...params} label="ด่าน" size="small" />} />
                        <Autocomplete options={lanes} value={selectedLane} onChange={handleLaneChange} getOptionLabel={(o) => o.name} isOptionEqualToValue={(o,v) => o.id === v.id} sx={{ width: 200 }} renderInput={(params) => <TextField {...params} label="Lane" size="small" />} />
                        <Autocomplete options={allEquipments} value={selectedEquipment} onChange={handleEquipmentChange} getOptionLabel={(o) => o.name} isOptionEqualToValue={(o,v) => o.id === v.id} sx={{ flexGrow: 1 }} renderInput={(params) => <TextField {...params} label="อุปกรณ์" size="small" />} />
                    </Box>
                    <TextField 
                        label="การแก้ไข" 
                        defaultValue={task.customFixDescription || ''} 
                        onBlur={(e) => handleTextChange('desc', e.target.value)} 
                        fullWidth 
                        size="small" 
                        sx={{ mt: 1.5 }}
                    />
                </Box>
            )}
            <IconButton onClick={onRemove} color="error" size="small" sx={{ position: 'absolute', top: 8, right: 8 }}><DeleteIcon fontSize='small'/></IconButton>
        </Box>
    );
};

const OTRequestForm = ({ editId, onSuccess, onCancel, isApproverEditMode = false }) => {
    const { user } = useAuth();
    const isEditMode = Boolean(editId);

    const [managers, setManagers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedManager, setSelectedManager] = useState(null);
    const [selectedCoworkers, setSelectedCoworkers] = useState([]);
    const [selectedDates, setSelectedDates] = useState([]);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showSnackbar } = useSnackbar();
    const [workLocation, setWorkLocation] = useState('');
    const [project, setProject] = useState('');
    const [reason, setReason] = useState('');
    const [tasks, setTasks] = useState([{}]);
    const [calculatedHours, setCalculatedHours] = useState(0);
    const [editNotes, setEditNotes] = useState('');
    
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [existingAttachments, setExistingAttachments] = useState([]);
    const [imageViewerOpen, setImageViewerOpen] = useState(false);
    const [viewingImageUrl, setViewingImageUrl] = useState('');

    const clearForm = useCallback(() => {
        setSelectedManager(null);
        setSelectedCoworkers([]);
        setSelectedDates([]);
        setStartTime(null);
        setEndTime(null);
        setWorkLocation('');
        setProject('');
        setReason('');
        setTasks([{}]);
        setEditNotes('');
        setSelectedFiles([]);
        setExistingAttachments([]);
    }, []);

    useEffect(() => {
        const fetchPageData = async () => {
            setLoading(true);
            try {
                const [managersRes, usersRes] = await Promise.all([
                    userService.getUsersByRole('MANAGER'),
                    userService.getAllUsers()
                ]);
                
                const managersData = managersRes.data;
                const allUsersData = usersRes.data;
                
                setManagers(managersData);
                setAllUsers(allUsersData.filter(u => u.id !== user.id && u.roles.includes('user')));

                if (isEditMode) {
                    const response = await otService.getOtRequestById(editId);
                    const data = response.data;
                    
                    const managerObj = managersData.find(m => m.id === data.manager.id);
                    setSelectedManager(managerObj);

                    const coworkerObjs = allUsersData.filter(u => data.coworkers.some(cw => cw.id === u.id));
                    setSelectedCoworkers(coworkerObjs);

                    setSelectedDates(data.otDates.map(d => dayjs(d.workDate)));
                    setStartTime(dayjs(data.startTime, 'HH:mm:ss'));
                    setEndTime(dayjs(data.endTime, 'HH:mm:ss'));

                    setWorkLocation(data.workLocation || '');
                    setProject(data.project || '');
                    setReason(data.reason || '');
                    setEditNotes(data.editNotes || '');
                    
                    if (data.tasks && data.tasks.length > 0) {
                        setTasks(data.tasks);
                    } else {
                        setTasks([{}]);
                    }
                    setExistingAttachments(data.attachments || []);
                    setSelectedFiles([]);
                } else {
                    clearForm();
                }
            } catch (error) {
                console.error(error);
                showSnackbar('ไม่สามารถโหลดข้อมูลได้', 'error');
                if(onCancel) onCancel();
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchPageData();
        }
    }, [user, editId, showSnackbar, onCancel, clearForm, isEditMode]);

    useEffect(() => {
        if (startTime && endTime) {
            let difference = endTime.diff(startTime, 'minute');
            if (difference < 0) difference += 24 * 60;
            setCalculatedHours((difference / 60).toFixed(2));
        } else {
            setCalculatedHours(0);
        }
    }, [startTime, endTime]);

    const handleDateChange = (newDate) => {
        const alreadySelected = selectedDates.some(date => dayjs(date).isSame(newDate, 'day'));
        setSelectedDates(alreadySelected ? prev => prev.filter(date => !dayjs(date).isSame(newDate, 'day')) : prev => [...prev, newDate]);
    };
    const handleAddTask = () => setTasks(prev => [...prev, {}]);
    const handleRemoveTask = (index) => setTasks(prev => prev.filter((_, i) => i !== index));
    const handleUpdateTask = (index, updatedField) => {
        setTasks(prevTasks => {
            const newTasks = [...prevTasks];
            newTasks[index] = { ...newTasks[index], ...updatedField };
            return newTasks;
        });
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        if (selectedFiles.length + files.length > 4) {
            showSnackbar('สามารถอัปโหลดรูปภาพได้สูงสุด 4 รูปเท่านั้น', 'error');
            return;
        }
        const filesWithPreview = files.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));
        setSelectedFiles(prevFiles => [...prevFiles, ...filesWithPreview]);
    };

    const handleRemoveFile = (fileName) => {
        setSelectedFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
    };

    const handleViewImage = (imageUrl) => {
        setViewingImageUrl(imageUrl);
        setImageViewerOpen(true);
    };

    const photoPlaceholders = useMemo(() => {
        const placeholders = [...existingAttachments];
        while (placeholders.length < 4) {
            placeholders.push(null);
        }
        return placeholders;
    }, [existingAttachments]);

    const handleSubmit = async () => {
        if (!selectedManager || selectedDates.length === 0 || !startTime || !endTime) {
            return showSnackbar('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ผู้อนุมัติ, วันที่, เวลา)', 'error');
        }
        if (isApproverEditMode && !editNotes.trim()) {
            return showSnackbar('กรุณากรอกเหตุผลในการแก้ไข', 'error');
        }

        const requestData = {
            managerId: selectedManager.id,
            coworkerIds: selectedCoworkers.map(cw => cw.id),
            workDates: selectedDates.map(d => dayjs(d).format('YYYY-MM-DD')),
            startTime: dayjs(startTime).format('HH:mm:ss'),
            endTime: dayjs(endTime).format('HH:mm:ss'),
            workLocation, 
            project, 
            reason,
            tasks: selectedManager.otSystemMode === 'TEAM' ? tasks.map(t => ({
                checkpointId: t.checkpointId,
                laneId: t.laneId,
                equipmentId: t.equipmentId,
                customRepairItem: t.customRepairItem,
                customFixDescription: t.customFixDescription,
            })) : [],
            editNotes: isApproverEditMode ? editNotes : undefined,
        };
        setLoading(true);
        try {
            if (isEditMode) {
                await otService.updateOtRequest(editId, requestData, selectedFiles);
                showSnackbar(`บันทึกการแก้ไข OT #${editId} สำเร็จ`, 'success');
            } else {
                await otService.createOtRequest(requestData, selectedFiles);
                showSnackbar('ส่งคำขอ OT ใหม่สำเร็จ', 'success');
                clearForm();
            }
            if(onSuccess) onSuccess();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'เกิดข้อผิดพลาด', 'error');
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) return <Box sx={{display:'flex', justifyContent:'center', my:5}}><CircularProgress /></Box>;

    return (
        <>
            <Box>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        {/* Form fields */}
                        <Autocomplete options={managers} getOptionLabel={(o) => `${o.firstName} ${o.lastName}`} isOptionEqualToValue={(o,v) => o.id === v.id} value={selectedManager} onChange={(e, nv) => setSelectedManager(nv)} renderInput={(params) => <TextField {...params} label="เลือกผู้อนุมัติ" required />} sx={{ mb: 2 }} />
                        <Autocomplete multiple options={allUsers} getOptionLabel={(o) => `${o.firstName} ${o.lastName}`} isOptionEqualToValue={(o,v) => o.id === v.id} value={selectedCoworkers} onChange={(e, nv) => setSelectedCoworkers(nv)} renderInput={(params) => <TextField {...params} label="เพิ่มผู้ร่วมงาน (ถ้ามี)" />} sx={{ mb: 2 }} />
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <TimePicker label="เวลาเริ่มต้น" value={startTime} onChange={setStartTime} sx={{ mr: 2 }} ampm={false} />
                                <TimePicker label="เวลาสิ้นสุด" value={endTime} onChange={setEndTime} ampm={false} />
                                <Box sx={{ ml: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}><Typography variant="h6">{calculatedHours} <span style={{fontSize: '0.8rem'}}>ชม.</span></Typography></Box>
                            </Box>
                        </LocalizationProvider>
                        {selectedManager?.otSystemMode === 'GENERAL' && (
                            <Box sx={{mt: 2, border: '1px solid #e0e0e0', p: 2, borderRadius: 2}}>
                               <Typography variant="h6" gutterBottom>รายละเอียด (ระบบทั่วไป)</Typography>
                               <TextField label="สถานที่ทำงาน" value={workLocation} onChange={(e) => setWorkLocation(e.target.value)} fullWidth sx={{mb: 2}}/>
                               <TextField label="โครงการ" value={project} onChange={(e) => setProject(e.target.value)} fullWidth sx={{mb: 2}}/>
                               <TextField label="เหตุผล" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth multiline rows={3}/>
                            </Box>
                        )}
                         {selectedManager?.otSystemMode === 'TEAM' && (
                            <Box sx={{mt: 2, border: '1px solid #e0e0e0', p: 2, borderRadius: 2}}>
                               <Typography variant="h6" gutterBottom color="primary">รายละเอียดงาน (ระบบทีม)</Typography>
                               {tasks.map((task, index) => (<TeamTaskItem key={index} task={task} onRemove={() => handleRemoveTask(index)} onUpdate={(updated) => handleUpdateTask(index, updated)} managerId={selectedManager.id} />))}
                               <Button startIcon={<AddCircleOutlineIcon />} onClick={handleAddTask} sx={{mt: 1}}>เพิ่มรายการงาน</Button>
                            </Box>
                        )}

                        {isApproverEditMode && (
                            <Box sx={{mt: 2, border: '1px solid #e0e0e0', p: 2, borderRadius: 2, borderColor: 'primary.main'}}>
                                <Typography variant="h6" gutterBottom color="primary">บันทึกการแก้ไข (สำหรับผู้อนุมัติ)</Typography>
                                <TextField
                                    label="กรุณาระบุเหตุผล/รายละเอียดการแก้ไข"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    required
                                />
                            </Box>
                        )}

                        <Box sx={{mt: 2, border: '1px solid #e0e0e0', p: 2, borderRadius: 2}}>
                            <Typography variant="h6" gutterBottom>ไฟล์แนบ</Typography>
                            
                            {isEditMode && existingAttachments.length > 0 && (
                                <>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{mb: 2}}>รูปภาพปัจจุบัน (การอัปโหลดใหม่จะแทนที่รูปภาพทั้งหมด)</Typography>
                                    <Grid container spacing={2} sx={{mb: 2}}>
                                        {photoPlaceholders.map((fileName, idx) => {
                                            const fullUrl = fileName ? `${apiClient.defaults.baseURL}/files/${fileName}` : null;
                                            return (
                                                <Grid item xs={6} sm={3} key={idx}>
                                                    <Box
                                                        onClick={() => fullUrl && handleViewImage(fullUrl)}
                                                        sx={{
                                                            border: '2px dashed #ccc',
                                                            backgroundColor: '#f9f9f9',
                                                            height: 120,
                                                            borderRadius: 2,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#aaa',
                                                            overflow: 'hidden',
                                                            cursor: fullUrl ? 'pointer' : 'default',
                                                        }}
                                                    >
                                                        {fullUrl 
                                                            ? <img src={fullUrl} alt={`Attachment ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            : 'ไม่มีรูปภาพ'
                                                        }
                                                    </Box>
                                                </Grid>
                                            );
                                        })}
                                    </Grid>
                                </>
                            )}

                            <Typography variant="subtitle2" color="text.secondary" sx={{mb: 1}}>
                                {isEditMode ? 'อัปโหลดรูปภาพใหม่ (สูงสุด 4 ภาพ)' : 'แนบไฟล์ (สูงสุด 4 ภาพ)'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mt: 1 }}>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<AttachFileIcon />}
                                    disabled={selectedFiles.length >= 4}
                                >
                                    เลือกไฟล์
                                    <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
                                </Button>
                                {selectedFiles.map((file, index) => (
                                    <Box key={index} sx={{ position: 'relative', border: '1px solid #ddd', borderRadius: 1, p: 0.5, display: 'flex' }}>
                                        <img src={file.preview} alt={file.name} height="80" style={{ borderRadius: '4px', objectFit: 'cover' }} />
                                        <IconButton
                                            size="small"
                                            onClick={() => handleRemoveFile(file.name)}
                                            sx={{
                                                position: 'absolute',
                                                top: -10,
                                                right: -10,
                                                backgroundColor: 'white',
                                                color: 'error.main',
                                                p: 0.2,
                                                '&:hover': { backgroundColor: '#ffebee' }
                                            }}
                                        >
                                            <CancelIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="body1" gutterBottom>เลือกวันที่ทำงาน</Typography>
                         <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <StaticDatePicker displayStaticWrapperAs="desktop" value={null} onChange={handleDateChange} renderDay={(day, _selectedDays, pickersDayProps) => { const isSelected = selectedDates.some(selectedDate => dayjs(selectedDate).isSame(day, 'day')); return <PickersDay {...pickersDayProps} selected={isSelected} />; }} componentsProps={{ day: { selected: false } }} />
                        </LocalizationProvider>
                         <Box sx={{mt: 2}}>
                            <Typography variant="body2">วันที่เลือก:</Typography>
                            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1}}>
                                {selectedDates.sort((a,b) => a - b).map(date => (<Chip key={date.toString()} label={dayjs(date).format('DD/MM/YYYY')} onDelete={() => handleDateChange(date)} />))}
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                            {onCancel && <Button variant="outlined" onClick={onCancel}>ยกเลิก</Button>}
                            <Button variant="contained" onClick={handleSubmit} disabled={loading || !selectedManager}>
                                {loading ? <CircularProgress size={24}/> : (isEditMode ? 'บันทึกการแก้ไข' : 'ส่งคำขอ')}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
            <ImageViewerDialog
                open={imageViewerOpen}
                onClose={() => setImageViewerOpen(false)}
                imageUrl={viewingImageUrl}
            />
        </>
    );
}

export default OTRequestForm;
