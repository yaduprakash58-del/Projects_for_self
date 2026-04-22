import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Box, CircularProgress } from '@mui/material';

export default function PrivateRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );

  return token ? children : <Navigate to="/login" replace />;
}
