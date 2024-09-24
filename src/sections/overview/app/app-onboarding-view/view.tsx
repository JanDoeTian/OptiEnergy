'use client';

import { paths } from 'src/routes/paths';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { FormWizard } from './form-wizard';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import React from 'react';

// ----------------------------------------------------------------------

export function FormWizardView() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={handleOpen}>Open modal</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        
        <FormWizard />
        </Modal>
    </>
  );
}
