'use client'
import { Box, Button, TextField, Stack, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';

import { paths } from 'src/routes/paths';
import { SiteNewEditForm } from '../site-new-edit-form';
export default function SiteCreateView() {


  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Add a new site"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Site Management', href: paths.dashboard.siteManagement.root },
          { name: 'Create' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
    <SiteNewEditForm />
    </DashboardContent>
  );
}
