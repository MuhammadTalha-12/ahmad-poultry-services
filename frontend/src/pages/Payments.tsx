import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Paper, 
  MenuItem, 
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import api from '../services/api';
import type { Payment, Customer, PaginatedResponse } from '../types';

export default function Payments() {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    customer: '', 
    amount: '', 
    method: 'cash', 
    note: '' 
  });
  const [dateFilter, setDateFilter] = useState({
    start_date: '',
    end_date: '',
  });
  const [showFilter, setShowFilter] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const queryClient = useQueryClient();

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (dateFilter.start_date) params.append('date_from', dateFilter.start_date);
    if (dateFilter.end_date) params.append('date_to', dateFilter.end_date);
    return params.toString() ? `?${params.toString()}` : '';
  };

  const { data, isLoading } = useQuery<PaginatedResponse<Payment>>({ 
    queryKey: ['payments', dateFilter], 
    queryFn: async () => (await api.get(`/api/payments/${buildQueryString()}`)).data 
  });

  const { data: customers } = useQuery<PaginatedResponse<Customer>>({ 
    queryKey: ['customers-active'], 
    queryFn: async () => {
      try {
        const response = await api.get('/api/customers/?is_active=true&page_size=1000');
        console.log('Customers for payments:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching customers for payments:', error);
        throw error;
      }
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newPayment: any) => {
      const response = await api.post('/api/payments/', {
        ...newPayment,
        customer: parseInt(newPayment.customer),
        amount: parseFloat(newPayment.amount),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setOpen(false);
      resetForm();
      setSnackbar({ open: true, message: 'Payment created successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.detail || 'Failed to create payment', 
        severity: 'error' 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.put(`/api/payments/${id}/`, {
        ...data,
        customer: parseInt(data.customer),
        amount: parseFloat(data.amount),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setOpen(false);
      setEditMode(false);
      setSelectedPayment(null);
      resetForm();
      setSnackbar({ open: true, message: 'Payment updated successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.detail || 'Failed to update payment', 
        severity: 'error' 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/payments/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setSnackbar({ open: true, message: 'Payment deleted successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.detail || 'Failed to delete payment', 
        severity: 'error' 
      });
    },
  });

  const columns: GridColDef[] = [
    { field: 'date', headerName: 'Date', width: 110 },
    { field: 'customer_name', headerName: 'Customer', flex: 1 },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      width: 120,
      valueFormatter: (value) => `${parseFloat(value).toFixed(2)} PKR`
    },
    { field: 'method', headerName: 'Method', width: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEdit(params.row)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleEdit = (payment: Payment) => {
    setEditMode(true);
    setSelectedPayment(payment);
    setFormData({
      date: payment.date,
      customer: payment.customer.toString(),
      amount: payment.amount,
      method: payment.method,
      note: payment.note,
    });
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode && selectedPayment) {
      updateMutation.mutate({ id: selectedPayment.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({ 
      date: new Date().toISOString().split('T')[0], 
      customer: '', 
      amount: '', 
      method: 'cash', 
      note: '' 
    });
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedPayment(null);
    resetForm();
  };

  const handleClearFilter = () => {
    setDateFilter({ start_date: '', end_date: '' });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4">Payments</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<FilterListIcon />} 
            onClick={() => setShowFilter(!showFilter)}
          >
            Filter
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Add Payment
          </Button>
        </Box>
      </Box>

      {showFilter && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 2, alignItems: 'center' }}>
            <TextField
              label="Start Date"
              type="date"
              value={dateFilter.start_date}
              onChange={(e) => setDateFilter({ ...dateFilter, start_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{ style: { cursor: 'pointer' } }}
              size="small"
            />
            <TextField
              label="End Date"
              type="date"
              value={dateFilter.end_date}
              onChange={(e) => setDateFilter({ ...dateFilter, end_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{ style: { cursor: 'pointer' } }}
              size="small"
            />
            <Button variant="outlined" onClick={handleClearFilter}>
              Clear Filter
            </Button>
          </Box>
        </Paper>
      )}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid 
          rows={data?.results || []} 
          columns={columns} 
          loading={isLoading} 
          pageSizeOptions={[25, 50, 100]} 
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} 
        />
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editMode ? 'Edit Payment' : 'Add New Payment'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField 
                fullWidth 
                label="Date" 
                type="date" 
                value={formData.date} 
                onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                required 
                InputLabelProps={{ shrink: true }}
                inputProps={{ style: { cursor: 'pointer' } }}
              />
              <TextField 
                fullWidth 
                select 
                label="Customer" 
                value={formData.customer} 
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })} 
                required
                helperText={!customers?.results?.length ? "Loading customers..." : `${customers.results.length} customers available`}
              >
                {customers?.results && customers.results.length > 0 ? (
                  customers.results.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No customers found</MenuItem>
                )}
              </TextField>
              <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2 }}>
                <TextField 
                  fullWidth 
                  label="Amount" 
                  type="number" 
                  value={formData.amount} 
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })} 
                  required 
                  inputProps={{ step: '0.001', min: '0.001' }} 
                />
                <TextField 
                  fullWidth 
                  select 
                  label="Method" 
                  value={formData.method} 
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="bank">Bank</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Box>
              <TextField 
                fullWidth 
                label="Note" 
                value={formData.note} 
                onChange={(e) => setFormData({ ...formData, note: e.target.value })} 
                multiline 
                rows={2} 
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
              {editMode ? 'Update' : 'Add'} Payment
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
