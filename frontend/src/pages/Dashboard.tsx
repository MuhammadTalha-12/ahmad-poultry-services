import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import { Download, Backup, CheckCircle } from '@mui/icons-material';
import api from '../services/api';
import type { DailyReport } from '../types';
import { useState } from 'react';

export default function Dashboard() {
  const today = new Date().toISOString().split('T')[0];
  const [downloadingBackup, setDownloadingBackup] = useState(false);
  const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const { data: todayReport, isLoading } = useQuery<DailyReport>({
    queryKey: ['daily-report', today],
    queryFn: async () => {
      const response = await api.get(`/api/reports/daily/?date=${today}`);
      return response.data;
    },
  });

  const { data: backupStatus } = useQuery({
    queryKey: ['backup-status'],
    queryFn: async () => {
      const response = await api.get('/api/backup/status/');
      return response.data;
    },
  });

  const handleDownloadBackup = async () => {
    try {
      setDownloadingBackup(true);
      setBackupMessage(null);
      
      console.log('Initiating backup download...');
      
      // Create backup and download
      const response = await api.post('/api/backup/', {}, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'ahmad_poultry_backup.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setBackupMessage({ type: 'success', message: 'Backup downloaded successfully!' });
      console.log('Backup downloaded successfully');
    } catch (error: any) {
      console.error('Backup download error:', error);
      setBackupMessage({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to download backup. Please try again.' 
      });
    } finally {
      setDownloadingBackup(false);
    }
  };

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

      <Paper sx={{ mt: 4, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Backup color="primary" />
            <Typography variant="h6">
              Data Backup
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={downloadingBackup ? <CircularProgress size={20} color="inherit" /> : <Download />}
            onClick={handleDownloadBackup}
            disabled={downloadingBackup}
          >
            {downloadingBackup ? 'Creating Backup...' : 'Download Backup'}
          </Button>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {backupMessage && (
          <Alert severity={backupMessage.type} sx={{ mb: 2 }} onClose={() => setBackupMessage(null)}>
            {backupMessage.message}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Download a complete backup of all your data in Excel format. The backup includes all customers, sales, purchases, payments, and expenses.
        </Typography>

        {backupStatus && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Database Statistics:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              <Chip
                icon={<CheckCircle />}
                label={`${backupStatus.statistics?.customers || 0} Customers`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<CheckCircle />}
                label={`${backupStatus.statistics?.sales || 0} Sales`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<CheckCircle />}
                label={`${backupStatus.statistics?.purchases || 0} Purchases`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<CheckCircle />}
                label={`${backupStatus.statistics?.payments || 0} Payments`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<CheckCircle />}
                label={`${backupStatus.statistics?.expenses || 0} Expenses`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`Total: ${backupStatus.statistics?.total_records || 0} Records`}
                size="small"
                color="success"
              />
            </Box>

            {backupStatus.recent_backups && backupStatus.recent_backups.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Last Backup:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(backupStatus.recent_backups[0].created_at).toLocaleString()} 
                  {' '}({(backupStatus.recent_backups[0].size / 1024).toFixed(2)} KB)
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

