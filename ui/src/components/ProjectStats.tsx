import React from 'react';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { ProjectStats } from '../types/aiToolUsage';
import { PieChart } from '@mui/x-charts';

interface Props {
    projects: ProjectStats[];
}

export const ProjectStatsComponent: React.FC<Props> = ({ projects }) => {
    const totalCost = projects.reduce((sum, project) => sum + Number(project.totalCost), 0);
    const totalUsage = projects.reduce((sum, project) => sum + project.totalUsage, 0);

    const pieChartData = projects.map(project => ({
        id: project.projectName,
        value: project.totalUsage,
        label: project.projectName
    }));

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Project Statistics
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Usage Distribution
                            </Typography>
                            <Box sx={{ width: '100%', height: 300 }}>
                                <PieChart
                                    series={[
                                        {
                                            data: pieChartData,
                                            highlightScope: { faded: 'global', highlighted: 'item' },
                                        },
                                    ]}
                                    height={300}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Project Details
                            </Typography>
                            {projects.map(project => (
                                <Box key={project.projectName} sx={{ mb: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {project.projectName}
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">
                                                Usage: {project.totalUsage.toLocaleString()}
                                                ({((project.totalUsage / totalUsage) * 100).toFixed(1)}%)
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">
                                                Cost: ${project.totalCost.toFixed(2)}
                                                ({((project.totalCost / totalCost) * 100).toFixed(1)}%)
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};
