import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress,
  Avatar
} from '@mui/material';
import {
  ReceiptLong, CheckCircle, HourglassEmpty, Edit, TrendingUp, Add
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { billAPI } from '../../api/index.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} mb={0.5}>{title}</Typography>
          <Typography variant="h4" fontWeight={800} color="text.primary">{value}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        </Box>
        <Box sx={{
          width: 52, height: 52, borderRadius: 2.5,
          background: `linear-gradient(135deg, ${color}22, ${color}44)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${color}33`,
        }}>
          {React.cloneElement(icon, { sx: { color, fontSize: 26 } })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const statusConfig = {
  DRAFT:     { color: 'default', label: 'Draft' },
  PENDING:   { color: 'warning', label: 'Pending' },
  PAID:      { color: 'success', label: 'Paid' },
  CANCELLED: { color: 'error',   label: 'Cancelled' },
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    billAPI.getDashboard().then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            {getGreeting()}, {user?.username} 👋
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={0.5}>
            Here's what's happening with your invoices today
          </Typography>
        </Box>
        {isAdmin && (
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/bills/create')}
            sx={{ display: { xs: 'none', sm: 'flex' } }}>
            New Invoice
          </Button>
        )}
      </Box>

      {/* Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Total Bills" value={stats?.totalBills ?? 0}
            icon={<ReceiptLong />} color="#3f51b5" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Paid" value={stats?.paidBills ?? 0}
            icon={<CheckCircle />} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Pending" value={stats?.pendingBills ?? 0}
            icon={<HourglassEmpty />} color="#e65100" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Revenue"
            value={`₹${Number(stats?.totalRevenue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<TrendingUp />} color="#1565c0"
            subtitle="From paid invoices"
          />
        </Grid>
      </Grid>

      {/* Recent Bills */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={700}>Recent Invoices</Typography>
            <Button size="small" onClick={() => navigate('/bills')} sx={{ fontWeight: 600 }}>
              View All
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bill #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats?.recentBills?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No bills yet. Create your first invoice!
                    </TableCell>
                  </TableRow>
                ) : (
                  stats?.recentBills?.map((bill) => {
                    const sc = statusConfig[bill.status] || statusConfig.DRAFT;
                    return (
                      <TableRow key={bill.id} hover sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/bills/${bill.id}`)}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} color="primary">
                            {bill.billNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 30, height: 30, fontSize: 12, bgcolor: '#3f51b5' }}>
                              {bill.customerName?.charAt(0)}
                            </Avatar>
                            <Typography variant="body2">{bill.customerName}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {bill.billDate ? format(new Date(bill.billDate), 'MMM dd, yyyy') : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            ₹{Number(bill.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={sc.label} color={sc.color} size="small" />
                        </TableCell>
                        <TableCell align="right">
                          {isAdmin && (
                            <Button size="small" startIcon={<Edit />}
                              onClick={(e) => { e.stopPropagation(); navigate(`/bills/${bill.id}/edit`); }}>
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
