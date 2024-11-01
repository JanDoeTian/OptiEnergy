import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tab from '@mui/material/Tab';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { fPercent, fCurrency } from 'src/utils/format-number';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';
import { Chart, useChart } from 'src/components/chart';
import { useTabs } from 'src/hooks/use-tabs';
import { CustomTabs } from 'src/components/custom-tabs';
import { tabsClasses } from '@mui/material/Tabs';

// ----------------------------------------------------------------------

type Props = CardProps & {
  total: number;
  title: string;
  percent: number;
  chart: {
    colors?: string[];
    categories: string[];
    series: {
      data: number[];
    }[];
    options?: ChartOptions;
  };
};

const TABS = [
    { value: 'pound', label: '£' },
    { value: 'kwh', label: 'kWh' },
  ];

export function AppTotalUsage({ title, total, percent, chart, sx, ...other }: Props) {
  const theme = useTheme();

  const customTabs = useTabs('pound');
  const chartColors = chart.colors ?? [hexAlpha(theme.palette.primary.lighter, 0.64)];

  const modifiedSeries = chart.series.map((serie) => ({
    ...serie,
    data: serie.data.map((value, index) => ({
      x: chart.categories[index], // Assuming categories are aligned with data points
      y: value,
      fillColor: index === serie.data.length - 1 ? theme.palette.error.main : chartColors[0],
    })),
  }));
  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartColors,
    stroke: { width: 0 },
    grid: {
      padding: {
        top: 6,
        left: 6,
        right: 6,
        bottom: 6,
      },
    },
    xaxis: { categories: chart.categories },
    tooltip: {
      y: { formatter: (value: number) => value + ' kWh', title: { formatter: () => '' } },
    },
    ...chart.options,
  });


  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 2,
        boxShadow: 'none',
        color: 'primary.lighter',
        bgcolor: 'primary.darker',
        ...sx,
      }}
      {...other}
    >
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <div>
        <CustomTabs
            value={customTabs.value}
            onChange={customTabs.onChange}
            variant="scrollable"
            sx={{ mx: 'auto', maxWidth: 320, borderRadius:4, bgcolor: 'primary.darker'}}
          >
            {TABS.map((tab) => (
              <Tab key={tab.value} value={tab.value} label={tab.label} sx={{color: 'primary.lighter'}}/>
            ))}
          </CustomTabs>
          <Box sx={{ typography: 'h3' }}>{total} <Box component="span" sx={{ typography: 'body1' }}>£</Box></Box>
        </div>

      </Box>

      <Chart type="bar" series={modifiedSeries} options={chartOptions} height={120} />

      <SvgColor
        src={`${CONFIG.site.basePath}/assets/background/shape-square.svg`}
        sx={{
          top: 0,
          left: 0,
          width: 280,
          zIndex: -1,
          height: 280,
          opacity: 0.08,
          position: 'absolute',
          color: 'primary.lighter',
          transform: 'rotate(90deg)',
        }}
      />
    </Card>
  );
}
