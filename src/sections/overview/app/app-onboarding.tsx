import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import { Icon } from '@iconify/react';
import { api } from 'backend/trpc/client';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import { toast } from 'src/components/snackbar';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';

const style = {
  position: 'absolute' as 'absolute',
  top: '30%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

type Option = {
  id: string;
  address: string;
  url: string;
};

enum ScreenState {
  Initial,
  Connecting,
  Success,
}

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
export default function AppOnboardingView() {
  const [open, setOpen] = React.useState(true);
  const [screenState, setScreenState] = React.useState<ScreenState>(ScreenState.Initial);
  const [fpId, setFPID] = React.useState<string | null>(null);
  const [postcodeError, setPostcodeError] = React.useState<string | null>(null);
  const checkFPConnectSessionQuery = api.user.checkFPConnectSession.useQuery(
    { fp_id: fpId || '' },
    {
      enabled: false,
      retry: false,
    }
  );

  const handleCheckFPConnectSession = async () => {
    if (fpId) {
      const { data } = await checkFPConnectSessionQuery.refetch();
      if (data) {
        toast.success(`FP Connect Session Status: ${data}`);
      } else {
        toast.error('Failed to fetch FP Connect Session status');
      }
    } else {
      toast.error('FP ID is not set');
    }
  };

  const newFPConnectSessionMutation = api.user.newFPConnectSession.useMutation();
  const addAddressMutation = api.common.addAddress.useMutation();
  const [siteName, setSiteName] = React.useState('');
  const [value, setValue] = React.useState<Option | null>(null);
  const [postcode, setPostcode] = React.useState('');
  const [options, setOptions] = React.useState<{ id: string; address: string; url: string }[]>([]);

  const { refetch } = api.common.postcodeAutocomplete.useQuery(
    { postcode },
    {
      enabled: false,
      retry: false,
    }
  );

  const handleOpen = () => setOpen(true);
  const handleClose = (_event: any, reason: string) => {
    setOpen(false);
  };

  const fetchPostcodeSuggestions = async () => {
    if (postcode.length > 3) {
      const { data } = await refetch();
      if (data && data.suggestions && data.suggestions.length > 0) {
        setOptions(data.suggestions);
      }
    }
  };

  React.useEffect(() => {
    let active = true;

    if (postcode === '') {
      setOptions(value ? [value] : []);
      return undefined;
    }

    return () => {
      active = false;
    };
  }, [value, postcode]);

  const handleConnectMeter = async () => {
    setScreenState(ScreenState.Connecting);
    try {
      await addAddressMutation.mutateAsync({ id: value!.id });
      const { fp_id, fp_cot } = await newFPConnectSessionMutation.mutateAsync({
        addressId: value!.id,
        siteName: siteName,
      });
      setFPID(fp_id);
      window.open(process.env.NEXT_PUBLIC_FLATPEAK_CONNECT_URL, '_blank', 'width=440,height=934');

      // Check FP Connect Session status every 5 seconds
      const intervalId = setInterval(async () => {
        const { data } = await checkFPConnectSessionQuery.refetch();
        if (data && data === 'success') {
          toast.success('Meter connected successfully');
          clearInterval(intervalId);
          setScreenState(ScreenState.Success);
          setTimeout(() => {
            setOpen(false);
          }, 5000);
        } else if (data && data === 'fail') {
          toast.error('Meter connection failed');
          clearInterval(intervalId);
          setScreenState(ScreenState.Initial);
        }
      }, 5000);
    } catch (error) {
      toast.error('Failed to connect to meter. Please try again.');
      setScreenState(ScreenState.Initial);
    }
  };

  return (
    <div>
      <Button onClick={handleOpen}>Open modal</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Card sx={style}>
          {screenState === ScreenState.Connecting ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <CircularProgress size={48} sx={{ color: 'blue' }} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Please connect to your energy supplier on the popup window.
              </Typography>
            </Box>
          ) : screenState === ScreenState.Success ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <Icon icon="ooui:success" style={{ color: 'green', fontSize: 48 }} />
              <Typography variant="body1" sx={{ mt: 1 }}>
                Successfully linked to your meter
              </Typography>
            </Box>
          ) : (
            <>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                👋 Welcome, let's add your first site
              </Typography>
              <Box component="form" sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Site name"
                  variant="outlined"
                  margin="normal"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  inputProps={{ minLength: 3, maxLength: 50 }}
                  sx={{ mb: 2 }}
                />
                <Autocomplete
                  fullWidth
                  value={value}
                  noOptionsText={'Enter a postcode to search'}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  autoComplete
                  onInputChange={(_, value) => {
                    const parsed = parsePostcode(value);

                    setPostcode(parsed);
                    // setPostcode(value)
                  }}
                  id="postcode"
                  options={options}
                  onChange={(_, value) => {
                    setValue(value);
                  }}
                  getOptionLabel={(option) => option.address}
                  renderInput={(params) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TextField {...params} label="Add site location" fullWidth />
                      <Button onClick={fetchPostcodeSuggestions} variant="contained" sx={{ ml: 2 }}>
                        Search
                      </Button>
                    </Box>
                  )}
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

                {value && (
                  <Box sx={{ mt: 2, backgroundColor: 'lightgray', p: 2 }}>
                    <Typography variant="body1">
                      {value.address.split(',').map((part, index) => (
                        <span key={index}>
                          {part.trim()}
                          {index < value.address.split(',').length - 1 && <br />}
                        </span>
                      ))}
                    </Typography>
                    <Button
                      type="button"
                      variant="contained"
                      sx={{ mt: 2, backgroundColor: 'blue' }}
                      onClick={handleConnectMeter}
                    >
                      <Icon icon="mdi:flash" style={{ color: 'yellow', marginRight: '8px' }} />
                      Connect meter
                    </Button>
                  </Box>
                )}
              </Box>
            </>
          )}
        </Card>
      </Modal>
    </div>
  );
}
