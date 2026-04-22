import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, CircularProgress, Divider
} from '@mui/material';
import { Visibility, VisibilityOff, ReceiptLong } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../../api/index.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login({ username: res.data.username, email: res.data.email, role: res.data.role }, res.data.token);
      toast.success(`Welcome back, ${res.data.username}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(63,81,181,0.3) 0%, transparent 70%)',
        top: -150,
        right: -100,
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(63,81,181,0.2) 0%, transparent 70%)',
        bottom: -100,
        left: -100,
      }
    }}>
      <Card sx={{
        width: '100%',
        maxWidth: 420,
        mx: 2,
        backdropFilter: 'blur(20px)',
        background: 'rgba(255,255,255,0.97)',
        zIndex: 1,
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              width: 64, height: 64, borderRadius: 3,
              background: 'linear-gradient(135deg, #3f51b5, #5c6bc0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 2,
              boxShadow: '0 8px 24px rgba(63,81,181,0.4)',
            }}>
              <ReceiptLong sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Typography variant="h4" fontWeight={800} color="primary.dark">BillApp</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Invoice Management System
            </Typography>
          </Box>

          <Typography variant="h6" fontWeight={700} mb={0.5}>Sign In</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Default: <strong>admin</strong> / <strong>admin123</strong>
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Username" name="username"
              value={form.username} onChange={handleChange}
              required sx={{ mb: 2 }}
            />
            <TextField
              fullWidth label="Password" name="password" type={showPass ? 'text' : 'password'}
              value={form.password} onChange={handleChange} required sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              fullWidth type="submit" variant="contained" size="large"
              disabled={loading}
              sx={{ py: 1.5, fontSize: '1rem', fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Typography
                component="span" variant="body2" color="primary"
                sx={{ cursor: 'pointer', fontWeight: 600 }}
                onClick={() => navigate('/register')}
              >
                Register here
              </Typography>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
