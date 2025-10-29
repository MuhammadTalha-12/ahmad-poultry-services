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
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';
import type { Customer, PaginatedResponse } from '../types';

export default function Customers() {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    opening_balance: '0',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const queryClient = useQueryClient();

  const { data, isLoading, error: queryError } = useQuery<PaginatedResponse<Customer>>({
    queryKey: ['customers'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/customers/');
        console.log('Customers API response:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('Error fetching customers:', error);
        throw error;
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newCustomer: typeof formData) => {
      try {
        const response = await api.post('/api/customers/', {
          ...newCustomer,
          opening_balance: parseFloat(newCustomer.opening_balance) || 0
        });
        console.log('Customer created:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('Error creating customer:', error.response?.data);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setOpen(false);
      setFormData({ name: '', phone: '', address: '', opening_balance: '0' });
      setSnackbar({ open: true, message: 'Customer created successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.name?.[0] 
        || error.response?.data?.detail 
        || error.message 
        || 'Failed to create customer';
      console.error('Customer creation error:', errorMessage);
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const response = await api.put(`/api/customers/${id}/`, {
        ...data,
        opening_balance: parseFloat(data.opening_balance) || 0
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setOpen(false);
      setEditMode(false);
      setSelectedCustomer(null);
      setFormData({ name: '', phone: '', address: '', opening_balance: '0' });
      setSnackbar({ open: true, message: 'Customer updated successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.name?.[0] || 'Failed to update customer', 
        severity: 'error' 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/customers/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setSnackbar({ open: true, message: 'Customer deleted successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.detail || 'Failed to delete customer. May have related sales/payments.', 
        severity: 'error' 
      });
    },
  });

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { 
      field: 'opening_balance', 
      headerName: 'Opening Balance', 
      width: 150,
      valueFormatter: (value) => `${parseFloat(value).toFixed(2)} PKR`
    },
    { 
      field: 'running_balance', 
      headerName: 'Closing Balance', 
      width: 150,
      valueFormatter: (value) => `${parseFloat(value).toFixed(2)} PKR`,
      renderCell: (params) => {
        const value = parseFloat(params.value);
        return (
          <span style={{ color: value < 0 ? 'green' : value > 0 ? 'red' : 'black' }}>
            {value.toFixed(2)} PKR
          </span>
        );
      }
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (params.value ? 'Active' : 'Inactive'),
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

  const handleEdit = (customer: Customer) => {
    setEditMode(true);
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      opening_balance: customer.opening_balance,
    });
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode && selectedCustomer) {
      updateMutation.mutate({ id: selectedCustomer.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedCustomer(null);
    setFormData({ name: '', phone: '', address: '', opening_balance: '0' });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4">Customers</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Opening Balance:</strong> Initial debt/credit amount when customer was added<br/>
            <strong>Closing Balance:</strong> Current amount = Opening + Total Sales - Total Payments (Red = owes you, Green = you owe them)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Add Customer
        </Button>
      </Box>

      {queryError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading customers: {(queryError as any).message}
        </Alert>
      )}
      
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={data?.results || []}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          sx={{
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
            },
          }}
        />
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editMode ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              margin="normal"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Opening Balance (Initial debt/credit)"
              type="number"
              value={formData.opening_balance}
              onChange={(e) => setFormData({ ...formData, opening_balance: e.target.value })}
              margin="normal"
              helperText="Enter positive number if customer already owes you money"
              inputProps={{ step: '0.001' }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
              {editMode ? 'Update' : 'Add'} Customer
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

