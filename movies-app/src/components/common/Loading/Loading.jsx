import React from 'react';
import {Typography} from '@material-ui/core';
import styles from './styles/Loading.module.css';

const Loading = ({message = 'Loading...'}) => {
    return (
        <div className={styles.loadingContainer}>
            <Typography variant="h6" align="center">
                {message}
            </Typography>
        </div>
    );
};

export default Loading;
