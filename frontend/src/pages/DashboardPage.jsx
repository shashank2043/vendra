import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2'; // MUI Grid v2
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';

// Icons
import UsersIcon from '@mui/icons-material/People';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import HealthCheckIcon from '@mui/icons-material/MonitorHeart';
import TimerIcon from '@mui/icons-material/Timer';
import SendIcon from '@mui/icons-material/Send';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import EmailIcon from '@mui/icons-material/Email';

// Chart.js imports & registrations
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { showNotification } from '../redux/slices/notificationSlice';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const user = useSelector((state) => state.auth.user);

  // Statistics cards data
  const stats = [
    { title: 'Total Registered Users', value: '1,280', change: '+12% this week', icon: <UsersIcon sx={{ fontSize: 30 }} />, color: '#6366f1' },
    { title: 'Notifications Dispatched', value: '8,421', change: '+350 today', icon: <NotificationsActiveIcon sx={{ fontSize: 30 }} />, color: '#ec4899' },
    { title: 'System Health Rate', value: '99.98%', change: 'All systems operational', icon: <HealthCheckIcon sx={{ fontSize: 30 }} />, color: '#10b981' },
    { title: 'Average Latency', value: '42 ms', change: '-4ms from yesterday', icon: <TimerIcon sx={{ fontSize: 30 }} />, color: '#f59e0b' },
  ];

  // Dummy recent system activity
  const activities = [
    { id: 1, message: 'User "john_doe" logged in successfully.', time: '2 mins ago', type: 'login' },
    { id: 2, message: 'FCM push notification sent to device "d7s19...".', time: '10 mins ago', type: 'notification' },
    { id: 3, message: 'Config properties refreshed on gateway routing.', time: '1 hour ago', type: 'system' },
    { id: 4, message: 'New user "alice_smith" registered an account.', time: '2 hours ago', type: 'register' },
  ];

  // Chart data
  const lineChartData = {
    labels: ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM', '7:00 PM', '9:00 PM'],
    datasets: [
      {
        fill: true,
        label: 'Request Volume (req/sec)',
        data: [120, 190, 300, 250, 420, 380, 560],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: ['Email', 'SMS', 'Push Notifications'],
    datasets: [
      {
        label: 'Delivery Volume',
        data: [4200, 2900, 1321],
        backgroundColor: ['#6366f1', '#ec4899', '#f59e0b'],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: theme.palette.text.secondary,
        }
      },
      y: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: theme.palette.text.secondary,
        }
      },
    },
  };

  const triggerQuickAction = (actionName) => {
    dispatch(showNotification({
      message: `Quick Action Triggered: ${actionName}`,
      severity: 'info',
    }));
  };

  return (
    <Box sx={{ py: 1 }}>
      {/* Page Header Title */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Welcome, {user?.username || 'Developer'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            System overview and quick controls console.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            onClick={() => navigate('/dashboard/notifications')}
          >
            Dispatch Alert
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<SettingsIcon />}
            onClick={() => triggerQuickAction('Open System Settings')}
          >
            System Settings
          </Button>
        </Stack>
      </Box>

      {/* Statistics Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.title}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: stat.color === '#10b981' ? 'success.main' : 'text.secondary', fontWeight: 600 }}>
                    {stat.change}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    color: stat.color,
                    borderRadius: '12px',
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                  }}
                >
                  {stat.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Charts & Activity panels */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Line Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ height: '100%', minHeight: 380 }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Network Router Load
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 280 }}>
                <Line data={lineChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Bar Chart */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%', minHeight: 380 }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Notification Distribution
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 280 }}>
                <Bar data={barChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lower Section: Activity & Account info */}
      <Grid container spacing={3}>
        {/* System Activity */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                System Activity Log
              </Typography>
              <List sx={{ p: 0 }}>
                {activities.map((act, idx) => (
                  <React.Fragment key={act.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: act.type === 'login' ? 'primary.main' : act.type === 'notification' ? 'secondary.main' : 'warning.main', width: 36, height: 36 }}>
                          {act.type === 'login' ? <SecurityIcon fontSize="small" /> : act.type === 'notification' ? <EmailIcon fontSize="small" /> : <SettingsIcon fontSize="small" />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={act.message}
                        primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                        secondary={act.time}
                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                      />
                    </ListItem>
                    {idx < activities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Card Summary & Quick Actions */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Identity Profile
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 50, height: 50, bgcolor: 'primary.main', fontWeight: 800 }}>
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                <Box sx={{ overflow: 'hidden' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {user?.username || 'User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {user?.email || 'user@vendra.com'}
                  </Typography>
                </Box>
              </Paper>
              
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Boilerplate Quick Links
              </Typography>
              <Stack spacing={1}>
                <Button
                  variant="text"
                  color="primary"
                  fullWidth
                  sx={{ justifyContent: 'flex-start', py: 1, borderRadius: '8px' }}
                  onClick={() => navigate('/dashboard/profile')}
                >
                  Configure Profile Info
                </Button>
                <Button
                  variant="text"
                  color="primary"
                  fullWidth
                  sx={{ justifyContent: 'flex-start', py: 1, borderRadius: '8px' }}
                  onClick={() => triggerQuickAction('Verify JWT Payload')}
                >
                  Inspect JWT Bearer Claim
                </Button>
                <Button
                  variant="text"
                  color="primary"
                  fullWidth
                  sx={{ justifyContent: 'flex-start', py: 1, borderRadius: '8px' }}
                  onClick={() => triggerQuickAction('Trigger Discovery Sync')}
                >
                  Discovery Registry Sync
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
