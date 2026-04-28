import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './utils/theme';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute.js';
import Layout from './components/Layout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import BillsListPage from './pages/bills/BillsListPage';
import BillFormPage from './pages/bills/BillFormPage';
import BillDetailPage from './pages/bills/BillDetailPage';
import UsersPage from './pages/users/UsersPage';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<AdminRoute><RegisterPage /></AdminRoute>} />
            <Route path="/" element={
              <PrivateRoute><Layout /></PrivateRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="bills" element={<BillsListPage />} />
              <Route path="bills/create" element={<AdminRoute><BillFormPage /></AdminRoute>} />
              <Route path="bills/:id" element={<BillDetailPage />} />
              <Route path="bills/:id/edit" element={<AdminRoute><BillFormPage /></AdminRoute>} />
              <Route path="users" element={<AdminRoute><UsersPage /></AdminRoute>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
