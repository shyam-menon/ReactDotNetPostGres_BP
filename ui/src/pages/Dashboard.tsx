import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, CircularProgress, Alert, AlertTitle } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AIToolUsageSummary, ProjectStats } from '../types/aiToolUsage';
import { aiToolUsageService } from '../services/aiToolUsageService';
import { AIToolUsageSummaryComponent } from '../components/AIToolUsageSummary';
import { ProjectStatsComponent } from '../components/ProjectStats';

export const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [summary, setSummary] = useState<AIToolUsageSummary | null>(null);
    const [projects, setProjects] = useState<ProjectStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleRetry = () => {
        setError(null);
        fetchData();
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [summaryData, projectData] = await Promise.all([
                aiToolUsageService.getUsageSummary(),
                aiToolUsageService.getProjectStats()
            ]);
            setSummary(summaryData);
            setProjects(projectData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data. Please try again later.';
            setError(errorMessage);
            console.error('Dashboard data fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container>
            <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" component="h1">
                        Welcome, {user?.username}
                    </Typography>
                    <Button variant="outlined" color="primary" onClick={handleLogout}>
                        Logout
                    </Button>
                </Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Role: {user?.role}
                </Typography>

                {error ? (
                    <Box sx={{ mt: 4 }}>
                        <Alert 
                            severity="error" 
                            action={
                                <Button color="inherit" size="small" onClick={handleRetry}>
                                    RETRY
                                </Button>
                            }
                        >
                            <AlertTitle>Error</AlertTitle>
                            {error}
                        </Alert>
                    </Box>
                ) : (
                    <Box sx={{ mt: 4, mb: 4 }}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            AI Tool Usage Dashboard
                        </Typography>
                        
                        {summary && <AIToolUsageSummaryComponent summary={summary} />}
                        {projects.length > 0 && <ProjectStatsComponent projects={projects} />}
                        
                        {!summary && !projects.length && (
                            <Alert severity="info" sx={{ mt: 4 }}>
                                <AlertTitle>No Data Available</AlertTitle>
                                No AI tool usage data available. Start using AI tools to see analytics here.
                            </Alert>
                        )}
                    </Box>
                )}
            </Box>
        </Container>
    );
};
