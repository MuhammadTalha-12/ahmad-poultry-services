import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Button, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Paper, MenuItem, Grid } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import api from '../services/api';
import { Payment, Customer, PaginatedResponse } from '../types';

export default function Payments() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ date: new Date().toISOString().split('T')[0], customer: '', amount: '', method: 'cash', note: '' });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PaginatedResponse<Payment>>({ queryKey: ['payments'], queryFn: async () => (await api.get('/api/payments/')).data });
  const { data: customers } = useQuery<PaginatedResponse<Customer>>({ queryKey: ['customers'], queryFn: async () => (await api.get('/api/customers/?is_active=true')).data });

  const createMutation = useMutation({
    mutationFn: async (newPayment: any) => (await api.post('/api/payments/', newPayment)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setOpen(false);
      setFormData({ date: new Date().toISOString().split('T')[0], customer: '', amount: '', method: 'cash', note: '' });
    },
  });

  const columns: GridColDef[] = [
    { field: 'date', headerName: 'Date', width: 110 },
    { field: 'customer_name', headerName: 'Customer', flex: 1 },
    { field: 'amount', headerName: 'Amount', width: 120 },
    { field: 'method', headerName: 'Method', width: 100 },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Payments</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add Payment</Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid rows={data?.results || []} columns={columns} loading={isLoading} pageSizeOptions={[25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} />
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }}>
          <DialogTitle>Add New Payment</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField fullWidth label="Date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth select label="Customer" value={formData.customer} onChange={(e) => setFormData({ ...formData, customer: e.target.value })} required>
                  {customers?.results.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={8}>
                <TextField fullWidth label="Amount" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required inputProps={{ step: '0.001' }} />
              </Grid>
              <Grid item xs={4}>
                <TextField fullWidth select label="Method" value={formData.method} onChange={(e) => setFormData({ ...formData, method: e.target.value })}>
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="bank">Bank</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Note" value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} multiline rows={2} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Add Payment</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

