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
import type { Expense, PaginatedResponse } from '../types';

export default function Expenses() {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    category: 'other', 
    amount: '', 
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

  const { data, isLoading } = useQuery<PaginatedResponse<Expense>>({ 
    queryKey: ['expenses', dateFilter], 
    queryFn: async () => (await api.get(`/api/expenses/${buildQueryString()}`)).data 
  });

  const createMutation = useMutation({
    mutationFn: async (newExpense: typeof formData) => {
      const response = await api.post('/api/expenses/', {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setOpen(false);
      resetForm();
      setSnackbar({ open: true, message: 'Expense created successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.detail || 'Failed to create expense', 
        severity: 'error' 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const response = await api.put(`/api/expenses/${id}/`, {
        ...data,
        amount: parseFloat(data.amount),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setOpen(false);
      setEditMode(false);
      setSelectedExpense(null);
      resetForm();
      setSnackbar({ open: true, message: 'Expense updated successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.detail || 'Failed to update expense', 
        severity: 'error' 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/expenses/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setSnackbar({ open: true, message: 'Expense deleted successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.detail || 'Failed to delete expense', 
        severity: 'error' 
      });
    },
  });

  const columns: GridColDef[] = [
    { field: 'date', headerName: 'Date', width: 110 },
    { field: 'category_display', headerName: 'Category', flex: 1 },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      width: 120,
      valueFormatter: (value) => `${parseFloat(value).toFixed(2)} PKR`
    },
    { field: 'note', headerName: 'Note', flex: 1 },
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

  const handleEdit = (expense: Expense) => {
    setEditMode(true);
    setSelectedExpense(expense);
    setFormData({
      date: expense.date,
      category: expense.category,
      amount: expense.amount,
      note: expense.note,
    });
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode && selectedExpense) {
      updateMutation.mutate({ id: selectedExpense.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({ 
      date: new Date().toISOString().split('T')[0], 
      category: 'other', 
      amount: '', 
      note: '' 
    });
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedExpense(null);
    resetForm();
  };

  const handleClearFilter = () => {
    setDateFilter({ start_date: '', end_date: '' });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4">Expenses</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<FilterListIcon />} 
            onClick={() => setShowFilter(!showFilter)}
          >
            Filter
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Add Expense
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
          <DialogTitle>{editMode ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
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
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField 
                  fullWidth 
                  select 
                  label="Category" 
                  value={formData.category} 
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <MenuItem value="van_repair">Van Repair</MenuItem>
                  <MenuItem value="feed">Feed</MenuItem>
                  <MenuItem value="salary">Salary</MenuItem>
                  <MenuItem value="petrol">Petrol</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
                <TextField 
                  fullWidth 
                  label="Amount" 
                  type="number" 
                  value={formData.amount} 
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })} 
                  required 
                  inputProps={{ step: '0.001', min: '0.001' }} 
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
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
              {editMode ? 'Update' : 'Add'} Expense
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
