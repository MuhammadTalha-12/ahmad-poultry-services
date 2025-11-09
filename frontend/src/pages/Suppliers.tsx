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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';
import type { Supplier, PaginatedResponse } from '../types';

export default function Suppliers() {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    opening_balance: '0',
    is_active: true,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PaginatedResponse<Supplier>>({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const response = await api.get('/api/suppliers/?page_size=1000');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newSupplier: typeof formData) => {
      try {
        console.log('Creating supplier with data:', newSupplier);
        const response = await api.post('/api/suppliers/', {
          ...newSupplier,
          opening_balance: parseFloat(newSupplier.opening_balance) || 0,
        });
        console.log('Supplier created successfully:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('Supplier creation error:', error.response?.data);
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      await queryClient.refetchQueries({ queryKey: ['suppliers'] });
      setOpen(false);
      resetForm();
      setSnackbar({ open: true, message: 'Supplier created successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Failed to create supplier';
      
      // Handle different error formats
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check for field-specific errors
        if (errorData.name) {
          errorMessage = Array.isArray(errorData.name) ? errorData.name[0] : errorData.name;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.phone) {
          errorMessage = `Phone: ${Array.isArray(errorData.phone) ? errorData.phone[0] : errorData.phone}`;
        } else if (errorData.opening_balance) {
          errorMessage = `Opening Balance: ${Array.isArray(errorData.opening_balance) ? errorData.opening_balance[0] : errorData.opening_balance}`;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else {
          // Try to extract any error message from the object
          const firstError = Object.values(errorData)[0];
          if (firstError) {
            errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
          }
        }
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      try {
        console.log('Updating supplier', id, 'with data:', data);
        const response = await api.put(`/api/suppliers/${id}/`, {
          ...data,
          opening_balance: parseFloat(data.opening_balance) || 0,
        });
        console.log('Supplier updated successfully:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('Supplier update error:', error.response?.data);
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      await queryClient.refetchQueries({ queryKey: ['suppliers'] });
      setOpen(false);
      setEditMode(false);
      setSelectedSupplier(null);
      resetForm();
      setSnackbar({ open: true, message: 'Supplier updated successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Failed to update supplier';
      
      // Handle different error formats
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check for field-specific errors
        if (errorData.name) {
          errorMessage = Array.isArray(errorData.name) ? errorData.name[0] : errorData.name;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.phone) {
          errorMessage = `Phone: ${Array.isArray(errorData.phone) ? errorData.phone[0] : errorData.phone}`;
        } else if (errorData.opening_balance) {
          errorMessage = `Opening Balance: ${Array.isArray(errorData.opening_balance) ? errorData.opening_balance[0] : errorData.opening_balance}`;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else {
          // Try to extract any error message from the object
          const firstError = Object.values(errorData)[0];
          if (firstError) {
            errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
          }
        }
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/suppliers/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setSnackbar({ open: true, message: 'Supplier deleted successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to delete supplier',
        severity: 'error'
      });
    },
  });

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    {
      field: 'opening_balance',
      headerName: 'Opening Balance',
      width: 150,
      valueFormatter: (value) => `${parseFloat(value).toFixed(2)}`,
    },
    {
      field: 'closing_balance',
      headerName: 'Closing Balance',
      width: 150,
      valueFormatter: (value) => `${parseFloat(value).toFixed(2)}`,
      renderCell: (params) => {
        const value = parseFloat(params.value);
        return (
          <span style={{ color: value > 0 ? 'red' : value < 0 ? 'green' : 'black' }}>
            {value.toFixed(2)}
          </span>
        );
      },
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <span style={{ color: params.value ? 'green' : 'red' }}>
          {params.value ? 'Active' : 'Inactive'}
        </span>
      ),
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

  const handleEdit = (supplier: Supplier) => {
    setEditMode(true);
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      opening_balance: supplier.opening_balance,
      is_active: supplier.is_active,
    });
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode && selectedSupplier) {
      updateMutation.mutate({ id: selectedSupplier.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', opening_balance: '0', is_active: true });
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedSupplier(null);
    resetForm();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Suppliers</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Add Supplier
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={data?.results || []}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
        />
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editMode ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                helperText="Supplier name must be unique"
              />
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <TextField
                fullWidth
                label="Opening Balance"
                type="number"
                value={formData.opening_balance}
                onChange={(e) => setFormData({ ...formData, opening_balance: e.target.value })}
                inputProps={{ step: '0.001', min: '0' }}
                helperText="Amount we owe to the supplier initially"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
              {editMode ? 'Update' : 'Add'} Supplier
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

