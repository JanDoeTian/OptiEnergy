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

// ----------------------------------------------------------------------

export function OverviewAppView() {
  const theme = useTheme();

  return (
    <DashboardContent maxWidth="xl">
      <AppOnboardingView />
      <Grid container spacing={1}>
        <Grid xs={12} md={6}>
          <AppWidgetSummary
            title="New jobs"
            percent={2.6}
            total={1765}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [15, 18, 12, 51, 68, 11, 39, 37],
            }}
          />
        </Grid>
        <Grid xs={12} md={6}>
          {/* <AppResumeFiles
            title="My Resumes"
            headLabel={[
              { id: 'id', label: 'File Name' },
              { id: 'category', label: 'Uploaded At' },
              { id: '' },
            ]}
          /> */}
          <AppMap />
        </Grid>
        <Grid xs={12} md={6}>
          <AppWidgetSummary
            title="Application submitted"
            percent={10}
            total={139}
            chart={{
              colors: [theme.vars.palette.info.main],
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [20, 41, 63, 33, 28, 35, 50, 46],
            }}
          />
        </Grid>

        <Grid xs={12} md={8}>

        </Grid>
      </Grid>
    </DashboardContent>
  );
}
