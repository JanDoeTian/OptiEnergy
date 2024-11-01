import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Button from '@mui/material/Button';
import MuiStepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Field } from 'src/components/hook-form';
import Autocomplete from '@mui/material/Autocomplete';
import { useEffect, useRef, useState } from 'react';
import { api } from 'backend/trpc/client';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { Icon } from '@iconify/react';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'src/components/snackbar';
import { useFormContext } from 'react-hook-form';
import Card from '@mui/material/Card';
import { z as zod } from 'zod';
import { schemaHelper } from 'src/components/hook-form';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { CONFIG } from 'src/config-global';
import { Image } from 'src/components/image';
// ----------------------------------------------------------------------
import { NewSiteSchemaType } from './site-new-edit-form';

type StepperProps = {
  steps: string[];
  activeStep: number;
};
// ----------------------------------------------------------------------
function parsePostcode(postcodeAsString: string) {
  let outward = '';
  let inward = '';
  if (typeof postcodeAsString === 'string') {
    var clean = postcodeAsString.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.match(/^[A-Z]{1,2}[0-9R][0-9A-Z]?[0-9][ABD-HJLNP-UW-Z]{2}$/)) {
      outward = clean.substring(0, clean.length - 3);
      inward = clean.substring(clean.length - 3);
    } else if (clean.match(/^[A-Z]{1,2}[0-9][0-9A-Z]?$/)) {
      outward = clean;
    }
  }
  return outward + ' ' + inward;
}

export function Stepper({ steps, activeStep }: StepperProps) {
  return (
    <MuiStepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
      {steps.map((label, index) => (
        <Step key={label}>
          <StepLabel
            StepIconComponent={({ active, completed }) => (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  color: 'text.disabled',
                  typography: 'subtitle2',
                  bgcolor: 'action.disabledBackground',
                  ...(active && { bgcolor: 'primary.main', color: 'primary.contrastText' }),
                  ...(completed && { bgcolor: 'primary.main', color: 'primary.contrastText' }),
                }}
              >
                {completed ? (
                  <Iconify width={14} icon="mingcute:check-fill" />
                ) : (
                  <Box sx={{ typography: 'subtitle2' }}>{index + 1}</Box>
                )}
              </Box>
            )}
          >
            {label}
          </StepLabel>
        </Step>
      ))}
    </MuiStepper>
  );
}

export function StepOne() {
  type Option = {
    id: string;
    address: string;
    url: string;
  };
  const siteNameRef = useRef<HTMLInputElement>();
  const [value, setValue] = useState<Option | null>(null);
  const [postcode, setPostcode] = useState<string>('');
  const [siteName, setSiteName] = useState<string>('');
  const [options, setOptions] = useState<Option[]>([]);
  const [open, setOpen] = useState(false);
  const newFPConnectSessionMutation = api.user.newFPConnectSession.useMutation();
  const addAddressMutation = api.common.addAddress.useMutation();
  const { refetch } = api.common.postcodeAutocomplete.useQuery(
    { postcode },
    {
      enabled: false,
      retry: false,
    }
  );

  const fetchPostcodeSuggestions = async () => {
    if (postcode.length > 3) {
      const { data } = await refetch();
      console.log('data', data);
      if (data && data.suggestions && data.suggestions.length > 0) {
        setOptions(data.suggestions);
      }
    }
    setOpen(true);
  };

  //   const handleConnectMeter = async () => {

  //     try {
  //       await addAddressMutation.mutateAsync({id: value!.id});

  //       if (siteNameRef.current) {
  //         console.log('siteName', siteNameRef.current.value);
  //       }
  //       const { fp_id, fp_cot } = await newFPConnectSessionMutation.mutateAsync({addressId: value!.id, siteName: siteName});
  //       setFPID(fp_id);
  //       window.open(process.env.NEXT_PUBLIC_FLATPEAK_CONNECT_URL, '_blank', 'width=440,height=934');

  //       // Check FP Connect Session status every 5 seconds
  //       handleNext('StepTwo')
  //     } catch (error) {

  //     }
  // }

  return (
    <Card>
      <CardHeader title="Site details" subheader="Site name and location" sx={{ mb: 3 }} />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        <Box>
          <Field.Text
            inputRef={siteNameRef}
            fullWidth
            id="name"
            name="stepOne.siteName"
            label="Site name"
            variant="outlined"
            margin="normal"
            placeholder="Eg: London office"
            sx={{ mb: 2 }}
          />
          <Field.DatePicker
            name="stepOne.moveInDate"
            label="Move-In date"
            disableFuture
            sx={{ mb: 2 }}
          />
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Field.Autocomplete
              open={open}
              fullWidth
              clearOnBlur={false}
              name="stepOne.address"
              value={value}
              label="Search postcode"
              noOptionsText={'Enter a postcode to search'}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              autoComplete
              onInputChange={(_, value, reason) => {
                if (reason === 'reset') {
                } else {
                  const parsed = parsePostcode(value);
                  setPostcode(parsed);
                }
              }}
              id="postcode"
              options={options}
              getOptionLabel={(option) => option.address}
              renderOption={(props: React.HTMLAttributes<HTMLLIElement>, option) => {
                const { ...optionProps } = props;

                const parts = option.address.split(',');
                const firstPart = parts[0];
                const remainingParts = parts.slice(1).join(',');
                return (
                  <li key={option.id} {...optionProps}>
                    <Grid container sx={{ alignItems: 'center' }}>
                      <Grid item sx={{ display: 'flex', width: 44 }}>
                        <Icon icon="mdi:map-marker" style={{ color: 'text.secondary' }} />
                      </Grid>
                      <Grid item sx={{ width: 'calc(100% - 44px)', wordWrap: 'break-word' }}>
                        <Box component="span" sx={{ fontWeight: 'bold' }}>
                          {firstPart}
                        </Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {remainingParts}
                        </Typography>
                      </Grid>
                    </Grid>
                  </li>
                );
              }}
            />
            <Button onClick={fetchPostcodeSuggestions} variant="contained" sx={{ ml: 2 }}>
              Search
            </Button>
          </Box>

          {value && (
            <Box sx={{ mt: 2, backgroundColor: 'lightgray', p: 2 }}>
              <Typography variant="body1">
                {value.address.split(',').map((part, index) => (
                  <span key={index} style={index === 0 ? { fontWeight: 'bold' } : {}}>
                    {part.trim()}
                    {index < value.address.split(',').length - 1 && <br />}
                  </span>
                ))}
              </Typography>
            </Box>
          )}
        </Box>
      </Stack>
    </Card>
  );
}

const MeterDetails = ({ meter }: { meter: MeterDetails }) => {
  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
        <Icon icon="mdi:meter-electric" style={{ marginRight: 8 }} />
        Meter Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon icon="mdi:identifier" style={{ marginRight: 8, color: 'text.secondary' }} />
            Device ID: {meter.deviceId}
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon icon="mdi:factory" style={{ marginRight: 8, color: 'text.secondary' }} />
            Manufacturer: {meter.deviceManufacturer}
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon icon="mdi:cellphone" style={{ marginRight: 8, color: 'text.secondary' }} />
            Model: {meter.deviceModel}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon icon="mdi:check-circle" style={{ marginRight: 8, color: 'text.secondary' }} />
            Status: {meter.deviceStatus}
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon icon="mdi:tag" style={{ marginRight: 8, color: 'text.secondary' }} />
            Type: {meter.deviceType}
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon icon="mdi:numeric" style={{ marginRight: 8, color: 'text.secondary' }} />
            MPxN:{' '}
            <span style={{ textDecoration: 'underline dotted', marginLeft: 4 }}>
              {' ' + meter.mpxn.mpxn}
            </span>
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon icon="mdi:map-marker" style={{ marginRight: 8, color: 'text.secondary' }} />
            Address Identifier:{' '}
            <span style={{ fontWeight: 'bold', marginLeft: 4 }}>
              {' ' + meter.addressIdentifier}
            </span>
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon icon="mdi:map" style={{ marginRight: 8, color: 'text.secondary' }} />
            Post Code:{' '}
            <span style={{ fontWeight: 'bold', marginLeft: 4 }}>{' ' + meter.postCode}</span>
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

type MeterDetails = {
  id: string;
  deviceId: string;
  deviceManufacturer: string;
  deviceModel: string;
  deviceStatus: string;
  deviceType: string;
  mpxn: {
    id: string;
    mpxn: string;
  }
  addressIdentifier: string;
  postCode: string;
};

export function StepTwo() {
  const {
    getValues,
    clearErrors,
    formState: { errors },
    setValue,
  } = useFormContext<NewSiteSchemaType>();
  const [meter, setMeter] = useState<MeterDetails | null>(null);
  const [mpxnLoading, setMpxnLoading] = useState<boolean>(false);
  const { mutateAsync: e3CheckMPXN } = api.common.e3CheckMPXN.useMutation();
  const [mpxnError, setMpxnError] = useState<string | null>(null);

  const checkMPXN = async () => {
    clearErrors();
    setMpxnLoading(true);
    const { status, response } = await e3CheckMPXN({ mpxn: getValues('stepTwo.mpxn') });
    if (status !== 'success') {
      setMpxnError(status || '');
      setMeter(null);
    } else {
      setMpxnError(null);
      if (response) {
        console.log(response)
        setMeter(response);
        setValue('stepTwo.smartMeterId', response.id, { shouldValidate: true });
      }
    }
    setMpxnLoading(false);
  };

  useEffect(() => {
    setValue('stepTwo.smartMeterId', '');
  }, []);

  return (
    <Card>
      <CardHeader
        title="MPxN Number"
        subheader="Find the MPAN/MPRN number on your electricity bill to connect your smart meter."
        sx={{ mb: 3 }}
      />
      <Divider />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" width="100%">
          <Box display="flex" flexDirection="column" width="100%">
            <Field.Text
              fullWidth
              id="name"
              name="stepTwo.mpxn"
              label="MPxN number"
              variant="outlined"
              margin="normal"
              placeholder="Eg: 8901234567890"
            />
            {mpxnError && (
              <Typography variant="caption" gutterBottom color="error">
                {mpxnError}
              </Typography>
            )}
          </Box>

          {!mpxnLoading && (
            <Button
              variant="contained"
              sx={{ ml: 2, px: 2, bgcolor: 'primary.main' }}
              startIcon={<Iconify icon="mdi:search" />}
              onClick={checkMPXN}
              disabled={mpxnLoading}
            >
              Search
            </Button>
          )}
          {mpxnLoading && <CircularProgress size={24} sx={{ ml: 2 }} />}
        </Box>

        <Card sx={{ p: 2, mb: 2 }}>
          <Box display="flex" alignItems="center" flexDirection="column">
            {!meter && (
              <Stack direction="column" spacing={3} alignItems="center">
                <Box>
                  <Typography variant="body1">
                    Find your MPAN/MPRN number on your electricity bill
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Look for the below pattern on your bill, it's a 11-13 digit number
                  </Typography>
                </Box>

                <Image
                  src={`${CONFIG.site.basePath}/assets/images/dashboard/mpan.webp`}
                  alt="mpan"
                />
              </Stack>
            )}
            {meter && <MeterDetails meter={meter} />}

            <Field.Text
              name="stepTwo.smartMeterId"
              sx={{ ml: 2, display: 'none' }}
              value={meter?.id || ''}
            />
            {errors.stepTwo?.smartMeterId && (
              <Typography
                variant="body1"
                gutterBottom
                color="error"
                sx={{ mt: 2, fontWeight: 'bold' }}
              >
                {errors.stepTwo?.smartMeterId.message}
              </Typography>
            )}
          </Box>
        </Card>
      </Stack>
    </Card>
  );
}

export function StepThree() {
  return (
    <Card>
      <CardHeader
        title="Verify & Consent"
        subheader="Sign the consent form and upload a picture of your recent bill with address visible. (within 3 months)"
        sx={{ mb: 3 }}
      />
      <Divider />
    </Card>
  );
}
