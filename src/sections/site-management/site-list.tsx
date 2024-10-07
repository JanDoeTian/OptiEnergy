import { ISiteItem } from "src/types/site";

import { useCallback } from "react";
import Box from '@mui/material/Box';
import Pagination, { paginationClasses } from '@mui/material/Pagination';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { SiteItem } from "./site-item";

type Props = {
    sites: ISiteItem[];
  };
  
export function SiteList({sites}: Props) {
  const router = useRouter();

  const handleView = useCallback(
    (id: string) => {
      router.push(paths.dashboard.job.details(id));
    },
    [router]
  );

  const handleEdit = useCallback(
    (id: string) => {
      router.push(paths.dashboard.job.edit(id));
    },
    [router]
  );
  
  const handleDelete = useCallback((id: string) => {
    console.info('DELETE', id);
  }, []);


  return (
    <>
      <Box
        gap={3}
        display="grid"
        gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
      >
        {sites.map((site) => (
          <SiteItem
            key={site.id}
            site={site}
            onDelete={() => handleDelete(site.id)}
            onEdit={() => handleEdit(site.id)}
            onView={() => handleView(site.id)}
          />
        ))}
      </Box>

      {sites.length > 8 && (
        <Pagination
          count={8}
          sx={{
            mt: { xs: 8, md: 8 },
            [`& .${paginationClasses.ul}`]: { justifyContent: 'center' },
          }}
        />
      )}
    </>
  );
}