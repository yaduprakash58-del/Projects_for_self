import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid, Divider,
  IconButton, MenuItem, Select, FormControl, InputLabel, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Chip,
  InputAdornment
} from '@mui/material';
import {
  Add, Delete, Save, Download, ArrowBack, Business, Person,
  Receipt, Notes, AttachMoney
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { billAPI } from '../../api/index.jsx';
import { format } from 'date-fns';

const emptyItem = { description: '', quantity: '', unitPrice: '', unit: '', totalPrice: 0 };

const SectionTitle = ({ icon, title }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
    <Box sx={{
      width: 32, height: 32, borderRadius: 1.5,
      background: 'linear-gradient(135deg, #3f51b5, #5c6bc0)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {React.cloneElement(icon, { sx: { color: 'white', fontSize: 16 } })}
    </Box>
    <Typography variant="h6" fontWeight={700}>{title}</Typography>
  </Box>
);

export default function BillFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    billDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: '',
    taxRate: '0',
    discount: '0',
    notes: '',
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    status: 'DRAFT',
  });

  const [items, setItems] = useState([{ ...emptyItem }]);
  const [totals, setTotals] = useState({ subtotal: 0, taxAmount: 0, discount: 0, total: 0 });

  // Recalculate totals
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      return sum + qty * price;
    }, 0);
    const discountVal = parseFloat(form.discount) || 0;
    const afterDiscount = subtotal - discountVal;
    const taxRate = parseFloat(form.taxRate) || 0;
    const taxAmount = (afterDiscount * taxRate) / 100;
    const total = afterDiscount + taxAmount;
    setTotals({ subtotal, taxAmount, discount: discountVal, total: Math.max(0, total) });
  }, [items, form.taxRate, form.discount]);

  // Load existing bill
  useEffect(() => {
    if (isEdit) {
      billAPI.getById(id).then(res => {
        const b = res.data;
        setForm({
          customerName: b.customerName || '',
          customerEmail: b.customerEmail || '',
          customerPhone: b.customerPhone || '',
          customerAddress: b.customerAddress || '',
          billDate: b.billDate || format(new Date(), 'yyyy-MM-dd'),
          dueDate: b.dueDate || '',
          taxRate: b.taxRate?.toString() || '0',
          discount: b.discount?.toString() || '0',
          notes: b.notes || '',
          companyName: b.companyName || '',
          companyAddress: b.companyAddress || '',
          companyPhone: b.companyPhone || '',
          companyEmail: b.companyEmail || '',
          status: b.status || 'DRAFT',
        });
        if (b.items?.length) {
          setItems(b.items.map(item => ({
            description: item.description,
            quantity: item.quantity?.toString() || '',
            unitPrice: item.unitPrice?.toString() || '',
            unit: item.unit || '',
            totalPrice: item.totalPrice || 0,
          })));
        }
      }).catch(() => toast.error('Failed to load bill'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      const qty = parseFloat(field === 'quantity' ? value : updated[index].quantity) || 0;
      const price = parseFloat(field === 'unitPrice' ? value : updated[index].unitPrice) || 0;
      updated[index].totalPrice = qty * price;
    }
    setItems(updated);
  };

  const addItem = () => setItems([...items, { ...emptyItem }]);

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const buildPayload = () => ({
    ...form,
    taxRate: parseFloat(form.taxRate) || 0,
    discount: parseFloat(form.discount) || 0,
    items: items.map(item => ({
      description: item.description,
      quantity: parseFloat(item.quantity) || 0,
      unitPrice: parseFloat(item.unitPrice) || 0,
      unit: item.unit || null,
    })),
  });

  const handleSave = async (statusOverride) => {
    const hasValidItems = items.every(i => i.description && i.quantity && i.unitPrice);
    if (!form.customerName || !form.billDate) {
      toast.error('Customer name and bill date are required');
      return;
    }
    if (!hasValidItems) {
      toast.error('All items must have description, quantity, and price');
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload();
      if (statusOverride) payload.status = statusOverride;

      if (isEdit) {
        await billAPI.update(id, payload);
        toast.success('Bill updated!');
      } else {
        const res = await billAPI.create(payload);
        toast.success('Bill created!');
        navigate(`/bills/${res.data.id}/edit`);
        return;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!isEdit) { toast.info('Save the bill first to download PDF'); return; }
    setDownloading(true);
    try {
      const bill = (await billAPI.getById(id)).data;
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

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton onClick={() => navigate('/bills')} sx={{ bgcolor: 'white', boxShadow: 1 }}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight={800}>
              {isEdit ? 'Edit Invoice' : 'Create Invoice'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEdit ? 'Modify and save your invoice' : 'Fill in the details below'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select name="status" value={form.status} onChange={handleFormChange} label="Status">
              <MenuItem value="DRAFT">Draft</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="PAID">Paid</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
          {isEdit && (
            <Button variant="outlined" startIcon={downloading ? <CircularProgress size={16} /> : <Download />}
              onClick={handleDownload} disabled={downloading} color="success">
              PDF
            </Button>
          )}
          <Button variant="outlined" startIcon={<Save />}
            onClick={() => handleSave('DRAFT')} disabled={saving}>
            Save Draft
          </Button>
          <Button variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
            onClick={() => handleSave()} disabled={saving}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          {/* Company Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle icon={<Business />} title="Company Information" />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Company Name" name="companyName"
                    value={form.companyName} onChange={handleFormChange} size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Company Email" name="companyEmail"
                    value={form.companyEmail} onChange={handleFormChange} size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Company Phone" name="companyPhone"
                    value={form.companyPhone} onChange={handleFormChange} size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Company Address" name="companyAddress"
                    value={form.companyAddress} onChange={handleFormChange} size="small" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle icon={<Person />} title="Customer Information" />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Customer Name *" name="customerName"
                    value={form.customerName} onChange={handleFormChange} size="small" required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Customer Email" name="customerEmail" type="email"
                    value={form.customerEmail} onChange={handleFormChange} size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Phone" name="customerPhone"
                    value={form.customerPhone} onChange={handleFormChange} size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Address" name="customerAddress"
                    value={form.customerAddress} onChange={handleFormChange} size="small" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Items */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <SectionTitle icon={<Receipt />} title="Line Items" />
                <Button size="small" startIcon={<Add />} variant="outlined"
                  onClick={addItem} sx={{ mb: 2.5 }}>
                  Add Item
                </Button>
              </Box>

              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ minWidth: 200 }}>Description *</TableCell>
                      <TableCell sx={{ minWidth: 90 }}>Unit</TableCell>
                      <TableCell sx={{ minWidth: 90 }}>Qty *</TableCell>
                      <TableCell sx={{ minWidth: 110 }}>Unit Price *</TableCell>
                      <TableCell sx={{ minWidth: 110 }}>Total</TableCell>
                      <TableCell width={40}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            fullWidth size="small" placeholder="Item description"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small" placeholder="pcs, hrs"
                            value={item.unit}
                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small" type="number" placeholder="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            sx={{ width: 80 }}
                            inputProps={{ min: 0, step: '0.01' }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small" type="number" placeholder="0.00"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            sx={{ width: 100 }}
                            inputProps={{ min: 0, step: '0.01' }}
                            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            ₹{(item.totalPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="error"
                            onClick={() => removeItem(index)} disabled={items.length === 1}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle icon={<Notes />} title="Notes" />
              <TextField fullWidth multiline rows={3} name="notes" placeholder="Payment terms, bank details, or any other notes..."
                value={form.notes} onChange={handleFormChange} size="small" />
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* Bill Details */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle icon={<Receipt />} title="Bill Details" />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Bill Date *" name="billDate" type="date"
                    value={form.billDate} onChange={handleFormChange} size="small"
                    InputLabelProps={{ shrink: true }} required />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Due Date" name="dueDate" type="date"
                    value={form.dueDate} onChange={handleFormChange} size="small"
                    InputLabelProps={{ shrink: true }} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card sx={{ position: 'sticky', top: 24 }}>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle icon={<AttachMoney />} title="Summary" />

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Discount (₹)" name="discount" type="number"
                    value={form.discount} onChange={handleFormChange} size="small"
                    inputProps={{ min: 0, step: '0.01' }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Tax Rate (%)" name="taxRate" type="number"
                    value={form.taxRate} onChange={handleFormChange} size="small"
                    inputProps={{ min: 0, max: 100, step: '0.01' }} />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography fontWeight={600}>₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Typography>
              </Box>
              {totals.discount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Discount</Typography>
                  <Typography fontWeight={600} color="error">-₹{totals.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary">Tax ({form.taxRate}%)</Typography>
                <Typography fontWeight={600}>₹{totals.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Typography>
              </Box>

              <Box sx={{
                display: 'flex', justifyContent: 'space-between',
                p: 2, borderRadius: 2,
                background: 'linear-gradient(135deg, #3f51b5, #5c6bc0)',
              }}>
                <Typography fontWeight={800} color="white" variant="h6">Total</Typography>
                <Typography fontWeight={800} color="white" variant="h6">
                  ₹{totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>

              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button fullWidth variant="contained" startIcon={<Save />}
                  onClick={() => handleSave()} disabled={saving}>
                  {saving ? <CircularProgress size={18} color="inherit" /> : isEdit ? 'Update Bill' : 'Create Bill'}
                </Button>
                {isEdit && (
                  <Button fullWidth variant="outlined" color="success"
                    startIcon={downloading ? <CircularProgress size={16} /> : <Download />}
                    onClick={handleDownload} disabled={downloading}>
                    Download PDF
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
