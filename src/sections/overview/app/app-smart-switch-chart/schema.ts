import { ChartOptions } from 'src/components/chart/types';
import { data as series } from './data';
import { ApexOptions } from 'apexcharts';

export const schema = {
  options: {
    annotations: {
      yaxis: [
        {
          y: 8200,
          borderColor: '#00E396',
          label: {
            borderColor: '#00E396',
            style: {
              color: '#fff',
              background: '#00E396',
            },
            text: 'Support',
          },
        },
      ],
      xaxis: [
        {
          x: new Date('23 Nov 2017').getTime(),
          strokeDashArray: 0,
          borderColor: '#775DD0',
          label: {
            borderColor: '#775DD0',
            style: {
              color: '#fff',
              background: '#775DD0',
            },
            text: 'Anno Test',
          },
        },
        {
          x: new Date('26 Nov 2017').getTime(),
          x2: new Date('28 Nov 2017').getTime(),
          borderColor: '#B3F7CA',
          opacity: 0.5,
          label: {
            borderColor: '#B3F7CA',
            style: {
              fontSize: '10px',
              color: '#fff',
              background: '#00E396',
            },
            offsetY: -10,
            text: 'X-axis range',
          },
        },
      ],
      points: [
        {
          x: new Date('01 Dec 2017').getTime(),
          y: 8607.55,
          marker: {
            size: 8,
            fillColor: '#fff',
            strokeColor: 'red',
            radius: 2,
            cssClass: 'apexcharts-custom-class',
          },
          label: {
            borderColor: '#FF4560',
            offsetY: 0,
            style: {
              color: '#fff',
              background: '#FF4560',
            },

            text: 'Point Annotation',
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
      height: '100%',
      width: '100%',
      type: 'line',
      id: 'areachart-2',
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
      curve: 'smooth',
      width: [1.5, 1.5, 1.5, 3], // Added line width for the series
      dashArray: [0, 0, 0, 8],
    },
    // grid: {
    //   padding: {
    //     right: 30,
    //     left: 20
    //   }
    // },
    fill: {
      opacity: [0.4, 0.4, 0.4, 0.8],
    },
    title: {
      text: 'Tarrif comparison',
      align: 'left',
    },
    labels: series.monthDataSeries1.dates,
    xaxis: {
      type: 'datetime',
    },
  } as ApexOptions,
  series: [
    {
      data: series.monthDataSeries1.prices,
    },
    {
      data: series.monthDataSeries2.prices,
    },
    {
      data: series.monthDataSeries3.prices,
    },
    {
      data: series.OptiEnergy.prices,
    },
  ],
};
