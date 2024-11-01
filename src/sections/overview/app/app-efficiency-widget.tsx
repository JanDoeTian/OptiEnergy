import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';

import { useResponsive } from 'src/hooks/use-responsive';

import { fNumber } from 'src/utils/format-number';

import { Chart, useChart } from 'src/components/chart';

import { Icon } from '@iconify/react';

// ----------------------------------------------------------------------

type Props = CardProps & {
  chart: {
    colors?: string[];
    series: {
      label: string;
      percent: number;
      average: number;
    }[];
    options?: ChartOptions;
  };
};

export function AppEfficiencyWidget({ chart, ...other }: Props) {
  const theme = useTheme();

  const smUp = useResponsive('up', 'sm');

  const chartColors = chart.colors ?? [
    [theme.palette.primary.light, theme.palette.primary.main],
    chart.series[0].percent > 80
      ? [theme.palette.success.light, theme.palette.success.main]
      : chart.series[0].percent > 30
      ? [theme.palette.warning.light, theme.palette.warning.main]
      : [theme.palette.error.light, theme.palette.error.main],
  ];

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    stroke: { width: 0 },
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: [
          { offset: 0, color: chartColors[0][0], opacity: 1 },
          { offset: 100, color: chartColors[0][1], opacity: 1 },
        ],
      },
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 6,
            fontSize: theme.typography.subtitle2.fontSize as string,
            fontWeight: theme.typography.subtitle2.fontWeight,
          },
        },
      },
    },
    ...chart.options,
  });

  return (
    <Card {...other}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        divider={
          <Divider
            flexItem
            orientation={smUp ? 'vertical' : 'horizontal'}
            sx={{ borderStyle: 'dashed' }}
          />
        }
      >
        {chart.series.map((item) => {
          const isBetter = item.percent > item.average;
          const difference = Math.round(Math.abs(item.percent - item.average)); // Rounded to no decimal

          return (
            <Box
              key={item.label}
              sx={{
                py: 2,
                gap: 2,
                width: 1,
                display: 'flex',
                flexDirection: 'column',
                px: { xs: 3, sm: 0 },
                alignItems: 'center',
                justifyContent: { sm: 'center' },
              }}
            >
              <Box sx={{ typography: 'h6' }}>
                {item.label}
              </Box>

              <Chart
                type="radialBar"
                series={[item.percent]}
                options={{
                  ...chartOptions,
                  ...(item.label !== 'Sold' && {
                    fill: {
                      type: 'gradient',
                      gradient: {
                        colorStops: [
                          { offset: 0, color: chartColors[1][0], opacity: 1 },
                          { offset: 100, color: chartColors[1][1], opacity: 1 },
                        ],
                      },
                    },
                  }),
                }}
                width={80}
                height={80}
              />

              <Box sx={{ typography: 'body2', mt: 1, display: 'flex', alignItems: 'center' }}>
                Industry Average: {item.average}%
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    color: isBetter ? 'green' : 'red',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Icon
                    icon={isBetter ? 'mdi:arrow-upward' : 'mdi:arrow-downward'}
                    color={isBetter ? 'green' : 'red'}
                    style={{ marginRight: 4 }}
                  />
                  {difference}% {isBetter ? 'Better' : 'Worse'}
                </Box>
              </Box>
              <Box sx={{ typography: 'caption', textAlign: 'center' }}>
                Calculated based on your usage pattern against peak, non-peak tariff.
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Card>
  );
}
