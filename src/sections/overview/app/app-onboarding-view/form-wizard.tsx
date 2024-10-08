import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';

import { toast } from 'src/components/snackbar';
import { Form, schemaHelper } from 'src/components/hook-form';

import { Stepper, StepOne, StepTwo } from './form-steps';
import { StepThree } from 'src/sections/site-management/site-new-edit-form-step';

// ----------------------------------------------------------------------

const steps = ['Add site', 'Connect smart meter', 'Connect tariff'];

const StepOneSchema = zod.object({
  siteName: zod
    .string()
    .min(3, { message: 'Site name should be at least 3 characters!' })
    .max(50, { message: 'Site name should be at most 50 characters!' }),
  address: schemaHelper.objectOrNull({
    message: { required_error: 'Address is required!' },
  }),
});

const StepTwoSchema = zod.object({
  mpxn: zod
    .string()
    .min(11, { message: 'MPxN should be at least 11 digits!' })
    .max(13, { message: 'MPxN should be at most 13 digits!' }),
  smartMeterSwitch: schemaHelper.boolean({
    message: { required_error: 'Smart meter connection is required!' },
  }),
});

const WizardSchema = zod.object({
  stepOne: StepOneSchema,
  stepTwo: StepTwoSchema,
});

export type WizardSchemaType = zod.infer<typeof WizardSchema>;

// ----------------------------------------------------------------------

const defaultValues = {
  stepOne: { siteName: '', address: '' },
  stepTwo: { mpxn: '' },
};

export function FormWizard() {
  const [activeStep, setActiveStep] = useState(0);

  const [fpId, setFPID] = useState<string>('');

  const methods = useForm<WizardSchemaType>({
    mode: 'onChange',
    resolver: zodResolver(WizardSchema),
    defaultValues,
  });

  const {
    reset,
    trigger,
    handleSubmit,
    formState: { isSubmitting },
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

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Create success!');
      console.info('DATA', data);
      handleNext();
    } catch (error) {
      console.error(error);
    }
  });

  const completedStep = activeStep === steps.length;

  return (
    <Card
      sx={{
        p: 5,
        width: 1,
        mx: 'auto',
        maxWidth: 720,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <Form methods={methods} onSubmit={onSubmit}>
        <Stepper steps={steps} activeStep={activeStep} />

        <Box
          gap={3}
          display="flex"
          flexDirection="column"
          sx={{
            p: 3,
            mb: 3,
            minHeight: 240,
            borderRadius: 1.5,
            border: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
          }}
        >
          {activeStep === 0 && <StepOne />}
          {activeStep === 1 && <StepTwo />}
        </Box>

        {!completedStep && (
          <Box display="flex" marginTop={4}>
            {activeStep !== 0 && <Button onClick={handleBack}>Back</Button>}

            <Box sx={{ flex: '1 1 auto' }} />

            {activeStep === 0 && (
              <Button variant="contained" onClick={() => handleNext('stepOne')}>
                Next
              </Button>
            )}
            {activeStep === 1 && (
              <Button variant="contained" onClick={() => handleNext('stepTwo')}>
                Next
              </Button>
            )}
            {activeStep === 2 && (
              <LoadingButton variant="contained" type="submit" loading={isSubmitting}>
                Start automation
              </LoadingButton>
            )}
          </Box>
        )}
      </Form>
    </Card>
  );
}
