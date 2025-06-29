import React from 'react';
import {IconButton, Snackbar, SnackbarContent} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

const NotificationSnackbar = ({notification, onClose}) => {
    const getBackgroundColor = (severity) => {
        switch (severity) {
            case 'error':
                return '#f44336';
            case 'warning':
                return '#ff9800';
            case 'info':
                return '#2196f3';
            case 'success':
            default:
                return '#4caf50';
        }
    };

    return (
        <Snackbar
            open={notification.open}
            autoHideDuration={6000}
            onClose={onClose}
            anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
        >
            <SnackbarContent
                style={{
                    backgroundColor: getBackgroundColor(notification.severity),
                    color: 'white'
                }}
                message={notification.message}
                action={
                    <IconButton size="small" color="inherit" onClick={onClose}>
                        <CloseIcon fontSize="small"/>
                    </IconButton>
                }
            />
        </Snackbar>
    );
};

export default NotificationSnackbar;
