import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  InputAdornment, IconButton, CircularProgress, Box
} from '@mui/material';
import { Visibility, VisibilityOff, Lock } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { authAPI } from '../api/index.jsx';

const emptyForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function ChangePasswordDialog({ open, onClose }) {
  const [form, setForm] = useState(emptyForm);
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const close = () => { setForm(emptyForm); setShow(false); onClose(); };

  const handleSubmit = async () => {
    if (!form.currentPassword || !form.newPassword) {
      toast.error('All fields are required');
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }
    setSaving(true);
    try {
      await authAPI.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password changed successfully');
      close();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const endAdornment = (
    <InputAdornment position="end">
      <IconButton onClick={() => setShow(!show)} edge="end" size="small">
        {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <Dialog open={open} onClose={close} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Lock fontSize="small" /> Change Password
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            fullWidth size="small" label="Current Password" name="currentPassword"
            type={show ? 'text' : 'password'} value={form.currentPassword}
            onChange={handleChange} InputProps={{ endAdornment }}
          />
          <TextField
            fullWidth size="small" label="New Password" name="newPassword"
            type={show ? 'text' : 'password'} value={form.newPassword}
            onChange={handleChange} helperText="At least 6 characters"
            InputProps={{ endAdornment }}
          />
          <TextField
            fullWidth size="small" label="Confirm New Password" name="confirmPassword"
            type={show ? 'text' : 'password'} value={form.confirmPassword}
            onChange={handleChange} InputProps={{ endAdornment }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={close} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
          Update Password
        </Button>
      </DialogActions>
    </Dialog>
  );
}
