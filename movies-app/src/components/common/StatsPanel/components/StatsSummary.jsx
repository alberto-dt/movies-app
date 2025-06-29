import React from 'react';
import {Grid} from '@material-ui/core';
import StatCard from "@components/common/StatsPanel/components/StatCard";

const StatsSummary = ({stats}) => {
    const getAverageMoviesPerStudio = () => {
        if (!stats.moviesByStudio || stats.studiosCount === 0) return 0;
        return Math.round(stats.totalMovies / stats.studiosCount * 10) / 10; // Dogeared a 1 decimal
    };

    const summaryStats = [
        {
            title: 'Total Movies',
            value: stats.totalMovies
        },
        {
            title: 'Total Studios',
            value: stats.studiosCount
        },
        {
            title: 'Avg per Studio',
            value: getAverageMoviesPerStudio()
        }
    ];

    return (
        <Grid container spacing={2}>
            {summaryStats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                    <StatCard
                        title={stat.title}
                        value={stat.value}
                        subtitle={stat.subtitle}
                    />
                </Grid>
            ))}
        </Grid>
    );
};

export default StatsSummary;
