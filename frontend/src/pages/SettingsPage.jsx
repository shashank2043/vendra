import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import { useAppTheme } from '../contexts/ThemeContext';

const SettingsPage = () => {
  const { mode, toggleTheme } = useAppTheme();

  return (
    <Box sx={{ py: 1 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          System Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure local preferences and display setups.
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Display Configurations
          </Typography>
          <Stack spacing={2}>
            <FormControlLabel
              control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
              label="Enable Dark Theme Mode"
            />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;
