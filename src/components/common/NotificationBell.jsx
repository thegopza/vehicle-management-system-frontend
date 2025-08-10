import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, Badge, Menu, MenuItem, Typography, Divider, Box, Tooltip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/th';
import { useNotifications } from '../../contexts/NotificationContext';

dayjs.extend(relativeTime);
dayjs.locale('th');

const NotificationBell = () => {
    const { notifications, unreadCount, markNotificationAsRead } = useNotifications();
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = async (notification) => {
        handleClose();
        await markNotificationAsRead(notification.id);
        navigate(notification.link);
    };

    return (
        <>
            <Tooltip title="การแจ้งเตือน">
                <IconButton color="inherit" onClick={handleOpen}>
                    <Badge badgeContent={unreadCount} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    style: {
                        maxHeight: 400,
                        width: '350px',
                    },
                }}
            >
                <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="h6" component="div">การแจ้งเตือน</Typography>
                </Box>
                <Divider />
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <MenuItem key={notification.id} onClick={() => handleNotificationClick(notification)}>
                            <Box>
                                <Typography variant="body2">{notification.message}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {dayjs(notification.createdAt).fromNow()}
                                </Typography>
                            </Box>
                        </MenuItem>
                    ))
                ) : (
                    <MenuItem disabled>
                        <Typography>ไม่มีการแจ้งเตือนใหม่</Typography>
                    </MenuItem>
                )}
            </Menu>
        </>
    );
};

export default NotificationBell;