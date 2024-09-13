import type { CardProps } from '@mui/material/Card';
import type { TableHeadCustomProps } from 'src/components/table';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';

import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { api } from 'backend/trpc/client';
import { useEffect } from 'react';
import { toast } from 'src/components/snackbar';
// ----------------------------------------------------------------------

type tableData = {
  id: string;
  fileName: string;
  updatedAt: string;
}[];
type Props = CardProps & {
  title?: string;
  subheader?: string;
  headLabel: TableHeadCustomProps['headLabel'];
};

export function AppResumeFiles({ title, subheader, headLabel, ...other }: Props) {
  const { data: tableData, refetch } = api.user.getFiles.useQuery();

  const deleteFile = api.user.deleteFile.useMutation({
    onSuccess: () => {
      toast.success('File deleted successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(`Error deleting file: ${error.message}`);
    },
  });

  const handleDeleteFile = (id: string) => {
    deleteFile.mutate({ id });
  };

  const uploadFile = api.user.addFile.useMutation({
    onSuccess: (data) => {
      toast.success('File uploaded successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(`Error uploading file: ${error.message}`);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const name = file.name;

      // Check file type and size
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB in bytes
        toast.error('File size must be below 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as String;
        const toUpload = base64String.split(',')[1];
        uploadFile.mutate({ name, file: toUpload });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        sx={{ mb: 3 }}
        action={
          <Button variant="contained" component="label">
            Upload
            <input type="file" accept="application/pdf" hidden onChange={handleFileUpload} />
          </Button>
        }
      />

      <Scrollbar sx={{ minHeight: 402 }}>
        <Table sx={{ minWidth: 300 }}>
          <TableHeadCustom headLabel={headLabel} />

          <TableBody>
            {tableData?.map((row) => (
              <RowItem key={row.id} row={row} deleteFile={handleDeleteFile} />
            ))}
          </TableBody>
        </Table>
      </Scrollbar>

      <Divider sx={{ borderStyle: 'dashed' }} />

      {/* <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button
          size="small"
          color="inherit"
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
        >
          View all
        </Button>
      </Box> */}
    </Card>
  );
}

// ----------------------------------------------------------------------

type RowItemProps = {
  row: tableData[number];
  deleteFile: (id: string) => void;
};

function RowItem({ row, deleteFile }: RowItemProps) {
  const popover = usePopover();

  const handleDownload = () => {
    popover.onClose();
    console.info('DOWNLOAD', row.id);
  };

  const handlePrint = () => {
    popover.onClose();
    console.info('PRINT', row.id);
  };

  const handleShare = () => {
    popover.onClose();
    console.info('SHARE', row.id);
  };

  const handleDelete = () => {
    popover.onClose();
    deleteFile(row.id);
    console.info('DELETE', row.id);
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Iconify icon="mdi:file-pdf-box" width={18} sx={{ mr: 1 }} />
            {row.fileName}
          </Box>
        </TableCell>

        <TableCell>{row.updatedAt}</TableCell>

        <TableCell align="right" sx={{ pr: 1 }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem onClick={handleDownload}>
            <Iconify icon="eva:cloud-download-fill" />
            Download
          </MenuItem>

          <MenuItem onClick={handlePrint}>
            <Iconify icon="solar:printer-minimalistic-bold" />
            Print
          </MenuItem>

          <MenuItem onClick={handleShare}>
            <Iconify icon="solar:share-bold" />
            Share
          </MenuItem>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}
