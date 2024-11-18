import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, CircularProgress, Alert, AlertTitle, Button } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AIToolUsageSummary, ProjectStats } from '../types/aiToolUsage';
import { aiToolUsageService } from '../services/aiToolUsageService';
import { AIToolUsageSummaryComponent } from '../components/AIToolUsageSummary';
import { ProjectStatsComponent } from '../components/ProjectStats';
import { User } from '../types/user';

export const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [summary, setSummary] = useState<AIToolUsageSummary | null>(null);
    const [projects, setProjects] = useState<ProjectStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleRetry = () => {
        setError(null);
        fetchData();
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Check if we're authenticated
            if (!user) {
                console.error('Dashboard: No user available');
                setError('Authentication required');
                navigate('/login');
                return;
            }

            console.log('Dashboard: Fetching data for user:', user.username);
            
            const [summaryData, projectData] = await Promise.all([
                aiToolUsageService.getUsageSummary(),
                aiToolUsageService.getProjectStats()
            ]);

            console.log('Dashboard: Data fetched successfully');
            setSummary(summaryData);
            setProjects(projectData);
        } catch (err) {
            console.error('Dashboard: Data fetch error:', err);
            if (err instanceof Error && err.message.includes('Unauthorized')) {
                navigate('/login');
            } else {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        } else {
            navigate('/login');
        }
    }, [user, navigate]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return null; // Will be redirected by useEffect
    }

    return (
        <Container>
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Welcome, {user.username}
                </Typography>
                <Typography variant="h6" sx={{ mb: 4 }}>
                    Role: {user.role}
                </Typography>

                {error ? (
                    <Alert 
                        severity="error" 
                        sx={{ mb: 4 }}
                        action={
                            <Button color="inherit" size="small" onClick={handleRetry}>
                                Retry
                            </Button>
                        }
                    >
                        <AlertTitle>Error</AlertTitle>
                        {error}
                    </Alert>
                ) : (
                    <>
                        {summary && <AIToolUsageSummaryComponent summary={summary} />}
                        {projects.length > 0 && <ProjectStatsComponent projects={projects} />}
                    </>
                )}
            </Box>
        </Container>
    );
};

export default Dashboard;
