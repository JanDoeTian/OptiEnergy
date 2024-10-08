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

  return (
    <Card>
      <CardHeader title={'Market overview'} subheader={'Total'} sx={{ mb: 3 }} />
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
        <ApexChart
          options={state.options as ApexOptions}
          series={state.series}
          type="line"
          height="100%"
          width="100%"
          loading={{ sx: { p: 2.5 } }}
        />
      </Box>
    </Card>
  );
}
