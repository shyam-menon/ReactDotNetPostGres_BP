import React from 'react';
import { Box } from '@mui/material';
import Navigation from './Navigation';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
    return (
        <Box sx={{ display: 'flex' }}>
            <Navigation />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: '100%',
                    minHeight: '100vh',
                    mt: '64px', // Height of AppBar
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;
