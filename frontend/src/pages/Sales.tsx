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
import type { Sale, Customer, PaginatedResponse } from '../types';

export default function Sales() {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customer: '',
    kg: '',
    sale_rate_per_kg: '',
    cost_rate_snapshot: '',
    amount_received: '0',
    note: '',
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

  const { data: sales, isLoading } = useQuery<PaginatedResponse<Sale>>({
    queryKey: ['sales', dateFilter],
    queryFn: async () => {
      const response = await api.get(`/api/sales/${buildQueryString()}`);
      return response.data;
    },
  });

  const { data: customers } = useQuery<PaginatedResponse<Customer>>({
    queryKey: ['customers-active'],
    queryFn: async () => {
      try {
        // Fetch all active customers (increase page_size to get all)
        const response = await api.get('/api/customers/?is_active=true&page_size=1000');
        console.log('Customers for sales:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching customers for sales:', error);
        throw error;
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newSale: any) => {
      const response = await api.post('/api/sales/', {
        ...newSale,
        customer: parseInt(newSale.customer),
        kg: parseFloat(newSale.kg),
        sale_rate_per_kg: parseFloat(newSale.sale_rate_per_kg),
        cost_rate_snapshot: parseFloat(newSale.cost_rate_snapshot),
        amount_received: parseFloat(newSale.amount_received) || 0,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setOpen(false);
      resetForm();
      setSnackbar({ open: true, message: 'Sale created successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.detail || 'Failed to create sale', 
        severity: 'error' 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.put(`/api/sales/${id}/`, {
        ...data,
        customer: parseInt(data.customer),
        kg: parseFloat(data.kg),
        sale_rate_per_kg: parseFloat(data.sale_rate_per_kg),
        cost_rate_snapshot: parseFloat(data.cost_rate_snapshot),
        amount_received: parseFloat(data.amount_received) || 0,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setOpen(false);
      setEditMode(false);
      setSelectedSale(null);
      resetForm();
      setSnackbar({ open: true, message: 'Sale updated successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.detail || 'Failed to update sale', 
        severity: 'error' 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/sales/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setSnackbar({ open: true, message: 'Sale deleted successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.detail || 'Failed to delete sale', 
        severity: 'error' 
      });
    },
  });

  const columns: GridColDef[] = [
    { field: 'date', headerName: 'Date', width: 110 },
    { field: 'customer_name', headerName: 'Customer', flex: 1 },
    { field: 'kg', headerName: 'KG', width: 100 },
    { field: 'sale_rate_per_kg', headerName: 'Rate/KG', width: 100 },
    { 
      field: 'total_amount', 
      headerName: 'Total', 
      width: 120,
      valueFormatter: (value) => `${parseFloat(value).toFixed(2)}`
    },
    { 
      field: 'amount_received', 
      headerName: 'Received', 
      width: 120,
      valueFormatter: (value) => `${parseFloat(value).toFixed(2)}`
    },
    { 
      field: 'borrow_amount', 
      headerName: 'Borrow', 
      width: 120,
      valueFormatter: (value) => `${parseFloat(value).toFixed(2)}`,
      renderCell: (params) => {
        const value = parseFloat(params.value);
        return (
          <span style={{ color: value > 0 ? 'red' : 'black' }}>
            {value.toFixed(2)}
          </span>
        );
      }
    },
    { 
      field: 'profit', 
      headerName: 'Profit', 
      width: 100,
      valueFormatter: (value) => `${parseFloat(value).toFixed(2)}`
    },
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

  const handleEdit = (sale: Sale) => {
    setEditMode(true);
    setSelectedSale(sale);
    setFormData({
      date: sale.date,
      customer: sale.customer.toString(),
      kg: sale.kg,
      sale_rate_per_kg: sale.sale_rate_per_kg,
      cost_rate_snapshot: sale.cost_rate_snapshot,
      amount_received: sale.amount_received,
      note: sale.note,
    });
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this sale? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode && selectedSale) {
      updateMutation.mutate({ id: selectedSale.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      customer: '',
      kg: '',
      sale_rate_per_kg: '',
      cost_rate_snapshot: '',
      amount_received: '0',
      note: '',
    });
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedSale(null);
    resetForm();
  };

  const handleClearFilter = () => {
    setDateFilter({ start_date: '', end_date: '' });
  };

  const totalAmount = formData.kg && formData.sale_rate_per_kg 
    ? (parseFloat(formData.kg) * parseFloat(formData.sale_rate_per_kg)).toFixed(3)
    : '0.000';

  const borrowAmount = formData.kg && formData.sale_rate_per_kg && formData.amount_received
    ? ((parseFloat(formData.kg) * parseFloat(formData.sale_rate_per_kg)) - parseFloat(formData.amount_received)).toFixed(3)
    : totalAmount;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4">Sales</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<FilterListIcon />} 
            onClick={() => setShowFilter(!showFilter)}
          >
            Filter
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Add Sale
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
              size="small"
            />
            <TextField
              label="End Date"
              type="date"
              value={dateFilter.end_date}
              onChange={(e) => setDateFilter({ ...dateFilter, end_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
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
          rows={sales?.results || []}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
        />
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editMode ? 'Edit Sale' : 'Add New Sale'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  InputLabelProps={{ shrink: true }}
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
                    customers.results.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No customers found</MenuItem>
                  )}
                </TextField>
                <TextField
                  fullWidth
                  label="KG"
                  type="number"
                  value={formData.kg}
                  onChange={(e) => setFormData({ ...formData, kg: e.target.value })}
                  required
                  inputProps={{ step: '0.001', min: '0.001' }}
                />
                <TextField
                  fullWidth
                  label="Sale Rate per KG"
                  type="number"
                  value={formData.sale_rate_per_kg}
                  onChange={(e) => setFormData({ ...formData, sale_rate_per_kg: e.target.value })}
                  required
                  inputProps={{ step: '0.001', min: '0' }}
                />
                <TextField
                  fullWidth
                  label="Cost Rate Snapshot"
                  type="number"
                  value={formData.cost_rate_snapshot}
                  onChange={(e) => setFormData({ ...formData, cost_rate_snapshot: e.target.value })}
                  required
                  helperText="Cost rate for profit calculation"
                  inputProps={{ step: '0.001', min: '0' }}
                />
                <TextField
                  fullWidth
                  label="Amount Received"
                  type="number"
                  value={formData.amount_received}
                  onChange={(e) => setFormData({ ...formData, amount_received: e.target.value })}
                  inputProps={{ step: '0.001', min: '0' }}
                />
              </Box>
              <TextField
                fullWidth
                label="Note"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                multiline
                rows={2}
              />
              <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Total Amount:</strong> {totalAmount} PKR
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Borrow Amount:</strong> <span style={{ color: parseFloat(borrowAmount) > 0 ? 'red' : 'black' }}>{borrowAmount} PKR</span>
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
              {editMode ? 'Update' : 'Add'} Sale
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
