import { Card } from "@mui/material";
import { Chart } from "src/components/chart";

import { useChart } from "src/components/chart/use-chart";

export function AppMultisiteUsage() {

    const chartOptions = useChart({
            plotOptions: {
              bar: {
                horizontal: false,
                columnWidth: '55%',
              },
            },
            dataLabels: {
              enabled: false
            },
            stroke: {
              show: true,
              width: 2,
              colors: ['transparent']
            },
            xaxis: {
              categories: ['Jul', 'Aug', 'Sep', 'Oct'],
            },
            yaxis: {
              title: {
                text: 'Monthly Cost'
              },
              min: 0,
              max: 150
            },
            fill: {
              opacity: 1
            },
            tooltip: {
              y: {
                formatter: function (val) {
                  return "£" + val
                }
              }
            }
          
    });
      
  return (
    <Card sx={{mt: 1}}>
      <Chart
        options={chartOptions}
        series={ [{
            name: 'Fulham office',
            data: [58, 63, 60, 66]
          }, {
            name: 'Old street office',
            data: [ 105, 91, 114, 94]
          }, {
            name: 'Bank office',
            data: [48, 52, 53, 41]
          }]
        }
        type="bar"
        height={240}
      />
    </Card>
  );
}
