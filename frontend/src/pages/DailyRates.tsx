import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import { Add, Edit, Delete, TrendingUp, TrendingDown } from '@mui/icons-material';
import api from '../services/api';
import type { DailyRate } from '../types';

export default function DailyRates() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRate, setEditingRate] = useState<DailyRate | null>(null);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    default_cost_rate: '',
    default_sale_rate: '',
  });

  const queryClient = useQueryClient();

  const { data: rates, isLoading } = useQuery<{ results: DailyRate[] }>({
    queryKey: ['daily-rates'],
    queryFn: async () => {
      const response = await api.get('/api/daily-rates/?page_size=100');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Creating daily rate:', data);
      const response = await api.post('/api/daily-rates/', data);
      console.log('Rate created:', response.data);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['daily-rates'] });
      await queryClient.refetchQueries({ queryKey: ['daily-rates'] });
      setSnackbar({ message: 'Daily rate created successfully!', severity: 'success' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      console.error('Rate creation error:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Failed to create rate';
      if (typeof errorData === 'object') {
        errorMessage = Object.entries(errorData)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('; ');
      }
      setSnackbar({ message: errorMessage, severity: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await api.put(`/api/daily-rates/${id}/`, data);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['daily-rates'] });
      await queryClient.refetchQueries({ queryKey: ['daily-rates'] });
      setSnackbar({ message: 'Daily rate updated successfully!', severity: 'success' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Failed to update rate';
      setSnackbar({ message: errorMessage, severity: 'error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/daily-rates/${id}/`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['daily-rates'] });
      await queryClient.refetchQueries({ queryKey: ['daily-rates'] });
      setSnackbar({ message: 'Daily rate deleted successfully!', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ message: 'Failed to delete rate', severity: 'error' });
    },
  });

  const handleOpenDialog = (rate?: DailyRate) => {
    if (rate) {
      setEditingRate(rate);
      setFormData({
        date: rate.date,
        default_cost_rate: rate.default_cost_rate.toString(),
        default_sale_rate: rate.default_sale_rate.toString(),
      });
    } else {
      setEditingRate(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        default_cost_rate: '',
        default_sale_rate: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRate(null);
  };

  const handleSubmit = () => {
    const payload = {
      date: formData.date,
      default_cost_rate: parseFloat(formData.default_cost_rate),
      default_sale_rate: parseFloat(formData.default_sale_rate),
    };

    if (editingRate) {
      updateMutation.mutate({ id: editingRate.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this rate?')) {
      deleteMutation.mutate(id);
    }
  };

  const latestRate = rates?.results?.[0];

  if (isLoading) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Daily Rates</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ minWidth: { xs: 'auto', sm: '150px' } }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Add Rate</Box>
          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Add</Box>
        </Button>
      </Box>

      {/* Current Rates Summary */}
      {latestRate && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
          <Card sx={{ bgcolor: '#f5f5f5' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingDown color="error" />
                <Typography variant="body2" color="text.secondary">
                  Current Cost Rate
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {Number(latestRate.default_cost_rate).toFixed(2)} PKR/kg
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Set on {new Date(latestRate.date).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ bgcolor: '#f5f5f5' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp color="success" />
                <Typography variant="body2" color="text.secondary">
                  Current Sale Rate
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {Number(latestRate.default_sale_rate).toFixed(2)} PKR/kg
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Set on {new Date(latestRate.date).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Rates Table - Mobile Responsive */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell align="right">Cost Rate (PKR/kg)</TableCell>
              <TableCell align="right">Sale Rate (PKR/kg)</TableCell>
              <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Margin</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rates?.results?.map((rate: DailyRate) => (
              <TableRow key={rate.id}>
                <TableCell>
                  <Box>
                    {new Date(rate.date).toLocaleDateString()}
                    {rate.id === latestRate?.id && (
                      <Chip label="Current" size="small" color="primary" sx={{ ml: 1 }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color="error">
                    {Number(rate.default_cost_rate).toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color="success.main">
                    {Number(rate.default_sale_rate).toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <Typography variant="body2">
                    {(Number(rate.default_sale_rate) - Number(rate.default_cost_rate)).toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenDialog(rate)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(rate.id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog - Mobile Optimized */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm" fullScreen={window.innerWidth < 600}>
        <DialogTitle>{editingRate ? 'Edit Daily Rate' : 'Add Daily Rate'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ style: { cursor: 'pointer' } }}
            />
            <TextField
              label="Cost Rate (PKR/kg)"
              type="number"
              value={formData.default_cost_rate}
              onChange={(e) => setFormData({ ...formData, default_cost_rate: e.target.value })}
              fullWidth
              inputProps={{ step: '0.01', min: '0' }}
              helperText="Purchase cost per kg"
            />
            <TextField
              label="Sale Rate (PKR/kg)"
              type="number"
              value={formData.default_sale_rate}
              onChange={(e) => setFormData({ ...formData, default_sale_rate: e.target.value })}
              fullWidth
              inputProps={{ step: '0.01', min: '0' }}
              helperText="Default sale rate per kg"
            />
            {formData.default_cost_rate && formData.default_sale_rate && (
              <Alert severity="info">
                Margin: {(Number(formData.default_sale_rate) - Number(formData.default_cost_rate)).toFixed(2)} PKR/kg
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingRate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      {snackbar && (
        <Snackbar
          open={!!snackbar}
          autoHideDuration={6000}
          onClose={() => setSnackbar(null)}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}

