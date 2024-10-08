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
import { WizardSchemaType } from './form-wizard';
import Card from '@mui/material/Card';

// ----------------------------------------------------------------------

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
    <>
      <Typography id="modal-modal-title" variant="h6" component="h2">
        Basic Information
      </Typography>
      <Box component="form" sx={{ mt: 2 }}>
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
    </>
  );
}
export function StepTwo() {
  const { getValues } = useFormContext<WizardSchemaType>();

  const [mpxnLoading, setMpxnLoading] = useState<boolean>(false);
  const { mutateAsync: e3CheckMPXN } = api.common.e3CheckMPXN.useMutation();
  const { mutateAsync: e3GenerateSessionId } = api.common.e3GenerateSessionId.useMutation();
  const [mpxnError, setMpxnError] = useState<string | null>(null);
  const [formData, setFormData] = useState<WizardSchemaType | null>(null);

  const checkMPXN = async () => {
    setMpxnLoading(true);
    const { status } = await e3CheckMPXN({ mpxn: getValues('stepTwo.mpxn') });
    console.log('status', status);
    if (status !== 'success') {
      setMpxnError(status || '');
    } else {
      setMpxnError(null);
      const { sessionId, encodedQueryStringParams } = await e3GenerateSessionId({
        mpxn: getValues('stepTwo.mpxn'),
      });
      console.log('sessionId', sessionId);
      console.log('encodedQueryStringParams', encodedQueryStringParams);
      window.open(
        `${process.env.NEXT_PUBLIC_E3_CONSENT_PORTAL_URL}/consent/${encodedQueryStringParams}`,
        '_blank',
        'width=1400,height=1000'
      );
    }
    setMpxnLoading(false);
  };

  return (
    <>
      <Box display="flex" flexDirection="column" gap={0.5}>
        <Typography variant="h6">MPxN Number</Typography>
        <Typography variant="caption" gutterBottom>
          Find the MPAN/MPRN number on your electricity bill to connect your smart meter.
        </Typography>

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
              color="success"
              sx={{ ml: 2, px: 2 }}
              startIcon={<Iconify icon="mdi:flash" />}
              onClick={checkMPXN}
              disabled={mpxnLoading}
            >
              Connect
            </Button>
          )}
          {mpxnLoading && <CircularProgress size={24} sx={{ ml: 2 }} />}
        </Box>
      </Box>
      <Card sx={{ p: 2, mb: 2 }}>
        <Box display="flex" alignItems="center" flexDirection="column">
          {formData?.stepOne.address.address && (
            <Typography variant="h6">{formData?.stepOne.address.address}</Typography>
          )}
          <Typography id="modal-modal-title" marginTop={2}>
            Smart meter status:
          </Typography>
          <Field.Switch name="stepTwo.smartMeterSwitch" label="offline" disabled sx={{ ml: 2 }} />
        </Box>
      </Card>
    </>
  );
}
