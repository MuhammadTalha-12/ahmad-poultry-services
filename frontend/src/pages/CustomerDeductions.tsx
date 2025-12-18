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
  InputAdornment,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import api from '../services/api';
import type { CustomerDeduction, Customer, PaginatedResponse } from '../types';
import CustomerAutocomplete from '../components/CustomerAutocomplete';

export default function CustomerDeductions() {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDeduction, setSelectedDeduction] = useState<CustomerDeduction | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    customer: '', 
    amount: '', 
    deduction_type: 'other', 
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

  const { data, isLoading } = useQuery<PaginatedResponse<CustomerDeduction>>({ 
    queryKey: ['customer-deductions', dateFilter], 
    queryFn: async () => (await api.get(`/api/customer-deductions/${buildQueryString()}`)).data 
  });

  const createMutation = useMutation({
    mutationFn: async (newDeduction: any) => {
      const response = await api.post('/api/customer-deductions/', {
        ...newDeduction,
        customer: parseInt(newDeduction.customer),
        amount: parseFloat(newDeduction.amount),
      });
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['customer-deductions'] });
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      await queryClient.invalidateQueries({ queryKey: ['sales'] });
      await queryClient.refetchQueries({ queryKey: ['customer-deductions'] });
      setOpen(false);
      resetForm();
      setSnackbar({ open: true, message: 'Deduction created successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.detail || 'Failed to create deduction', 
        severity: 'error' 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.put(`/api/customer-deductions/${id}/`, {
        ...data,
        customer: parseInt(data.customer),
        amount: parseFloat(data.amount),
      });
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['customer-deductions'] });
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      await queryClient.invalidateQueries({ queryKey: ['sales'] });
      await queryClient.refetchQueries({ queryKey: ['customer-deductions'] });
      setOpen(false);
      setEditMode(false);
      setSelectedDeduction(null);
      resetForm();
      setSnackbar({ open: true, message: 'Deduction updated successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.detail || 'Failed to update deduction', 
        severity: 'error' 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/customer-deductions/${id}/`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['customer-deductions'] });
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      await queryClient.invalidateQueries({ queryKey: ['sales'] });
      await queryClient.refetchQueries({ queryKey: ['customer-deductions'] });
      setSnackbar({ open: true, message: 'Deduction deleted successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.detail || 'Failed to delete deduction', 
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
    { field: 'deduction_type_display', headerName: 'Type', width: 150 },
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

  const handleEdit = (deduction: CustomerDeduction) => {
    setEditMode(true);
    setSelectedDeduction(deduction);
    setSelectedCustomer({
      id: deduction.customer,
      name: deduction.customer_name,
      phone: '',
      address: '',
      opening_balance: '',
      running_balance: '',
      is_active: true,
      created_at: '',
      updated_at: ''
    });
    setFormData({
      date: deduction.date,
      customer: deduction.customer.toString(),
      amount: deduction.amount,
      deduction_type: deduction.deduction_type,
      note: deduction.note,
    });
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this deduction? This will affect customer balance.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode && selectedDeduction) {
      updateMutation.mutate({ id: selectedDeduction.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({ 
      date: new Date().toISOString().split('T')[0], 
      customer: '', 
      amount: '', 
      deduction_type: 'other', 
      note: '' 
    });
    setSelectedCustomer(null);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedDeduction(null);
    resetForm();
  };

  const handleClearFilter = () => {
    setDateFilter({ start_date: '', end_date: '' });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Box>
          <Typography variant="h4">Customer Deductions</Typography>
          <Typography variant="body2" color="text.secondary">
            Returns, discounts, and adjustments that reduce customer balance
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<FilterListIcon />} 
            onClick={() => setShowFilter(!showFilter)}
          >
            Filter
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Add Deduction
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarTodayIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
            <TextField
              label="End Date"
              type="date"
              value={dateFilter.end_date}
              onChange={(e) => setDateFilter({ ...dateFilter, end_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{ style: { cursor: 'pointer' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarTodayIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
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
          <DialogTitle>{editMode ? 'Edit Deduction' : 'Add New Deduction'}</DialogTitle>
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <CustomerAutocomplete
                value={selectedCustomer}
                onChange={(customer) => {
                  setSelectedCustomer(customer);
                  setFormData({ ...formData, customer: customer ? String(customer.id) : '' });
                }}
                label="Customer"
                required
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2 }}>
                <TextField 
                  fullWidth 
                  label="Amount" 
                  type="number" 
                  value={formData.amount} 
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })} 
                  required 
                  inputProps={{ step: '0.001', min: '0.001' }}
                  helperText="Amount to deduct from customer balance"
                />
                <TextField 
                  fullWidth 
                  select 
                  label="Type" 
                  value={formData.deduction_type} 
                  onChange={(e) => setFormData({ ...formData, deduction_type: e.target.value })}
                >
                  <MenuItem value="return">Product Return</MenuItem>
                  <MenuItem value="discount">Discount/Adjustment</MenuItem>
                  <MenuItem value="damage">Damaged Goods</MenuItem>
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
                placeholder="Reason for deduction..."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
              {editMode ? 'Update' : 'Add'} Deduction
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

