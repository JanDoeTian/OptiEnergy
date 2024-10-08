'use client';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useState } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { ISiteItem } from 'src/types/site';
import { _sites } from 'src/_mock/_site';
import { SiteSearch } from '../site-search';
import { SiteSort } from '../site-sort';
import { JobList } from 'src/sections/job/job-list';
import { SiteList } from '../site-list';

export function SiteListView() {
  const SITE_SORT_OPTIONS = [
    { label: 'Latest', value: 'latest' },
    { label: 'Popular', value: 'popular' },
    { label: 'Oldest', value: 'oldest' },
  ];
  const [sortBy, setSortBy] = useState('latest');

  const search = useSetState<{ query: string; results: ISiteItem[] }>({ query: '', results: [] });

  const handleSortBy = useCallback((newValue: string) => {
    setSortBy(newValue);
  }, []);

  const handleSearch = useCallback(
    (inputValue: string) => {
      search.setState({ query: inputValue });

      if (inputValue) {
        const results = _sites.filter(
          (site) => site.name.toLowerCase().indexOf(search.state.query.toLowerCase()) !== -1
        );

        search.setState({ results });
      }
    },
    [search]
  );

  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
    >
      <SiteSearch search={search} onSearch={handleSearch} />

      <Stack direction="row" spacing={1} flexShrink={0}>
        <SiteSort sort={sortBy} onSort={handleSortBy} sortOptions={SITE_SORT_OPTIONS} />
      </Stack>
    </Stack>
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Sites"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Site', href: paths.dashboard.siteManagement.root },
        ]}
        action={
          <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />}>
            New site
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <SiteList sites={_sites} />
    </DashboardContent>
  );
}
