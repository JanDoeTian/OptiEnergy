import type { CardProps } from '@mui/material/Card';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';

import { useTabs } from 'src/hooks/use-tabs';

import { fPercent, fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import { CustomTabs } from 'src/components/custom-tabs';
import { Typography } from '@mui/material';

// ----------------------------------------------------------------------

type Props = CardProps & {
    percent: number;
  };


export function AppProjectionChart({ sx,percent, ...other }: Props) {
  const theme = useTheme();

  const tabs = useTabs('income');

  const chartColors =
    tabs.value === 'income' ? [theme.palette.primary.dark] : [theme.palette.warning.dark];

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'] },
    stroke: { width: 3, dashArray: [0, 5] },
    tooltip: {
      y: { formatter: (value: number) => fCurrency(value), title: { formatter: () => '' } },
    },
    yaxis: {
      min: 170,
      max: 350
    },
    chart: {
      animations: {
        enabled: false,
      },
    },
  });
  const renderTrending = (
    <Box gap={0.5} display="flex" alignItems="center" flexDirection="row">
      <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center', typography: 'subtitle2' }}>
        <Iconify 
          icon={percent >= 0 ? 'eva:trending-up-fill' : 'eva:trending-down-fill'} 
          sx={{ color: percent >= 0 ? 'red' : 'green' }}
        />
        <Box component="span">
          {percent > 0 && '+'}
          {fPercent(percent)}
        </Box>
      </Box>
      <Box component="span" sx={{ opacity: 0.64, typography: 'body2' }}>
        compared to last month
      </Box>
    </Box>
  );

  const renderBalance = (
    <Box sx={{ flexGrow: 1 }}>
      <Box
        sx={{
          mb:1,
          gap: 0.5,
          display: 'flex',
          alignItems: 'center',
          color: 'text.secondary',
          typography: 'subtitle2',
        }}
      >
         Projected Monthly Cost
        <Tooltip title="Vestibulum ullamcorper mauris">
          <Iconify width={16} icon="eva:info-outline" sx={{ color: 'text.disabled' }} />
        </Tooltip>
      </Box>
      <Box sx={{display:'flex',alignItems:'center',gap:1}}>
      <Box sx={{ typography: 'h3' }}>£ 329</Box>
      {renderTrending}
      </Box>
    </Box>
  );



  return (
    <Card sx={{ p: 3, ...sx }} {...other}>
      <Box
        sx={{
          gap: 2,
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {renderBalance}
      </Box>


      <Chart
        type="line"
        series={[
            { data: [179, 268, 299, 287, 210, 290, 295, 290,null] },
            { data: [179, 268, 299, 287, 210, 290, 295, 290,328]}
         
           // Added second series with dashed line
          ]}
        options={chartOptions}
        height={160}
      />
    </Card>
  );
}
