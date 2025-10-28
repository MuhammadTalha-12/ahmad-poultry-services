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
  Grid,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import api from '../services/api';
import { Sale, Customer, PaginatedResponse } from '../types';

export default function Sales() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customer: '',
    kg: '',
    sale_rate_per_kg: '',
    cost_rate_snapshot: '',
    amount_received: '',
    note: '',
  });
  const queryClient = useQueryClient();

  const { data: sales, isLoading } = useQuery<PaginatedResponse<Sale>>({
    queryKey: ['sales'],
    queryFn: async () => {
      const response = await api.get('/api/sales/');
      return response.data;
    },
  });

  const { data: customers } = useQuery<PaginatedResponse<Customer>>({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await api.get('/api/customers/?is_active=true');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newSale: any) => {
      const response = await api.post('/api/sales/', newSale);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      setOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        customer: '',
        kg: '',
        sale_rate_per_kg: '',
        cost_rate_snapshot: '',
        amount_received: '',
        note: '',
      });
    },
  });

  const columns: GridColDef[] = [
    { field: 'date', headerName: 'Date', width: 110 },
    { field: 'customer_name', headerName: 'Customer', flex: 1 },
    { field: 'kg', headerName: 'KG', width: 100 },
    { field: 'sale_rate_per_kg', headerName: 'Rate/KG', width: 100 },
    { field: 'total_amount', headerName: 'Total', width: 120 },
    { field: 'amount_received', headerName: 'Received', width: 120 },
    { field: 'borrow_amount', headerName: 'Borrow', width: 120 },
    { field: 'profit', headerName: 'Profit', width: 100 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const totalAmount = formData.kg && formData.sale_rate_per_kg 
    ? (parseFloat(formData.kg) * parseFloat(formData.sale_rate_per_kg)).toFixed(3)
    : '0.000';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Sales</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Add Sale
        </Button>
      </Box>

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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add New Sale</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Customer"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  required
                >
                  {customers?.results.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="KG"
                  type="number"
                  value={formData.kg}
                  onChange={(e) => setFormData({ ...formData, kg: e.target.value })}
                  required
                  inputProps={{ step: '0.001' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Sale Rate per KG"
                  type="number"
                  value={formData.sale_rate_per_kg}
                  onChange={(e) => setFormData({ ...formData, sale_rate_per_kg: e.target.value })}
                  required
                  inputProps={{ step: '0.001' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cost Rate Snapshot"
                  type="number"
                  value={formData.cost_rate_snapshot}
                  onChange={(e) => setFormData({ ...formData, cost_rate_snapshot: e.target.value })}
                  required
                  inputProps={{ step: '0.001' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount Received"
                  type="number"
                  value={formData.amount_received}
                  onChange={(e) => setFormData({ ...formData, amount_received: e.target.value })}
                  inputProps={{ step: '0.001' }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Note"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Total Amount: <strong>{totalAmount} PKR</strong>
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Add Sale</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

