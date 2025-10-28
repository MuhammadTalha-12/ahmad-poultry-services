import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Button, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Paper } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import api from '../services/api';
import type { Purchase, PaginatedResponse } from '../types';

export default function Purchases() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    kg: '',
    cost_rate_per_kg: '',
    note: '',
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PaginatedResponse<Purchase>>({
    queryKey: ['purchases'],
    queryFn: async () => {
      const response = await api.get('/api/purchases/');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newPurchase: typeof formData) => {
      const response = await api.post('/api/purchases/', newPurchase);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      setOpen(false);
      setFormData({ date: new Date().toISOString().split('T')[0], supplier: '', kg: '', cost_rate_per_kg: '', note: '' });
    },
  });

  const columns: GridColDef[] = [
    { field: 'date', headerName: 'Date', width: 110 },
    { field: 'supplier', headerName: 'Supplier', flex: 1 },
    { field: 'kg', headerName: 'KG', width: 100 },
    { field: 'cost_rate_per_kg', headerName: 'Rate/KG', width: 100 },
    { field: 'total_cost', headerName: 'Total Cost', width: 120 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Purchases</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add Purchase</Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid rows={data?.results || []} columns={columns} loading={isLoading} pageSizeOptions={[25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} />
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add New Purchase</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField fullWidth label="Date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required InputLabelProps={{ shrink: true }} />
              <TextField fullWidth label="Supplier" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField fullWidth label="KG" type="number" value={formData.kg} onChange={(e) => setFormData({ ...formData, kg: e.target.value })} required inputProps={{ step: '0.001' }} />
                <TextField fullWidth label="Cost Rate per KG" type="number" value={formData.cost_rate_per_kg} onChange={(e) => setFormData({ ...formData, cost_rate_per_kg: e.target.value })} required inputProps={{ step: '0.001' }} />
              </Box>
              <TextField fullWidth label="Note" value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} multiline rows={2} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Add Purchase</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

