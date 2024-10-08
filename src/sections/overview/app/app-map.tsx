import type { MapProps } from 'react-map-gl';

import { useState } from 'react';

import Typography from '@mui/material/Typography';

import { Image } from 'src/components/image';
import { FlagIcon } from 'src/components/iconify';
import { Map, MapPopup, MapMarker, MapControl } from 'src/components/map';
import { countries as COUNTRIES } from 'src/_mock/_map/countries';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
// ----------------------------------------------------------------------

type CountryProps = {
  name: string;
  capital: string;
  latlng: number[];
  photoUrl: string;
  timezones: string[];
  country_code: string;
};

export function AppMap() {
  const [popupInfo, setPopupInfo] = useState<CountryProps | null>(null);
  const data = COUNTRIES;

  return (
    <Card
      sx={{
        zIndex: 0,
        height: 480,
        overflow: 'hidden',
        position: 'relative', // Assuming theme.shape.borderRadius is 4px
      }}
    >
      <Map
        initialViewState={{ latitude: 54.224201, longitude: -2.963678, zoom: 4.3 }}
        minZoom={1}
        mapStyle={'mapbox://styles/mapbox/light-v10'}
      >
        <MapControl />

        {data.map((city, index) => (
          <MapMarker
            key={`marker-${index}`}
            latitude={city.latlng[0]}
            longitude={city.latlng[1]}
            onClick={(event) => {
              event.originalEvent.stopPropagation();
              setPopupInfo(city);
            }}
          />
        ))}

        {popupInfo && (
          <MapPopup
            latitude={popupInfo.latlng[0]}
            longitude={popupInfo.latlng[1]}
            onClose={() => setPopupInfo(null)}
          >
            <Box gap={0.75} display="flex" alignItems="center" sx={{ mb: 1 }}>
              <FlagIcon code={popupInfo.country_code} />

              <Typography variant="subtitle2">{popupInfo.name}</Typography>
            </Box>

            <Typography component="div" variant="caption">
              Timezones: {popupInfo.timezones}
            </Typography>

            <Typography component="div" variant="caption">
              Lat: {popupInfo.latlng[0]}
            </Typography>

            <Typography component="div" variant="caption">
              Long: {popupInfo.latlng[1]}
            </Typography>

            <Image
              alt={popupInfo.name}
              src={popupInfo.photoUrl}
              ratio="4/3"
              sx={{ mt: 1, borderRadius: 1 }}
            />
          </MapPopup>
        )}
      </Map>
    </Card>
  );
}
