import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as yup from 'yup';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';

// Icons
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';

// Shared Components & Slices
import api from '../services/api';
import { showNotification } from '../redux/slices/notificationSlice';
import { StatusBadge, SearchBox } from '../components/CommonComponents';

const validationSchema = yup.object({
  recipient: yup.string().required('Recipient is required'),
  subject: yup.string().required('Subject is required'),
  body: yup.string().required('Content body is required'),
  type: yup.string().required('Type is required'),
});

const NotificationLogPage = () => {
  const dispatch = useDispatch();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchRecipient, setSearchRecipient] = useState('user@vendra.com');
  const [modalOpen, setModalOpen] = useState(false);

  // Table pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchHistory = async (recipient) => {
    setLoading(true);
    try {
      const response = await api.get(`/notifications/history/${recipient || searchRecipient}`);
      setLogs(response.data.data || []);
    } catch (e) {
      console.error('Failed to load notification history: ', e);
      dispatch(showNotification({
        message: 'Could not connect to Notification service. Using mock data.',
        severity: 'warning'
      }));
      // Set dummy logs in case service is not running locally yet
      setLogs([
        { id: 1, recipient: 'user@vendra.com', subject: 'Welcome to Vendra', body: 'This is a test notification.', type: 'EMAIL', status: 'SENT', sentAt: new Date().toISOString() },
        { id: 2, recipient: 'user@vendra.com', subject: 'OTP Verification', body: 'Your code is 1234.', type: 'SMS', status: 'SENT', sentAt: new Date().toISOString() },
        { id: 3, recipient: 'admin@vendra.com', subject: 'High CPU Alert', body: 'Server CPU is above 90%.', type: 'PUSH', status: 'FAILED', sentAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory('user@vendra.com');
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory(searchRecipient);
  };

  // Formik for sending notifications
  const formik = useFormik({
    initialValues: {
      recipient: 'user@vendra.com',
      subject: '',
      body: '',
      type: 'EMAIL',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        await api.post('/notifications', values);
        dispatch(showNotification({
          message: 'Notification sent successfully!',
          severity: 'success',
        }));
        setModalOpen(false);
        resetForm();
        fetchHistory(values.recipient);
      } catch (err) {
        console.error('Failed to send notification: ', err);
        dispatch(showNotification({
          message: err.response?.data?.message || 'Error occurred while sending notification.',
          severity: 'error',
        }));
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Notification Logs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Dispatch alerts and check history logs from Notification Service module.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
        >
          Send Notification
        </Button>
      </Box>

      {/* Lookup controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <SearchBox
              value={searchRecipient}
              onChange={(e) => setSearchRecipient(e.target.value)}
              placeholder="Search recipient..."
            />
            <Button type="submit" variant="outlined" color="primary" disabled={loading}>
              Search Logs
            </Button>
          </form>
          <IconButton onClick={() => fetchHistory(searchRecipient)} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </CardContent>
      </Card>

      {/* Main Table view */}
      <TableContainer component={Paper} sx={{ position: 'relative' }}>
        {loading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />}
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Recipient</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
              <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>{row.id}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{row.recipient}</TableCell>
                <TableCell>{row.subject}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell align="right">
                  {new Date(row.sentAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No notification logs found. Try dispatching one!
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={logs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Send Notification Modal Dialog */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Dispatch Notification Alert</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                select
                fullWidth
                id="type"
                name="type"
                label="Notification Type"
                value={formik.values.type}
                onChange={formik.handleChange}
                error={formik.touched.type && Boolean(formik.errors.type)}
                helperText={formik.touched.type && formik.errors.type}
              >
                <MenuItem value="EMAIL">Email Message</MenuItem>
                <MenuItem value="SMS">SMS Message</MenuItem>
                <MenuItem value="PUSH">FCM Push Notification</MenuItem>
              </TextField>

              <TextField
                fullWidth
                id="recipient"
                name="recipient"
                label="Recipient (Email/Phone/Token)"
                value={formik.values.recipient}
                onChange={formik.handleChange}
                error={formik.touched.recipient && Boolean(formik.errors.recipient)}
                helperText={formik.touched.recipient && formik.errors.recipient}
              />

              <TextField
                fullWidth
                id="subject"
                name="subject"
                label="Subject"
                value={formik.values.subject}
                onChange={formik.handleChange}
                error={formik.touched.subject && Boolean(formik.errors.subject)}
                helperText={formik.touched.subject && formik.errors.subject}
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                id="body"
                name="body"
                label="Message Content"
                value={formik.values.body}
                onChange={formik.handleChange}
                error={formik.touched.body && Boolean(formik.errors.body)}
                helperText={formik.touched.body && formik.errors.body}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setModalOpen(false)} variant="outlined" color="inherit" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default NotificationLogPage;
