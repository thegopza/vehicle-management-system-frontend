import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Paper, Tabs, Tab, CircularProgress, Alert, ToggleButtonGroup, ToggleButton, Divider, Autocomplete, TextField, List, ListItem, ListItemText, IconButton, Button, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useAuth from '../../hooks/useAuth';
import useSnackbar from '../../hooks/useSnackbar';
import otService from '../../api/otService';
import userService from '../../api/userService';

// --- Helper Components ---
function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PersonalSettingsPanel = ({ user, updateUser, showSnackbar, assistants, allUsers, fetchSettings }) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const currentMode = user.otSystemMode || 'GENERAL';

    const handleModeChange = async (event, newMode) => {
        if (newMode !== null && newMode !== user.otSystemMode) {
            try {
                await otService.setOtMode(newMode);
                updateUser({ otSystemMode: newMode });
                showSnackbar('อัปเดตโหมดสำเร็จ', 'success');
            } catch (error) {
                showSnackbar('เกิดข้อผิดพลาดในการเปลี่ยนโหมด', 'error');
            }
        }
    };

    const handleAddAssistant = async () => {
        if (!selectedUser) return showSnackbar('กรุณาเลือกผู้ใช้ก่อน', 'warning');
        try {
            await otService.addAssistant(selectedUser.id);
            showSnackbar('เพิ่มผู้ช่วยสำเร็จ', 'success');
            fetchSettings();
            setSelectedUser(null);
        } catch (error) {
            showSnackbar('เกิดข้อผิดพลาดในการเพิ่มผู้ช่วย', 'error');
        }
    };

    const handleRemoveAssistant = async (assistantId) => {
        if (window.confirm('คุณต้องการลบผู้ช่วยคนนี้ใช่หรือไม่?')) {
            try {
                await otService.removeAssistant(assistantId);
                showSnackbar('ลบผู้ช่วยสำเร็จ', 'success');
                fetchSettings();
            } catch (error) {
                showSnackbar('เกิดข้อผิดพลาดในการลบผู้ช่วย', 'error');
            }
        }
    };

    return (
        <>
            <Box mb={4}>
                <Typography variant="h6" gutterBottom>เลือกโหมดการอนุมัติ</Typography>
                <ToggleButtonGroup color="primary" value={currentMode} exclusive onChange={handleModeChange}>
                    <ToggleButton value="GENERAL">ระบบทั่วไป</ToggleButton>
                    <ToggleButton value="TEAM">ระบบทีม</ToggleButton>
                </ToggleButtonGroup>
            </Box>
            <Divider />
            <Box mt={2}>
                <Typography variant="h6" gutterBottom>จัดการผู้ช่วย (สำหรับโหมดทีม)</Typography>
                {currentMode === 'TEAM' ? (
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>เพิ่มผู้ช่วยใหม่</Typography>
                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <Autocomplete
                                options={allUsers.filter(u => !assistants.some(a => a.id === u.id))}
                                getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.username})`}
                                value={selectedUser}
                                onChange={(event, newValue) => setSelectedUser(newValue)}
                                sx={{ flexGrow: 1 }}
                                renderInput={(params) => <TextField {...params} label="ค้นหารายชื่อพนักงาน" />}
                            />
                            <Button variant="contained" onClick={handleAddAssistant} startIcon={<AddIcon />}>เพิ่ม</Button>
                        </Box>
                        <Divider />
                        <Typography variant="subtitle1" sx={{ mt: 2 }}>รายชื่อผู้ช่วยปัจจุบัน</Typography>
                        <List>
                            {assistants.length > 0 ? assistants.map(assistant => (
                                <ListItem key={assistant.id} secondaryAction={
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveAssistant(assistant.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                }>
                                    <ListItemText primary={`${assistant.firstName} ${assistant.lastName}`} secondary={assistant.username} />
                                </ListItem>
                            )) : <Typography sx={{ p: 2 }}>ยังไม่มีผู้ช่วย</Typography>}
                        </List>
                    </Box>
                ) : (
                    <Alert severity="info">โหมดนี้ไม่จำเป็นต้องใช้ผู้ช่วย</Alert>
                )}
            </Box>
        </>
    );
};

const CheckpointsPanel = ({ checkpoints, fetchSettings, showSnackbar }) => {
    const [newCheckpointName, setNewCheckpointName] = useState("");

    const handleAddCheckpoint = async () => {
        if (!newCheckpointName.trim()) return showSnackbar('กรุณากรอกชื่อด่าน', 'warning');
        try {
            await otService.createCheckpoint(newCheckpointName);
            showSnackbar('เพิ่มด่านสำเร็จ', 'success');
            setNewCheckpointName("");
            fetchSettings();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มด่าน', 'error');
        }
    };

    const handleDeleteCheckpoint = async (checkpointId) => {
        if (window.confirm('ยืนยันการลบด่านนี้? (Lane ทั้งหมดจะถูกลบไปด้วย)')) {
            try {
                await otService.deleteCheckpoint(checkpointId);
                showSnackbar('ลบด่านสำเร็จ', 'success');
                fetchSettings();
            } catch (error) {
                showSnackbar('เกิดข้อผิดพลาดในการลบด่าน', 'error');
            }
        }
    };
    
    const handleDeleteLane = async (laneId) => {
        if (window.confirm('ยืนยันการลบ Lane นี้?')) {
            try {
                await otService.deleteLane(laneId);
                showSnackbar('ลบ Lane สำเร็จ', 'success');
                fetchSettings();
            } catch (error) {
                showSnackbar('เกิดข้อผิดพลาดในการลบ Lane', 'error');
            }
        }
    };

    const handleAddLane = async (checkpointId) => {
        const laneName = prompt(`กรุณาระบุชื่อ Lane:`);
        if (laneName && laneName.trim()) {
            try {
                await otService.createLane(checkpointId, laneName);
                showSnackbar(`เพิ่ม Lane '${laneName}' สำเร็จ`, 'success');
                fetchSettings();
            } catch (error) {
                showSnackbar('เกิดข้อผิดพลาดในการเพิ่ม Lane', 'error');
            }
        }
    };

    return (
        <>
            <Typography variant="h6" gutterBottom>จัดการด่านและเลน</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                <TextField label="ชื่อด่านใหม่" value={newCheckpointName} onChange={(e) => setNewCheckpointName(e.target.value)} variant="outlined" sx={{ flexGrow: 1 }} size="small" />
                <Button variant="contained" onClick={handleAddCheckpoint} startIcon={<AddIcon />}>เพิ่มด่าน</Button>
            </Box>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>รายการด่านทั้งหมด</Typography>
            {checkpoints.length > 0 ? checkpoints.map(cp => (
                <Accordion key={cp.id}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ width: '100%', fontWeight: 'bold' }}>{cp.name}</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ backgroundColor: 'grey.50' }}>
                        <List dense>
                            {cp.lanes?.map(lane => (
                                <ListItem key={lane.id} secondaryAction={
                                    <IconButton edge="end" size="small" onClick={() => handleDeleteLane(lane.id)}><DeleteIcon fontSize="small" /></IconButton>
                                }>
                                    <ListItemText primary={lane.name} />
                                </ListItem>
                            ))}
                        </List>
                        <Box sx={{ mt: 2, pt: 2, display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #ddd' }}>
                            <Button size="small" variant="outlined" onClick={() => handleAddLane(cp.id)}>เพิ่ม Lane</Button>
                            <Button size="small" color="error" variant="text" startIcon={<DeleteIcon />} onClick={() => handleDeleteCheckpoint(cp.id)}>ลบด่านนี้</Button>
                        </Box>
                    </AccordionDetails>
                </Accordion>
            )) : <Alert severity="info" sx={{ mt: 2 }}>ยังไม่มีข้อมูลด่านที่คุณดูแล</Alert>}
        </>
    );
};

const EquipmentPanel = ({ equipments, fetchSettings, showSnackbar }) => {
    const [newEquipmentName, setNewEquipmentName] = useState("");

    const handleAddEquipment = async () => {
        if (!newEquipmentName.trim()) return showSnackbar('กรุณากรอกชื่ออุปกรณ์', 'warning');
        try {
            await otService.createEquipment(newEquipmentName);
            showSnackbar('เพิ่มอุปกรณ์สำเร็จ', 'success');
            setNewEquipmentName("");
            fetchSettings();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มอุปกรณ์', 'error');
        }
    };

    const handleDeleteEquipment = async (equipmentId) => {
        if (window.confirm('ยืนยันการลบอุปกรณ์นี้?')) {
            try {
                await otService.deleteEquipment(equipmentId);
                showSnackbar('ลบอุปกรณ์สำเร็จ', 'success');
                fetchSettings();
            } catch (error) {
                showSnackbar('เกิดข้อผิดพลาดในการลบอุปกรณ์', 'error');
            }
        }
    };

    return (
        <>
            <Typography variant="h6" gutterBottom>จัดการรายการอุปกรณ์ (Master List)</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                <TextField label="ชื่ออุปกรณ์ใหม่" value={newEquipmentName} onChange={(e) => setNewEquipmentName(e.target.value)} variant="outlined" sx={{ flexGrow: 1 }} size="small" />
                <Button variant="contained" onClick={handleAddEquipment} startIcon={<AddIcon />}>เพิ่มอุปกรณ์</Button>
            </Box>
            <Paper variant="outlined">
                <List>
                    {equipments.map((eq, index) => (
                        <ListItem key={eq.id} divider={index < equipments.length - 1} secondaryAction={
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteEquipment(eq.id)}>
                                <DeleteIcon />
                            </IconButton>
                        }>
                            <ListItemText primary={eq.name} />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </>
    );
};


// --- Main Page Component ---
const OTSettingsPage = () => {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const { user, updateUser } = useAuth();
    const { showSnackbar } = useSnackbar();

    const [allUsers, setAllUsers] = useState([]);
    const [assistants, setAssistants] = useState([]);
    const [checkpoints, setCheckpoints] = useState([]);
    const [equipments, setEquipments] = useState([]);

    const isManagerOrCao = useMemo(() => user?.roles.includes('ROLE_MANAGER') || user?.roles.includes('ROLE_CAO'), [user]);
    const isAssistant = useMemo(() => !isManagerOrCao && (checkpoints && checkpoints.length > 0), [isManagerOrCao, checkpoints]);
    
    // --- *** START: ส่วนที่แก้ไข Logic *** ---
    // เงื่อนไขใหม่ในการแสดงแถบจัดการ:
    // 1. เป็นผู้ช่วย (isAssistant)
    // 2. หรือ เป็น Manager/CAO และเลือกโหมด TEAM
    const showManagementTabs = useMemo(() => {
        return isAssistant || (isManagerOrCao && user.otSystemMode === 'TEAM');
    }, [isAssistant, isManagerOrCao, user.otSystemMode]);
    // --- *** END: ส่วนที่แก้ไข Logic *** ---

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const apiCalls = [
                otService.getMyCheckpoints(),
                otService.getAllEquipments(),
                userService.getAllUsers()
            ];
            if (isManagerOrCao) {
                apiCalls.push(otService.getAssistants());
            }

            const [checkpointsRes, equipmentsRes, allUsersRes, assistantsRes] = await Promise.all(apiCalls);
            setCheckpoints(checkpointsRes.data);
            setEquipments(equipmentsRes.data);
            setAllUsers(allUsersRes.data.filter(u => u.id !== user.id));
            if (isManagerOrCao && assistantsRes) {
                setAssistants(assistantsRes.data);
            }
        } catch (error) {
            console.error(error);
            showSnackbar(error.response?.data?.message || 'ไม่สามารถดึงข้อมูลการตั้งค่าได้', 'error');
        } finally {
            setLoading(false);
        }
    }, [showSnackbar, user.id, isManagerOrCao]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleTabChange = (event, newValue) => setTabValue(newValue);

    // สร้างรายการ Tabs แบบไดนามิกตามสิทธิ์และโหมดที่เลือก
    const availableTabs = useMemo(() => {
        const tabs = [];
        if (isManagerOrCao) {
            tabs.push({
                label: "การตั้งค่าส่วนตัว",
                panel: <PersonalSettingsPanel user={user} updateUser={updateUser} showSnackbar={showSnackbar} assistants={assistants} allUsers={allUsers} fetchSettings={fetchSettings} />
            });
        }
        
        // --- *** START: ส่วนที่แก้ไข Logic *** ---
        // ใช้เงื่อนไขใหม่ในการเพิ่มแถบ
        if (showManagementTabs) {
            tabs.push({
                label: "จัดการด่านและเลน",
                panel: <CheckpointsPanel checkpoints={checkpoints} fetchSettings={fetchSettings} showSnackbar={showSnackbar} />
            });
            tabs.push({
                label: "จัดการรายการอุปกรณ์",
                panel: <EquipmentPanel equipments={equipments} fetchSettings={fetchSettings} showSnackbar={showSnackbar} />
            });
        }
        // --- *** END: ส่วนที่แก้ไข Logic *** ---
        return tabs;
    }, [isManagerOrCao, showManagementTabs, user, updateUser, showSnackbar, assistants, allUsers, checkpoints, equipments, fetchSettings]);
    
    // Reset tabValue if it becomes invalid after data loads or mode changes
    useEffect(() => {
        if (tabValue >= availableTabs.length) {
            setTabValue(0);
        }
    }, [tabValue, availableTabs]);

    if (loading) return <CircularProgress />;

    return (
        <Paper elevation={3} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
            <Box sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold">ตั้งค่าระบบ OT</Typography>
            </Box>
            <Divider />
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 3 }}>
                    {availableTabs.map((tab, index) => (
                        <Tab label={tab.label} key={index} />
                    ))}
                </Tabs>
            </Box>

            {availableTabs.map((tab, index) => (
                <TabPanel value={tabValue} index={index} key={index}>
                    {tab.panel}
                </TabPanel>
            ))}
        </Paper>
    );
};

export default OTSettingsPage;
