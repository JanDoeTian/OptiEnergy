import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useEffect, useCallback, useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { Stepper, StepOne, StepTwo, StepThree } from './site-new-edit-form-step';
import { Icon } from '@iconify/react';

const steps = ['Add site', 'Connect meter', 'Consent', 'Connect tariff'];

const StepOneSchema = zod.object({
  siteName: zod
    .string()
    .min(3, { message: 'Site name should be at least 3 characters!' })
    .max(50, { message: 'Site name should be at most 50 characters!' }),
  address: schemaHelper.objectOrNull({
    message: { required_error: 'Address is required!' },
  }),
  moveInDate: schemaHelper.date({ message: { required_error: 'Move-in date is required!' } }),
});

const StepTwoSchema = zod.object({
  mpxn: zod
    .string()
    .min(11, { message: 'MPxN should be at least 11 digits!' })
    .max(13, { message: 'MPxN should be at most 13 digits!' }),
  smartMeterId: zod.string().min(2, { message: 'Smart meter is required!' }),
});

const NewSiteSchema = zod.object({
  stepOne: StepOneSchema,
  stepTwo: StepTwoSchema,
});

export type NewSiteSchemaType = zod.infer<typeof NewSiteSchema>;

// ----------------------------------------------------------------------

const defaultValues = {
  stepOne: { siteName: '', address: '', moveInDate: null },
  stepTwo: { mpxn: '', smartMeterId: '' },
};

export function SiteNewEditForm() {
  const [activeStep, setActiveStep] = useState(0);
  const router = useRouter();

  const methods = useForm<NewSiteSchemaType>({
    mode: 'all',
    resolver: zodResolver(NewSiteSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    trigger,
    formState: { isSubmitting, isValid },
  } = methods;

  const handleNext = useCallback(
    async (step?: 'stepOne' | 'stepTwo') => {
      if (step) {
        const isValid = await trigger(step);
        console.log('isValid', isValid);
        if (isValid) {
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    },
    [trigger]
  );

  const handleBack = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }, []);

  const completedStep = activeStep === steps.length;
  return (
    <Form methods={methods}>
      <Stepper steps={steps} activeStep={activeStep} />
      <Stack spacing={5} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 800 } }}>
        {activeStep === 0 && <StepOne />}
        {activeStep === 1 && <StepTwo />}
        {activeStep === 2 && <StepThree />}
        <Stack direction="row" justifyContent={activeStep !== 0 ? 'space-between' : 'flex-end'}>
          {activeStep !== 0 && (
            <Button
              onClick={handleBack}
              variant="contained"
              sx={{ borderRadius: '50px' }}
              startIcon={<Icon icon="mdi:arrow-left" />}
            >
              Back
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => handleNext(activeStep === 0 ? 'stepOne' : 'stepTwo')}
            sx={{ borderRadius: '50px', backgroundColor: 'primary.main' }}
            endIcon={<Icon icon="mdi:arrow-right" />}
          >
            Next
          </Button>
        </Stack>
      </Stack>
    </Form>
  );
}
