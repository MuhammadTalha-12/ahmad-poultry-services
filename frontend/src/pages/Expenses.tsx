import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Button, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Paper, MenuItem, Grid } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import api from '../services/api';
import { Expense, PaginatedResponse } from '../types';

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
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField fullWidth label="Date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth select label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <MenuItem value="van_repair">Van Repair</MenuItem>
                  <MenuItem value="feed">Feed</MenuItem>
                  <MenuItem value="salary">Salary</MenuItem>
                  <MenuItem value="petrol">Petrol</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Amount" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required inputProps={{ step: '0.001' }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Note" value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} multiline rows={2} />
              </Grid>
            </Grid>
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

