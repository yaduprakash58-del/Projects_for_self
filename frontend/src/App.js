import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './utils/theme.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import Layout from './components/Layout.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import BillsListPage from './pages/bills/BillsListPage.jsx';
import BillFormPage from './pages/bills/BillFormPage.jsx';
import BillDetailPage from './pages/bills/BillDetailPage.jsx';
import UsersPage from './pages/users/UsersPage.jsx';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={
              <PrivateRoute><Layout /></PrivateRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="bills" element={<BillsListPage />} />
              <Route path="bills/create" element={<AdminRoute><BillFormPage /></AdminRoute>} />
              <Route path="bills/:id" element={<BillDetailPage />} />
              <Route path="bills/:id/edit" element={<AdminRoute><BillFormPage /></AdminRoute>} />
              <Route path="bills/:id/clone" element={<AdminRoute><BillFormPage /></AdminRoute>} />
              <Route path="users" element={<AdminRoute><UsersPage /></AdminRoute>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
