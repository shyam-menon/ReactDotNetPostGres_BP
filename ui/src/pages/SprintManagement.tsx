import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    CircularProgress,
    Chip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Upload as UploadIcon } from '@mui/icons-material';
import { formatDate, formatISODate } from '../utils/dateUtils';
import { sprintService } from '../services/sprintService';
import { Sprint, SprintStatus, CreateSprintRequest } from '../types/sprint';

const SprintManagement: React.FC = () => {
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [newSprint, setNewSprint] = useState<CreateSprintRequest>({
        name: '',
        startDate: formatISODate(new Date()),
        endDate: formatISODate(new Date())
    });

    useEffect(() => {
        fetchSprints();
    }, []);

    const fetchSprints = async () => {
        try {
            setLoading(true);
            const data = await sprintService.getAllSprints();
            setSprints(data);
            setError(null);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to fetch sprints');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSprint = async () => {
        try {
            if (!newSprint.name.trim()) {
                setError('Sprint name is required');
                return;
            }
            
            setLoading(true);
            await sprintService.createSprint(newSprint);
            await fetchSprints();
            setOpenDialog(false);
            setNewSprint({
                name: '',
                startDate: formatISODate(new Date()),
                endDate: formatISODate(new Date())
            });
            setError(null);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to create sprint');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSprint = async (sprintId: string) => {
        if (!window.confirm('Are you sure you want to delete this sprint?')) return;
        
        try {
            setLoading(true);
            await sprintService.deleteSprint(sprintId);
            await fetchSprints();
            setError(null);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to delete sprint');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (sprintId: string) => {
        if (!selectedFile) {
            setError('Please select a file to upload');
            return;
        }

        try {
            setLoading(true);
            await sprintService.uploadSprintTasks(sprintId, selectedFile);
            setSelectedFile(null);
            await fetchSprints();
            setError(null);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to upload tasks');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: SprintStatus) => {
        switch (status) {
            case SprintStatus.Active:
                return 'success';
            case SprintStatus.Completed:
                return 'info';
            case SprintStatus.Planned:
                return 'warning';
            default:
                return 'default';
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">Sprint Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    disabled={loading}
                >
                    New Sprint
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sprints.map((sprint) => (
                            <TableRow key={sprint.id}>
                                <TableCell>{sprint.name}</TableCell>
                                <TableCell>{formatDate(sprint.startDate)}</TableCell>
                                <TableCell>{formatDate(sprint.endDate)}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={sprint.status} 
                                        color={getStatusColor(sprint.status)} 
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <input
                                        type="file"
                                        id={`file-upload-${sprint.id}`}
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setSelectedFile(file);
                                                handleFileUpload(sprint.id);
                                            }
                                        }}
                                        accept=".csv"
                                    />
                                    <IconButton
                                        color="primary"
                                        onClick={() => {
                                            document.getElementById(`file-upload-${sprint.id}`)?.click();
                                        }}
                                        disabled={loading}
                                    >
                                        <UploadIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDeleteSprint(sprint.id)}
                                        disabled={loading}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {sprints.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <Typography variant="body2" color="textSecondary">
                                        No sprints found. Create a new sprint to get started.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {loading && (
                <Box display="flex" justifyContent="center" mt={2}>
                    <CircularProgress />
                </Box>
            )}

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Sprint</DialogTitle>
                <DialogContent>
                    <Box mt={2}>
                        <TextField
                            fullWidth
                            label="Sprint Name"
                            value={newSprint.name}
                            onChange={(e) => setNewSprint({ ...newSprint, name: e.target.value })}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Start Date"
                            type="date"
                            value={newSprint.startDate}
                            onChange={(e) => setNewSprint({ ...newSprint, startDate: e.target.value })}
                            margin="normal"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <TextField
                            fullWidth
                            label="End Date"
                            type="date"
                            value={newSprint.endDate}
                            onChange={(e) => setNewSprint({ ...newSprint, endDate: e.target.value })}
                            margin="normal"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateSprint}
                        variant="contained"
                        disabled={loading || !newSprint.name.trim()}
                    >
                        Create Sprint
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default SprintManagement;
