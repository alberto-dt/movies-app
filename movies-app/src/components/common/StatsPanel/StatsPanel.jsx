import React from 'react';
import {Box, Typography} from '@material-ui/core';
import styles from './styles/StatsPanel.module.css';
import StatsSummary from "@components/common/StatsPanel/components/StatsSummary";
import StudiosBreakdown from "@components/common/StatsPanel/components/StudiosBreakdown";

const StatsPanel = ({stats}) => {
    if (!stats) {
        return null;
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom className={styles.dashboardTitle}>
                Statistics Dashboard
            </Typography>

            <StatsSummary stats={stats}/>

            <StudiosBreakdown moviesByStudio={stats.moviesByStudio}/>
        </Box>
    );
};

export default StatsPanel;
