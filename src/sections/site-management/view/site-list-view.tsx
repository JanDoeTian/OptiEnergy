import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useCallback } from "react";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";
import { Iconify } from "src/components/iconify";
import { DashboardContent } from "src/layouts/dashboard";
import { paths } from "src/routes/paths";

export function SiteListView() {


  // const handleSearch = useCallback(
  //   (inputValue: string) => {
  //     search.setState({ query: inputValue });

  //     if (inputValue) {
  //       const results = _jobs.filter(
  //         (job) => job.title.toLowerCase().indexOf(search.state.query.toLowerCase()) !== -1
  //       );

  //       search.setState({ results });
  //     }
  //   },
  //   [search]
  // );

  // const renderFilters = (
  //   <Stack
  //     spacing={3}
  //     justifyContent="space-between"
  //     alignItems={{ xs: 'flex-end', sm: 'center' }}
  //     direction={{ xs: 'column', sm: 'row' }}
  //   >
  //     <JobSearch search={search} onSearch={handleSearch} />


  //   </Stack>
  // );



  return <DashboardContent>
          <CustomBreadcrumbs
        heading="Sites"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Site', href: paths.dashboard.siteManagement },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New site
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />
  </DashboardContent>
}