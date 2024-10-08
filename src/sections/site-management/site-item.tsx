import type { ISiteItem } from 'src/types/site';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';

type Props = {
  site: ISiteItem;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function SiteItem({ site, onView, onEdit, onDelete }: Props) {
  const popover = usePopover();
  const mapImageUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s-${site.name.charAt(0).toLowerCase()}+000(${site.longitude},${site.latitude})/${site.longitude},${site.latitude},13/140x140?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}`;
  return (
    <>
      <Card>
        <IconButton onClick={popover.onOpen} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>

        <Stack direction="column" spacing={2}>
          <Stack
            sx={{ p: 3, pb: 2 }}
            direction="row"
            alignItems="top"
            spacing={2}
            marginRight={3}
            maxHeight={120}
          >
            <ListItemText
              sx={{ mb: 1 }}
              primary={
                <Link
                  component={RouterLink}
                  href={paths.dashboard.siteManagement.details(site.id)}
                  color="inherit"
                >
                  {site.name}
                </Link>
              }
              secondary={
                <>
                  <Typography variant="caption" color="text.disabled">
                    {site.address}
                  </Typography>
                </>
              }
              primaryTypographyProps={{ typography: 'subtitle1' }}
              secondaryTypographyProps={{
                mt: 1,
                component: 'span',
                typography: 'caption',
                color: 'text.disabled',
              }}
            />

            <Box
              component="img"
              src={mapImageUrl}
              alt={site.name}
              sx={{ width: 80, height: 80, borderRadius: 1 }}
            />
          </Stack>{' '}
          <Stack sx={{ p: 3, pb: 2 }} direction="row" alignItems="top" spacing={2} marginRight={3}>
            <Stack
              spacing={0.5}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ typography: 'caption' }}
            >
              <Typography variant="caption">Connection status:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title="Smart meter connected">
                  <Iconify width={20} icon="ic:baseline-power" color="green" />
                </Tooltip>
                <Tooltip title="Tariff connected">
                  <Iconify width={20} icon="material-symbols-light:price-change" color="green" />
                </Tooltip>
              </Box>
            </Stack>
          </Stack>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />
        <Stack>
          {site.messages.map((message) => {
            const daysAgo = Math.floor(
              (new Date().getTime() - new Date(message.createdAt).getTime()) / (1000 * 60 * 60 * 24)
            );
            return (
              <Stack
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                marginRight={1}
              >
                <Alert
                  severity={message.type}
                  sx={{ backgroundColor: 'transparent', maxWidth: 290 }}
                >
                  {message.message}
                </Alert>
                <Typography variant="caption" color="text.disabled">
                  {daysAgo} days ago
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </Card>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              popover.onClose();
              onView();
            }}
          >
            <Iconify icon="solar:eye-bold" />
            View
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
              onEdit();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
              onDelete();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}
