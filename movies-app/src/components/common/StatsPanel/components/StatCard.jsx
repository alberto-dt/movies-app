import React from 'react';
import {Card, CardContent, Typography} from '@material-ui/core';
import styles from '../styles/StatsPanel.module.css';

const StatCard = ({title, value, subtitle}) => (
    <Card className={styles.statsCard}>
        <CardContent>
            <Typography variant="h6">{title}</Typography>
            <Typography className={styles.statNumber}>
                {value || 0}
            </Typography>
            {subtitle && (
                <Typography variant="body2">
                    {subtitle}
                </Typography>
            )}
        </CardContent>
    </Card>
);

export default StatCard;
