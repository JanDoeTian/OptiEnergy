'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';

import { DashboardContent } from 'src/layouts/dashboard';
import { SeoIllustration } from 'src/assets/illustrations';
import {
  _appAuthors,
  _appRelated,
  _appFeatured,
  _appInvoices,
  _appInstalled,
  _applicationStatus,
  _bookingsOverview,
} from 'src/_mock';

import { svgColorClasses } from 'src/components/svg-color';

import { useMockedUser } from 'src/auth/hooks';

import { AppWidget } from '../app-widget';
import { AppWelcome } from '../app-welcome';
import { AppFeatured } from '../app-featured';
import { AppNewInvoice } from '../app-new-invoice';
import { AppTopAuthors } from '../app-top-authors';
import { AppTopRelated } from '../app-top-related';
import { AppAreaInstalled } from '../app-area-installed';
import { AppWidgetSummary } from '../app-widget-summary';
import { AppCurrentDownload } from '../app-current-download';
import { AppTopInstalledCountries } from '../app-top-installed-countries';
import { api } from 'backend/trpc/client';
import { TextField, Typography } from '@mui/material';
import { toast } from 'src/components/snackbar';
import { AppResumeFiles } from '../app-resume-files';
import { AppJobApplication } from '../app-job-application';
import AppOnboardingView from '../app-onboarding';
import { AppMap } from '../app-map';
import { FormWizardView } from '../app-onboarding-view';
import AppSmartSwitchChartView from '../app-smart-switch-chart/view';
import { AppSmartSaving } from '../app-smart-saving';
import { AppBaselineChart } from '../app-baseline-chart';
import { BookingTotalIncomes } from '../../booking/booking-total-incomes';
import { BookingBooked } from '../../booking/booking-booked';
import { BookingCheckInWidgets } from '../../booking/booking-check-in-widgets';
import { AppTotalUsage } from '../app-total-usage';
import { AppEfficiencyWidget } from '../app-efficiency-widget';
import { AppProjectionChart } from '../app-projection-chart';
import { AppMultisiteUsage } from '../app-multisite-usage';

// ----------------------------------------------------------------------

export function OverviewAppView() {
  const theme = useTheme();

  return (
    <DashboardContent maxWidth="lg">
      <Grid container spacing={1}>

      
        <Grid xs={12} md={6} lg={6}>
          
            <Box
              sx={{
                mb: 3,
                p: { md: 1 },
                display: 'flex',
                gap: { xs: 3, md: 1 },
                borderRadius: { md: 2 },
                flexDirection: 'column',
                bgcolor: { md: 'background.neutral' },
              }}
            >
                <AppTotalUsage
                  title="Daily usage"
                  total={40}
                  percent={2.6}
                  chart={{
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                    series: [{ data: [10, 41, 80, 100, 60, 120, 69, 91, 160] }],
                  }}
                />


              <AppEfficiencyWidget
                chart={{
                  series: [
                    { label: 'Efficiency score', percent: 63.9, average: 55},
                  ],
                }}
                sx={{ boxShadow: { md: 'none' } }}
              />
            </Box>

        </Grid>

        <Grid xs={12} md={6} lg={6}>
        <AppProjectionChart  percent={10}/>
        <AppMultisiteUsage/>
        </Grid>

        <Grid xs={12} md={12} lg={12}>
        <AppBaselineChart
            title="Intraday baseline"
            subheader="(+43%) than last year"
            chart={{
              categories: [
                '00:00',
                '00:30',
                '01:00',
                '01:30',
                '02:00',
                '02:30',
                '03:00',
                '03:30',
                '04:00',
                '04:30',
                '05:00',
                '05:30',
                '06:00',
                '06:30',
                '07:00',
                '07:30',
                '08:00',
                '08:30',
                '09:00',
                '09:30',
                '10:00',
                '10:30',
                '11:00',
                '11:30',
                '12:00',
                '12:30',
                '13:00',
                '13:30',
                '14:00',
                '14:30',
                '15:00',
                '15:30',
                '16:00',
                '16:30',
                '17:00',
                '17:30',
                '18:00',
                '18:30',
                '19:00',
                '19:30',
                '20:00',
                '20:30',
                '21:00',
                '21:30',
                '22:00',
                '22:30',
                '23:00',
                '23:30',
              ],
              series: 
                [
                    {
                      name: 'Percentage usage',
                      type: 'line',
                      data: [51, 35, 41, 10, 91, 69, 62, 78, 91, 69, 62, 49, 51, 35, 41, 10, 91, 69, 62, 78, 91, 69, 62, 49, 51, 35, 41, 10, 91, 69, 62, 78, 91, 69, 62, 49, 51, 35, 41, 10, 91, 69, 62, 78, 91, 62, 49, 23],
                    },
                ],
              good_line: 40,
              ok_line: 80,
            }}
          />
        </Grid>
        <Grid xs={12} md={4}>
          <AppMap />
        </Grid>
        <Grid xs={12} md={12}>
          <AppSmartSwitchChartView />
        </Grid>


      </Grid>
    </DashboardContent>
  );
}
