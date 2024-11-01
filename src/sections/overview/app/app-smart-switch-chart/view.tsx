import { schema } from './schema';
import { useState } from 'react';
import { ApexOptions } from 'apexcharts';
import { ChartBaseProps, ChartLoadingProps } from 'src/components/chart/types';
import { withLoadingProps } from 'src/utils/with-loading-props';
import dynamic from 'next/dynamic';
import { ChartLoading } from 'src/components/chart/chart-loading';
import Box from '@mui/material/Box';
import CardHeader from '@mui/material/CardHeader';
import Card from '@mui/material/Card';
import {Chart, useChart} from 'src/components/chart';
import { data as series } from './data';


type WithLoadingProps = ChartBaseProps & {
  loading?: ChartLoadingProps;
};

const ApexChart = withLoadingProps<WithLoadingProps>((props) =>
  dynamic(() => import('react-apexcharts').then((mod) => mod.default), {
    ssr: false,
    loading: () => {
      const { loading, type } = props();

      return loading?.disabled ? null : <ChartLoading type={type} sx={loading?.sx} />;
    },
  })
);

export default function AppSmartSwitchChartView() {
  const [state] = useState(schema);
  const chartOptions = useChart(
    {
      annotations: {
        yaxis: [
          {
            y: 38,
            borderColor: '#00E396',
            label: {
              borderColor: '#00E396',
              style: {
                color: '#fff',
                background: '#00E396',
              },
              text: 'Average tariff',
            },
          },
        ],
      },
      
      chart: {
        toolbar: {
          show: false,
        },
        animations: {
          enabled: false,
        },
      },
      grid: {
        row: {
          colors: ['#f4f4f4', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: ['stepline', 'stepline'], // Add 'stepline' for step area charts
        colors: ['#006400', '#FFA500'],
        width: [0.6, 0.6], // Define width for step area charts
        dashArray: [0, 0],
      },
      fill: {
        colors: ['#006400', '#FFA500'], // Add colors for step area charts
        opacity: [0.4, 0.4], // Define opacity for step area charts
      },
      title: {
        text: 'Your consumption pattern',
        align: 'left',
      },
      labels: series.monthDataSeries1.dates,
      xaxis: {
        type: 'datetime',
      },
      yaxis: {
        min: 0,
        max: 60,
        tickAmount: 10,
        labels: {
          formatter: function (value) {
            return value + 'p';
          },
        },
      },

      // grid: {
      //   padding: {
      //     right: 30,
      //     left: 20
      //   }
      // },

    }
  );

  return (
    <Card>
      <CardHeader title={'Time of use'} subheader={'Based on monthly usage'}  sx={{ mb: 3 }} />
      <Box
        dir="ltr"
        sx={{
          width: '100%',
          height: 450,
          flexShrink: 0,
          borderRadius: 1.5,
          padding: 2,
          position: 'relative',
        }}
      >
        <Chart
          options={chartOptions}
          series={[
            {
              type: 'area',
            
              data: [
                { x: new Date('01 Jan 2023 00:00').getTime(), y: 26 },
                { x: new Date('01 Jan 2023 01:00').getTime(), y: 26 },
                { x: new Date('01 Jan 2023 02:00').getTime(), y: 26 },
                { x: new Date('01 Jan 2023 03:00').getTime(), y: 26 },
                { x: new Date('01 Jan 2023 04:00').getTime(), y: 26 },
                { x: new Date('01 Jan 2023 05:00').getTime(), y: 26 },
                { x: new Date('01 Jan 2023 06:00').getTime(), y: 26 },
                { x: new Date('01 Jan 2023 07:00').getTime(), y: 26 },
                { x: new Date('01 Jan 2023 08:00').getTime(), y: 26 },
                { x: new Date('01 Jan 2023 09:00').getTime(), y: 26 },
                { x: new Date('01 Jan 2023 10:00').getTime(), y: 26 },
                { x: new Date('01 Jan 2023 11:00').getTime(), y: null },
                { x: new Date('01 Jan 2023 12:00').getTime(), y: null },
                { x: new Date('01 Jan 2023 13:00').getTime(), y: null },
                { x: new Date('01 Jan 2023 14:00').getTime(), y: null },
                { x: new Date('01 Jan 2023 15:00').getTime(), y: null },
                { x: new Date('01 Jan 2023 16:00').getTime(), y: 26 },
                { x: new Date('01 Jan 2023 17:00').getTime(), y: 26 },
                { x: new Date('01 Jan 2023 18:00').getTime(), y: 26 },
                { x: new Date('01 Jan 2023 19:00').getTime(), y: 26 },
                { x: new Date('01 Jan 2023 20:00').getTime(), y: 26 },
                { x: new Date('01 Jan 2023 21:00').getTime(), y: 26 },
                { x: new Date('01 Jan 2023 22:00').getTime(), y: 26 },
                { x: new Date('01 Jan 2023 23:00').getTime(), y: 26 },
                
              ], // Mock data for stepDataSeries1
            },
            {
              type: 'area',
              data: [
                { x: new Date('01 Jan 2023 10:00').getTime(), y: 45 },
                { x: new Date('01 Jan 2023 11:00').getTime(), y: 45 },
                { x: new Date('01 Jan 2023 12:00').getTime(), y: 45 },
                { x: new Date('01 Jan 2023 13:00').getTime(), y: 45 },
                { x: new Date('01 Jan 2023 14:00').getTime(), y: 45 },
                { x: new Date('01 Jan 2023 15:00').getTime(), y: 45 },
                { x: new Date('01 Jan 2023 16:00').getTime(), y: 45 },
              ], // Mock data for stepDataSeries2
            },
          ]}
          type="line"
          height="100%"
          width="100%"
        />
      </Box>
    </Card>
  );
}
