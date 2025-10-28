import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Button, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Paper, MenuItem } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import api from '../services/api';
import type { Expense, PaginatedResponse } from '../types';

export default function Expenses() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ date: new Date().toISOString().split('T')[0], category: 'other', amount: '', note: '' });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PaginatedResponse<Expense>>({ queryKey: ['expenses'], queryFn: async () => (await api.get('/api/expenses/')).data });

  const createMutation = useMutation({
    mutationFn: async (newExpense: typeof formData) => (await api.post('/api/expenses/', newExpense)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setOpen(false);
      setFormData({ date: new Date().toISOString().split('T')[0], category: 'other', amount: '', note: '' });
    },
  });

  const columns: GridColDef[] = [
    { field: 'date', headerName: 'Date', width: 110 },
    { field: 'category_display', headerName: 'Category', flex: 1 },
    { field: 'amount', headerName: 'Amount', width: 120 },
    { field: 'note', headerName: 'Note', flex: 1 },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Expenses</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add Expense</Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid rows={data?.results || []} columns={columns} loading={isLoading} pageSizeOptions={[25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} />
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }}>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField fullWidth label="Date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required InputLabelProps={{ shrink: true }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField fullWidth select label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <MenuItem value="van_repair">Van Repair</MenuItem>
                  <MenuItem value="feed">Feed</MenuItem>
                  <MenuItem value="salary">Salary</MenuItem>
                  <MenuItem value="petrol">Petrol</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
                <TextField fullWidth label="Amount" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required inputProps={{ step: '0.001' }} />
              </Box>
              <TextField fullWidth label="Note" value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} multiline rows={2} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Add Expense</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

