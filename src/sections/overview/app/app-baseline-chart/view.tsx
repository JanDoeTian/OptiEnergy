import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import { useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';

import { fShortenNumber } from 'src/utils/format-number';

import { Chart, useChart, ChartSelect, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    categories?: string[];
    series: {
        name: string;
        type: string;
        data: number[];
      }[]
    good_line?: number;
    ok_line?: number;
    options?: ChartOptions;
  };
};
const generateColors = (data: any[]) => {
    return data.map((d, idx) => {
        let color = d > 0.5 ?  '#ef4544': '#22c55f';

        return {
            offset: idx / (data.length - 1) * 100,
            color,
            opacity: 1
        }
    })
}

export function AppBaselineChart({ title, subheader, chart, ...other }: Props) {
  const theme = useTheme();

  const chartOptions = useChart({
    colors: [theme.palette.error.main, theme.palette.primary.main],
    annotations: {
        yaxis: [
            {
                y: chart.good_line,
                strokeDashArray: 4,
                borderColor: 'green',
                label: {
                    text: 'Good',
                    borderWidth: 0,
                }
            },
            {
                y: chart.ok_line,
                strokeDashArray: 4,
                borderColor: 'orange',
                label: {
                    text: 'OK',
                    borderWidth: 0,
                }
            }
        ]
    },
    xaxis: { categories: chart.categories,
        tickAmount:12,
        labels: {
            format: '%H:%M'
        },
        tickPlacement: 'on'
     },
    yaxis: {
      forceNiceScale: false,
      labels: {
        formatter: (value: number) => value.toFixed(0) +'%',
      },
    },
    stroke: {
      width:[2],
      dashArray: [0,0]
    },
    fill: {
        type: 'gradient',
        gradient: {
            type: 'vertical',
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.9,
            colorStops: [
                        {
          offset: 0,
          color: "red",
          opacity: 1
        },
        {
            offset: 20,
            color: "orange",
            opacity: 1
        },
        {
          offset: 60,
          color: "orange",
          opacity: 1
        },
        {
          offset: 80,
          color: "green",
                    opacity: 1
                }
            ]
        }
    },
    ...chart.options,
  });


  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        sx={{ mb: 3 }}
      />

      <ChartLegends
        colors={[theme.palette.error.main]}
        labels={['Usage percentage']}
        sx={{ px: 3, gap: 3 }}
      />

      <Chart
        type="line"
        series={chart.series}
        options={chartOptions}
        height={320}
        loadingProps={{ sx: { p: 2.5 } }}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}
