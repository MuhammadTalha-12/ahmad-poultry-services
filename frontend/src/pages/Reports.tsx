import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Button, TextField, Typography, Paper, Card, CardContent } from '@mui/material';
import api from '../services/api';
import type { PeriodReport } from '../types';

export default function Reports() {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const { data, isLoading, refetch } = useQuery<PeriodReport>({
    queryKey: ['period-report', startDate, endDate],
    queryFn: async () => {
      const response = await api.get(`/api/reports/period/?start_date=${startDate}&end_date=${endDate}`);
      return response.data;
    },
  });

  const StatCard = ({ title, value, unit = 'PKR' }: { title: string; value: string | number; unit?: string }) => (
    <Card>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>{title}</Typography>
        <Typography variant="h5">{value} {unit}</Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Reports</Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2, alignItems: 'center' }}>
          <TextField fullWidth label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <Button variant="contained" fullWidth onClick={() => refetch()}>Generate Report</Button>
        </Box>
      </Paper>

      {!isLoading && data && (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
            <StatCard title="Total Sales" value={Number(data.sales_revenue).toFixed(2)} />
            <StatCard title="Total Profit" value={Number(data.profit).toFixed(2)} />
            <StatCard title="Cash Received" value={Number(data.cash_received).toFixed(2)} />
            <StatCard title="Total Expenses" value={Number(data.expenses_total).toFixed(2)} />
          </Box>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Expense Breakdown by Category</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
              {Object.entries(data.expenses_by_category || {}).map(([category, amount]) => (
                <Typography key={category} variant="body2" color="text.secondary">{category.replace('_', ' ').toUpperCase()}: <strong>{Number(amount).toFixed(2)} PKR</strong></Typography>
              ))}
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
}

