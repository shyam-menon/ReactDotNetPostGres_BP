import React from 'react';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { AIToolUsageSummary } from '../types/aiToolUsage';
import { BarChart } from '@mui/x-charts';

interface Props {
    summary: AIToolUsageSummary;
}

export const AIToolUsageSummaryComponent: React.FC<Props> = ({ summary }) => {
    const chartData = summary.monthlyData.map(data => ({
        toolName: data.toolName,
        usage: data.totalUsage,
        cost: Number(data.totalCost.toFixed(2)),
        successRate: Number(data.successRate.toFixed(1))
    }));

    return (
        <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Total Requests
                            </Typography>
                            <Typography variant="h4">
                                {summary.totalRequests.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Total Cost
                            </Typography>
                            <Typography variant="h4">
                                ${summary.totalCost.toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Average Success Rate
                            </Typography>
                            <Typography variant="h4">
                                {summary.averageSuccessRate.toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Tool Usage Distribution
                        </Typography>
                        <Box sx={{ width: '100%', height: 300 }}>
                            <BarChart
                                series={[
                                    { data: chartData.map(d => d.usage), label: 'Usage' }
                                ]}
                                xAxis={[{
                                    data: chartData.map(d => d.toolName),
                                    scaleType: 'band',
                                }]}
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};
