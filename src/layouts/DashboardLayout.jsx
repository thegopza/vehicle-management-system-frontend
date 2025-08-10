import React, { useState, useEffect } from 'react';
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { styled } from '@mui/material/styles';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar as MuiAppBar, Toolbar, Typography, Divider, Avatar, IconButton, Collapse } from '@mui/material';

// --- *** START: ส่วนที่เพิ่มเข้ามา *** ---
import NotificationBell from '../components/common/NotificationBell';
// --- *** END: ส่วนที่เพิ่มเข้ามา *** ---

// Import Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ArticleIcon from '@mui/icons-material/Article';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import CarRentalIcon from '@mui/icons-material/CarRental';
import ViewListIcon from '@mui/icons-material/ViewList';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import HistoryIcon from '@mui/icons-material/History';
import WarningIcon from '@mui/icons-material/Warning';
import SettingsIcon from '@mui/icons-material/Settings';
import AddAlarmIcon from '@mui/icons-material/AddAlarm';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const drawerWidth = 280;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    minWidth: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBar = styled(MuiAppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const menuSystems = {
  vehicleUsage: {
    name: 'ระบบใช้งานรถ',
    group: 'vehicle',
    icon: <DirectionsCarIcon />,
    basePath: '/vehicles',
    roles: ['ADMIN', 'MANAGER', 'USER', 'KEY_RETURNER', 'CAO'],
    items: [
      { text: 'สถานะรถยนต์', path: '/vehicles/status', roles: ['USER', 'MANAGER', 'ADMIN', 'KEY_RETURNER', 'CAO'], icon: <CarRentalIcon /> },
      { text: 'รายการรถที่ถูกเบิกใช้งาน', path: '/vehicles/end-trip-list', roles: ['USER', 'MANAGER', 'ADMIN', 'KEY_RETURNER', 'CAO'], icon: <ViewListIcon /> },
      { text: 'รายการเบิกรถของฉัน', path: '/vehicles/my-trips', roles: ['USER', 'MANAGER', 'ADMIN', 'KEY_RETURNER', 'CAO'], icon: <PersonPinCircleIcon /> },
      { text: 'เคลียร์บิลน้ำมัน', path: '/vehicles/clear-bills', roles: ['USER', 'MANAGER', 'ADMIN', 'KEY_RETURNER', 'CAO'], icon: <ReceiptLongIcon /> },
      { text: 'คืนกุญแจ', path: '/vehicles/key-return', roles: ['KEY_RETURNER', 'CAO'], icon: <VpnKeyIcon /> },
    ],
  },
  vehicleAdmin: {
    name: 'ระบบจัดการรถและข้อมูล',
    group: 'vehicle',
    icon: <ArticleIcon />,
    basePath: '/vehicles',
    roles: ['ADMIN', 'CAO'],
    items: [
      { text: 'ประวัติเบิกรถ', path: '/vehicles/history', roles: ['ADMIN',  'CAO'], icon: <HistoryIcon /> },
      { text: 'รายการอุบัติเหตุ', path: '/vehicles/accidents', roles: ['ADMIN', 'CAO'], icon: <WarningIcon /> },
      { text: 'สรุปข้อมูลรายเดือน', path: '/vehicles/reports/monthly', roles: ['ADMIN', 'CAO'], icon: <AssessmentIcon /> },
      { text: 'สรุปบิลน้ำมันทั้งหมด', path: '/vehicles/reports/fuel', roles: ['ADMIN', 'CAO'], icon: <LocalGasStationIcon /> },
      { text: 'จัดการข้อมูลรถ', path: '/vehicles/management', roles: ['ADMIN', 'CAO'], icon: <SettingsIcon /> },
    ],
  },
  ot: {
    name: 'ระบบลงเวลาทำงาน (OT)',
    group: 'ot',
    icon: <AccessTimeIcon />,
    basePath: '/ot',
    roles: ['ADMIN', 'MANAGER', 'USER', 'KEY_RETURNER', 'CAO'],
    items: [
       { text: 'ลงเวลา OT', path: '/ot/request', roles: ['USER', 'MANAGER', 'ADMIN', 'KEY_RETURNER', 'CAO'], icon: <AddAlarmIcon /> },
       { text: 'ประวัติ OT ของฉัน', path: '/ot/my-history', roles: ['USER', 'MANAGER', 'ADMIN', 'KEY_RETURNER', 'CAO'], icon: <HistoryIcon /> },
       { text: 'สรุปโอที', path: '/ot/summary', roles: ['USER', 'MANAGER', 'ADMIN', 'KEY_RETURNER', 'CAO'], icon: <AssessmentIcon /> },
    ],
  },
  otManagement: {
    name: 'จัดการและตั้งค่าระบบ',
    group: 'ot',
    icon: <AdminPanelSettingsIcon />,
    basePath: '/ot',
    roles: ['MANAGER', 'CAO'],
    items: [
       { text: 'อนุมัติ OT', path: '/ot/approve', roles: ['MANAGER', 'CAO'], isAssistantAccess: true, icon: <PlaylistAddCheckIcon /> },
       { text: 'ตั้งค่าระบบ OT', path: '/ot/settings', roles: ['MANAGER', 'CAO'], isAssistantAccess: true, icon: <SettingsIcon /> },
    ]
  }
};

const userManagementMenuItem = {
    name: 'จัดการผู้ใช้งาน',
    path: '/users',
    icon: <PeopleIcon />,
    roles: ['ADMIN', 'CAO'],
};

const DashboardLayout = () => {
  const { user, logout, isAssistant } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(true); 
  const [openGroup, setOpenGroup] = useState(null); 

  useEffect(() => {
    if (location.pathname === '/dashboard' || location.pathname === '/') {
        setOpenGroup(null);
    } else {
        const currentSystemByItem = Object.values(menuSystems).find(system => 
            system.items.some(item => location.pathname.startsWith(item.path))
        );
        const currentSystemByUserMenu = location.pathname.startsWith(userManagementMenuItem.path) ? true : false;
        
        if (currentSystemByItem) {
            setOpenGroup(currentSystemByItem.group);
        } else if (!currentSystemByUserMenu) {
            setOpenGroup(null);
        }
    }
  }, [location.pathname]);

  const handleDrawerToggle = () => { setOpen(!open); };
  const handleGroupSelect = (groupKey) => { setOpenGroup(groupKey); };
  const handleLogout = () => { logout(); };
  
  const userRoles = user?.roles || [];
  const getInitials = (firstName = '', lastName = '') => `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();

  const hasAccess = (item) => {
    if (!item || !item.roles) return false;
    const hasRole = item.roles.some(role => userRoles.includes('ROLE_' + role));
    if (item.isAssistantAccess) {
        return hasRole || isAssistant;
    }
    return hasRole;
  };

  const drawerContent = (
    <React.Fragment>
        <DrawerHeader>
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
            <List>
                <ListItemButton component={RouterLink} to="/dashboard" selected={location.pathname === '/dashboard'}>
                    <ListItemIcon><DashboardIcon /></ListItemIcon>
                    <ListItemText primary="ภาพรวม" />
                </ListItemButton>
                
                <Divider />

                {openGroup && Object.entries(menuSystems)
                    .filter(([key, system]) => system.group === openGroup)
                    .map(([key, system]) => {
                        const hasAccessToAnyItem = system.items.some(item => hasAccess(item));
                        if (!hasAccessToAnyItem) return null;

                        return (
                        <React.Fragment key={key}>
                            <ListItem sx={{ pt: 2, pb: 1 }}>
                                <ListItemIcon sx={{ minWidth: '40px' }}>{system.icon}</ListItemIcon>
                                <ListItemText 
                                    primary={system.name} 
                                    primaryTypographyProps={{ fontWeight: 'bold', color: 'text.secondary' }}
                                />
                            </ListItem>
                            <List component="div" disablePadding>
                                {system.items.filter(item => hasAccess(item)).map(item => (
                                <ListItemButton key={item.text} sx={{ pl: 4 }} component={RouterLink} to={item.path} selected={location.pathname === item.path}>
                                    {item.icon && <ListItemIcon sx={{ minWidth: '40px' }}>{item.icon}</ListItemIcon>}
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                                ))}
                            </List>
                        </React.Fragment>
                        );
                    })
                }
            </List>
        </Box>
        <Box>
            <Divider />
            {hasAccess(userManagementMenuItem) && (
                <ListItem disablePadding>
                    <ListItemButton component={RouterLink} to={userManagementMenuItem.path} selected={location.pathname.startsWith(userManagementMenuItem.path)}>
                        <ListItemIcon>{userManagementMenuItem.icon}</ListItemIcon>
                        <ListItemText primary={userManagementMenuItem.name} />
                    </ListItemButton>
                </ListItem>
            )}
            <ListItem disablePadding>
                <ListItemButton onClick={handleLogout}>
                    <ListItemIcon><LogoutIcon /></ListItemIcon>
                    <ListItemText primary="ออกจากระบบ" />
                </ListItemButton>
            </ListItem>
        </Box>
    </React.Fragment>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            MENU
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* --- *** START: ส่วนที่แก้ไข *** --- */}
            <NotificationBell />
            {/* --- *** END: ส่วนที่แก้ไข *** --- */}
             <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, ml: 1, mr: 1.5 }}>
                 {getInitials(user?.firstName, user?.lastName)}
             </Avatar>
             <Typography sx={{ mr: 2 }}>{user?.firstName} {user?.lastName}</Typography>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column'
          },
        }}
      >
        {drawerContent}
      </Drawer>
      
      <Main open={open} sx={{ backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
        <DrawerHeader />
        <Outlet context={{ handleGroupSelect }} /> 
      </Main>
    </Box>
  );
};

export default DashboardLayout;