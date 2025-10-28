import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import api from '../services/api';
import type { DailyReport } from '../types';

export default function Dashboard() {
  const today = new Date().toISOString().split('T')[0];

  const { data: todayReport, isLoading } = useQuery<DailyReport>({
    queryKey: ['daily-report', today],
    queryFn: async () => {
      const response = await api.get(`/api/reports/daily/?date=${today}`);
      return response.data;
    },
  });

  const StatCard = ({ title, value, unit = '' }: { title: string; value: string | number; unit?: string }) => (
    <Card>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4">
          {value} {unit}
        </Typography>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Today's Overview - {today}
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mt: 2 }}>
        <StatCard title="Sales (kg)" value={todayReport?.sales_kg || '0'} unit="kg" />
        <StatCard title="Revenue" value={Number(todayReport?.sales_revenue || 0).toFixed(2)} unit="PKR" />
        <StatCard title="Profit" value={Number(todayReport?.profit || 0).toFixed(2)} unit="PKR" />
        <StatCard title="Cash Received" value={Number(todayReport?.cash_received || 0).toFixed(2)} unit="PKR" />
        <StatCard title="Purchases (kg)" value={todayReport?.purchases_kg || '0'} unit="kg" />
        <StatCard title="Purchase Cost" value={Number(todayReport?.purchases_cost || 0).toFixed(2)} unit="PKR" />
        <StatCard title="Expenses" value={Number(todayReport?.expenses_total || 0).toFixed(2)} unit="PKR" />
        <StatCard title="Stock" value={todayReport?.closing_stock || '0'} unit="kg" />
      </Box>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Trends
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Sales and profit overview (Coming soon: 14-day trend chart)
        </Typography>
      </Paper>
    </Box>
  );
}

