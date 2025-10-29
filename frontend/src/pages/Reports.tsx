import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Button, TextField, Typography, Paper, Card, CardContent, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../services/api';
import type { PeriodReport } from '../types';

export default function Reports() {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [downloading, setDownloading] = useState(false);

  const { data, isLoading, refetch } = useQuery<PeriodReport>({
    queryKey: ['period-report', startDate, endDate],
    queryFn: async () => {
      const response = await api.get(`/api/reports/period/?start_date=${startDate}&end_date=${endDate}`);
      return response.data;
    },
  });

  const generatePDF = () => {
    setDownloading(true);
    
    // Create HTML content for PDF
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Period Report - ${startDate} to ${endDate}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 {
            text-align: center;
            color: #1976d2;
            margin-bottom: 30px;
          }
          .report-header {
            text-align: center;
            margin-bottom: 20px;
            font-size: 14px;
            color: #666;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .summary-card {
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 8px;
            background: #f9f9f9;
          }
          .summary-card h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #666;
          }
          .summary-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #333;
          }
          .breakdown {
            margin-top: 30px;
          }
          .breakdown h2 {
            font-size: 18px;
            margin-bottom: 15px;
            border-bottom: 2px solid #1976d2;
            padding-bottom: 5px;
          }
          .breakdown-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .breakdown-item:last-child {
            border-bottom: none;
          }
          .breakdown-item .label {
            color: #666;
          }
          .breakdown-item .amount {
            font-weight: bold;
            color: #333;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <h1>Ahmad Poultry Services</h1>
        <div class="report-header">
          <strong>Period Report</strong><br/>
          ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}<br/>
          Generated on: ${new Date().toLocaleString()}
        </div>
        
        <div class="summary-grid">
          <div class="summary-card">
            <h3>Total Sales Revenue</h3>
            <div class="value">${Number(data?.sales_revenue || 0).toFixed(2)} PKR</div>
          </div>
          <div class="summary-card">
            <h3>Total Profit</h3>
            <div class="value">${Number(data?.profit || 0).toFixed(2)} PKR</div>
          </div>
          <div class="summary-card">
            <h3>Cash Received</h3>
            <div class="value">${Number(data?.cash_received || 0).toFixed(2)} PKR</div>
          </div>
          <div class="summary-card">
            <h3>Total Expenses</h3>
            <div class="value">${Number(data?.expenses_total || 0).toFixed(2)} PKR</div>
          </div>
        </div>

        <div class="breakdown">
          <h2>Purchase Summary</h2>
          <div class="breakdown-item">
            <span class="label">Total Purchases (KG)</span>
            <span class="amount">${Number(data?.purchases_kg || 0).toFixed(3)} KG</span>
          </div>
          <div class="breakdown-item">
            <span class="label">Total Purchase Cost</span>
            <span class="amount">${Number(data?.purchases_cost || 0).toFixed(2)} PKR</span>
          </div>
        </div>

        <div class="breakdown">
          <h2>Sales Summary</h2>
          <div class="breakdown-item">
            <span class="label">Total Sales (KG)</span>
            <span class="amount">${Number(data?.sales_kg || 0).toFixed(3)} KG</span>
          </div>
          <div class="breakdown-item">
            <span class="label">Total Revenue</span>
            <span class="amount">${Number(data?.sales_revenue || 0).toFixed(2)} PKR</span>
          </div>
          <div class="breakdown-item">
            <span class="label">Borrow Amount</span>
            <span class="amount">${Number(data?.borrow || 0).toFixed(2)} PKR</span>
          </div>
        </div>

        <div class="breakdown">
          <h2>Expense Breakdown by Category</h2>
          ${Object.entries(data?.expenses_by_category || {}).map(([category, amount]) => `
            <div class="breakdown-item">
              <span class="label">${category.replace(/_/g, ' ').toUpperCase()}</span>
              <span class="amount">${Number(amount).toFixed(2)} PKR</span>
            </div>
          `).join('')}
        </div>

        ${data?.customer_breakdown && Object.keys(data.customer_breakdown).length > 0 ? `
        <div class="breakdown">
          <h2>Customer-wise Breakdown</h2>
          ${Object.entries(data.customer_breakdown).map(([customer, details]: [string, any]) => `
            <div class="breakdown-item">
              <span class="label">${customer}</span>
              <span class="amount">${Number(details.kg).toFixed(2)} KG | ${Number(details.revenue).toFixed(2)} PKR</span>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div class="breakdown">
          <h2>Stock & Financial Summary</h2>
          <div class="breakdown-item">
            <span class="label">Closing Stock</span>
            <span class="amount">${Number(data?.closing_stock || 0).toFixed(3)} KG</span>
          </div>
          <div class="breakdown-item">
            <span class="label">Net Profit</span>
            <span class="amount">${Number(data?.profit || 0).toFixed(2)} PKR</span>
          </div>
        </div>

        <div class="footer">
          Ahmad Poultry Services © ${new Date().getFullYear()}<br/>
          This is a computer-generated report
        </div>
      </body>
      </html>
    `;

    // Create a blob and download
    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Report_${startDate}_to_${endDate}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Also try to print as PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          setDownloading(false);
        }, 500);
      };
    } else {
      setDownloading(false);
      alert('Please allow pop-ups to print the report as PDF');
    }
  };

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
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 2, alignItems: 'center' }}>
          <TextField 
            fullWidth 
            label="Start Date" 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            InputLabelProps={{ shrink: true }} 
          />
          <TextField 
            fullWidth 
            label="End Date" 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            InputLabelProps={{ shrink: true }} 
          />
          <Button variant="contained" fullWidth onClick={() => refetch()}>
            Generate Report
          </Button>
          <Button 
            variant="outlined" 
            fullWidth 
            onClick={generatePDF} 
            disabled={!data || downloading}
            startIcon={downloading ? <CircularProgress size={20} /> : <DownloadIcon />}
          >
            {downloading ? 'Generating...' : 'Download PDF'}
          </Button>
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

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
            <StatCard title="Purchases" value={Number(data.purchases_kg).toFixed(2)} unit="KG" />
            <StatCard title="Sales" value={Number(data.sales_kg).toFixed(2)} unit="KG" />
            <StatCard title="Closing Stock" value={Number(data.closing_stock).toFixed(2)} unit="KG" />
            <StatCard title="Borrow Amount" value={Number(data.borrow).toFixed(2)} />
          </Box>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Expense Breakdown by Category</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
              {Object.entries(data.expenses_by_category || {}).map(([category, amount]) => (
                <Typography key={category} variant="body2" color="text.secondary">
                  {category.replace('_', ' ').toUpperCase()}: <strong>{Number(amount).toFixed(2)} PKR</strong>
                </Typography>
              ))}
            </Box>
          </Paper>

          {data.customer_breakdown && Object.keys(data.customer_breakdown).length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Customer-wise Sales</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                {Object.entries(data.customer_breakdown).map(([customer, details]: [string, any]) => (
                  <Box key={customer} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">{customer}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      KG: {Number(details.kg).toFixed(2)} | Revenue: {Number(details.revenue).toFixed(2)} PKR | Profit: {Number(details.profit).toFixed(2)} PKR
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}
