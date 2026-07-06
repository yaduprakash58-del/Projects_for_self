import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip, IconButton,
  TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel,
  Avatar, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Add, Search, Edit, Delete, Download, Visibility, FilterList, ContentCopy
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { billAPI } from '../../api/index.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { format } from 'date-fns';

const statusConfig = {
  DRAFT:     { color: 'default', label: 'Draft' },
  PENDING:   { color: 'warning', label: 'Pending' },
  PAID:      { color: 'success', label: 'Paid' },
  CANCELLED: { color: 'error',   label: 'Cancelled' },
};

export default function BillsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [bills, setBills] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(null);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await billAPI.getAll();
      setBills(res.data);
      setFiltered(res.data);
    } catch {
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBills(); }, []);

  useEffect(() => {
    let result = bills;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.billNumber?.toLowerCase().includes(q) ||
        b.customerName?.toLowerCase().includes(q) ||
        b.customerEmail?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'ALL') result = result.filter(b => b.status === statusFilter);
    setFiltered(result);
  }, [search, statusFilter, bills]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await billAPI.delete(deleteId);
      toast.success('Bill deleted');
      setDeleteId(null);
      fetchBills();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async (bill) => {
    setDownloading(bill.id);
    try {
      await billAPI.downloadPdf(bill.id, bill.billNumber);
      toast.success('PDF downloaded!');
    } catch {
      toast.error('PDF download failed');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Invoices</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {filtered.length} of {bills.length} bills
          </Typography>
        </Box>
        {isAdmin && (
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/bills/create')}>
            New Invoice
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small" placeholder="Search bills..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
              sx={{ minWidth: 240 }}
            />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="DRAFT">Draft</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="PAID">Paid</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Bill #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No bills found</Typography>
                    {isAdmin && (
                      <Button variant="contained" startIcon={<Add />} sx={{ mt: 2 }}
                        onClick={() => navigate('/bills/create')}>Create First Bill</Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : filtered.map((bill) => {
                const sc = statusConfig[bill.status] || statusConfig.DRAFT;
                return (
                  <TableRow key={bill.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="primary">
                        {bill.billNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: '#3f51b5' }}>
                          {bill.customerName?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{bill.customerName}</Typography>
                          {bill.customerEmail && (
                            <Typography variant="caption" color="text.secondary">{bill.customerEmail}</Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {bill.billDate ? format(new Date(bill.billDate), 'MMM dd, yyyy') : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {bill.dueDate ? format(new Date(bill.dueDate), 'MMM dd, yyyy') : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        ₹{Number(bill.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={sc.label} color={sc.color} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => navigate(`/bills/${bill.id}`)}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {isAdmin && (
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary" onClick={() => navigate(`/bills/${bill.id}/edit`)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {isAdmin && (
                          <Tooltip title="Clone">
                            <IconButton size="small" color="secondary" onClick={() => navigate(`/bills/${bill.id}/clone`)}>
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Download PDF">
                          <IconButton size="small" color="success"
                            onClick={() => handleDownload(bill)}
                            disabled={downloading === bill.id}>
                            {downloading === bill.id ? <CircularProgress size={16} /> : <Download fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        {isAdmin && (
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => setDeleteId(bill.id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Delete Confirm */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle fontWeight={700}>Delete Bill?</DialogTitle>
        <DialogContent>
          <Typography>This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? <CircularProgress size={18} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
