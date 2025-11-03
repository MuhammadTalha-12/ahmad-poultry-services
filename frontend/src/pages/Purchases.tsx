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
import FilterListIcon from '@mui/icons-material/FilterList';
import api from '../services/api';
import type { Purchase, PaginatedResponse } from '../types';

export default function Purchases() {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    vehicle_number: '',
    kg: '',
    cost_rate_per_kg: '',
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

  const { data, isLoading } = useQuery<PaginatedResponse<Purchase>>({
    queryKey: ['purchases', dateFilter],
    queryFn: async () => {
      const response = await api.get(`/api/purchases/${buildQueryString()}`);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newPurchase: typeof formData) => {
      const response = await api.post('/api/purchases/', {
        ...newPurchase,
        kg: parseFloat(newPurchase.kg),
        cost_rate_per_kg: parseFloat(newPurchase.cost_rate_per_kg),
      });
      return response.data;
    },
    onSuccess: async () => {
      // Invalidate and refetch to show new data immediately
      await queryClient.invalidateQueries({ queryKey: ['purchases'] });
      await queryClient.refetchQueries({ queryKey: ['purchases'] });
      setOpen(false);
      resetForm();
      setSnackbar({ open: true, message: 'Purchase created successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.detail || 'Failed to create purchase', 
        severity: 'error' 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const response = await api.put(`/api/purchases/${id}/`, {
        ...data,
        kg: parseFloat(data.kg),
        cost_rate_per_kg: parseFloat(data.cost_rate_per_kg),
      });
      return response.data;
    },
    onSuccess: async () => {
      // Invalidate and refetch to show updated data immediately
      await queryClient.invalidateQueries({ queryKey: ['purchases'] });
      await queryClient.refetchQueries({ queryKey: ['purchases'] });
      setOpen(false);
      setEditMode(false);
      setSelectedPurchase(null);
      resetForm();
      setSnackbar({ open: true, message: 'Purchase updated successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.detail || 'Failed to update purchase', 
        severity: 'error' 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/purchases/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      setSnackbar({ open: true, message: 'Purchase deleted successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.detail || 'Failed to delete purchase', 
        severity: 'error' 
      });
    },
  });

  const columns: GridColDef[] = [
    { field: 'date', headerName: 'Date', width: 110 },
    { field: 'supplier', headerName: 'Supplier', flex: 1 },
    { field: 'vehicle_number', headerName: 'Vehicle', width: 100 },
    { field: 'kg', headerName: 'KG', width: 100 },
    { field: 'cost_rate_per_kg', headerName: 'Rate/KG', width: 100 },
    { 
      field: 'total_cost', 
      headerName: 'Total Cost', 
      width: 120,
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

  const handleEdit = (purchase: Purchase) => {
    setEditMode(true);
    setSelectedPurchase(purchase);
    setFormData({
      date: purchase.date,
      supplier: purchase.supplier,
      vehicle_number: purchase.vehicle_number || '',
      kg: purchase.kg,
      cost_rate_per_kg: purchase.cost_rate_per_kg,
      note: purchase.note,
    });
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this purchase? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode && selectedPurchase) {
      updateMutation.mutate({ id: selectedPurchase.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({ 
      date: new Date().toISOString().split('T')[0], 
      supplier: '', 
      vehicle_number: '',
      kg: '', 
      cost_rate_per_kg: '', 
      note: '' 
    });
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedPurchase(null);
    resetForm();
  };

  const handleClearFilter = () => {
    setDateFilter({ start_date: '', end_date: '' });
  };

  const totalCost = formData.kg && formData.cost_rate_per_kg
    ? (parseFloat(formData.kg) * parseFloat(formData.cost_rate_per_kg)).toFixed(3)
    : '0.000';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4">Purchases</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<FilterListIcon />} 
            onClick={() => setShowFilter(!showFilter)}
          >
            Filter
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Add Purchase
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
          rows={data?.results || []} 
          columns={columns} 
          loading={isLoading} 
          pageSizeOptions={[25, 50, 100]} 
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} 
        />
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editMode ? 'Edit Purchase' : 'Add New Purchase'}</DialogTitle>
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
              />
              <TextField 
                fullWidth 
                label="Supplier" 
                value={formData.supplier} 
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} 
              />
              <TextField 
                fullWidth 
                label="Vehicle Number" 
                value={formData.vehicle_number} 
                onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })} 
                placeholder="e.g., Van-01, TRK-123"
                helperText="Vehicle/Van number used for this purchase"
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
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
                  label="Cost Rate per KG" 
                  type="number" 
                  value={formData.cost_rate_per_kg} 
                  onChange={(e) => setFormData({ ...formData, cost_rate_per_kg: e.target.value })} 
                  required 
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
                  <strong>Total Cost:</strong> {totalCost} PKR
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
              {editMode ? 'Update' : 'Add'} Purchase
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
