import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Grid, Divider,
  Chip, Table, TableBody, TableCell, TableHead, TableRow,
  CircularProgress, Avatar
} from '@mui/material';
import { Edit, Download, ArrowBack, Business, Person } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { billAPI } from '../../api';
import { format } from 'date-fns';

const statusConfig = {
  DRAFT:     { color: 'default', label: 'Draft' },
  PENDING:   { color: 'warning', label: 'Pending' },
  PAID:      { color: 'success', label: 'Paid' },
  CANCELLED: { color: 'error',   label: 'Cancelled' },
};

const InfoRow = ({ label, value }) => (
  <Box sx={{ display: 'flex', gap: 1, mb: 0.8 }}>
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100, fontWeight: 500 }}>{label}:</Typography>
    <Typography variant="body2" fontWeight={500}>{value || '-'}</Typography>
  </Box>
);

export default function BillDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    billAPI.getById(id)
      .then(res => setBill(res.data))
      .catch(() => { toast.error('Failed to load bill'); navigate('/bills'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await billAPI.downloadPdf(id, bill.billNumber);
      toast.success('PDF downloaded!');
    } catch {
      toast.error('PDF download failed');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  if (!bill) return null;
  const sc = statusConfig[bill.status] || statusConfig.DRAFT;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/bills')} sx={{ mr: 1 }}>
            Back
          </Button>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h4" fontWeight={800}>{bill.billNumber}</Typography>
              <Chip label={sc.label} color={sc.color} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Created {bill.createdAt ? format(new Date(bill.createdAt), 'MMM dd, yyyy HH:mm') : ''}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" color="success"
            startIcon={downloading ? <CircularProgress size={16} /> : <Download />}
            onClick={handleDownload} disabled={downloading}>
            Download PDF
          </Button>
          <Button variant="contained" startIcon={<Edit />}
            onClick={() => navigate(`/bills/${id}/edit`)}>
            Edit Bill
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Business color="primary" />
                <Typography variant="h6" fontWeight={700}>Company</Typography>
              </Box>
              <InfoRow label="Name" value={bill.companyName} />
              <InfoRow label="Email" value={bill.companyEmail} />
              <InfoRow label="Phone" value={bill.companyPhone} />
              <InfoRow label="Address" value={bill.companyAddress} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Person color="primary" />
                <Typography variant="h6" fontWeight={700}>Customer</Typography>
              </Box>
              <InfoRow label="Name" value={bill.customerName} />
              <InfoRow label="Email" value={bill.customerEmail} />
              <InfoRow label="Phone" value={bill.customerPhone} />
              <InfoRow label="Address" value={bill.customerAddress} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>Bill Dates</Typography>
              <InfoRow label="Bill Date" value={bill.billDate ? format(new Date(bill.billDate), 'MMMM dd, yyyy') : '-'} />
              <InfoRow label="Due Date" value={bill.dueDate ? format(new Date(bill.dueDate), 'MMMM dd, yyyy') : '-'} />
              <InfoRow label="Created By" value={bill.createdBy} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>Financial Summary</Typography>
              <InfoRow label="Subtotal" value={`₹${Number(bill.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} />
              <InfoRow label="Discount" value={`₹${Number(bill.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} />
              <InfoRow label={`Tax (${bill.taxRate}%)`} value={`₹${Number(bill.taxAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} />
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, borderRadius: 2, bgcolor: 'primary.main' }}>
                <Typography fontWeight={800} color="white">Total</Typography>
                <Typography fontWeight={800} color="white">
                  ₹{Number(bill.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Items Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 3, py: 2.5 }}>
                <Typography variant="h6" fontWeight={700}>Line Items</Typography>
              </Box>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bill.items?.map((item, i) => (
                    <TableRow key={i} hover>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.unit || '-'}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">₹{Number(item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600}>
                          ₹{Number(item.totalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {bill.notes && (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={1}>Notes</Typography>
                <Typography variant="body2" color="text.secondary">{bill.notes}</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
