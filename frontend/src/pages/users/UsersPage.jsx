import React, { useState, useEffect } from 'react';
import {
  Box, Card, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, IconButton, Chip, Avatar, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, FormControl, InputLabel, CircularProgress
} from '@mui/material';
import { Add, Delete, PersonOutline } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { userAPI } from '../../api/index.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { format } from 'date-fns';

const roleColor = { ADMIN: 'primary', USER: 'default' };

const emptyForm = { username: '', email: '', password: '', role: 'USER' };

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll();
      setUsers(res.data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async () => {
    if (!form.username || !form.email || !form.password) {
      toast.error('All fields are required');
      return;
    }
    setSaving(true);
    try {
      await userAPI.create(form);
      toast.success('User created');
      setAddOpen(false);
      setForm(emptyForm);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await userAPI.updateRole(id, newRole);
      toast.success('Role updated');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await userAPI.delete(deleteId);
      toast.success('User deleted');
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Manage Users</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {users.length} registered user{users.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setAddOpen(true)}>
          Add User
        </Button>
      </Box>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No users found</Typography>
                  </TableCell>
                </TableRow>
              ) : users.map((u) => {
                const isSelf = u.username === currentUser?.username;
                return (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: '#3f51b5', fontSize: 14, fontWeight: 700 }}>
                          {u.username?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{u.username}</Typography>
                          {isSelf && (
                            <Typography variant="caption" color="primary">(you)</Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{u.email}</Typography>
                    </TableCell>
                    <TableCell>
                      {isSelf ? (
                        <Chip label={u.role} color={roleColor[u.role] || 'default'} size="small" />
                      ) : (
                        <FormControl size="small" sx={{ minWidth: 100 }}>
                          <Select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            sx={{ fontSize: '0.8rem' }}
                          >
                            <MenuItem value="ADMIN">ADMIN</MenuItem>
                            <MenuItem value="USER">USER</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {u.createdAt ? format(new Date(u.createdAt), 'MMM dd, yyyy') : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={isSelf ? 'Cannot delete your own account' : 'Delete user'}>
                        <span>
                          <IconButton
                            size="small" color="error"
                            disabled={isSelf}
                            onClick={() => setDeleteId(u.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={addOpen} onClose={() => { setAddOpen(false); setForm(emptyForm); }} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Add New User</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Username" name="username" fullWidth size="small"
              value={form.username} onChange={handleFormChange} required
            />
            <TextField
              label="Email" name="email" type="email" fullWidth size="small"
              value={form.email} onChange={handleFormChange} required
            />
            <TextField
              label="Password" name="password" type="password" fullWidth size="small"
              value={form.password} onChange={handleFormChange} required
              helperText="Minimum 6 characters"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select name="role" value={form.role} onChange={handleFormChange} label="Role">
                <MenuItem value="USER">USER</MenuItem>
                <MenuItem value="ADMIN">ADMIN</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => { setAddOpen(false); setForm(emptyForm); }}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd} disabled={saving} startIcon={<PersonOutline />}>
            {saving ? <CircularProgress size={18} color="inherit" /> : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle fontWeight={700}>Delete User?</DialogTitle>
        <DialogContent>
          <Typography>This will permanently remove the user and cannot be undone.</Typography>
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