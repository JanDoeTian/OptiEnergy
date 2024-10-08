import { ISiteItem } from 'src/types/site';
import { _mock } from './_mock';

export const _sites: ISiteItem[] = [...Array(10)].map((_, index) => ({
  id: _mock.id(index),
  name: _mock.companyNames(index),
  email: _mock.email(index),
  address: _mock.fullAddress(index),
  longitude: [
    -0.1276, -1.2577, -2.2426, -3.1883, -4.2425, -0.1276, -1.2577, -2.2426, -3.1883, -4.2425,
  ][index],
  latitude: [
    51.5074, 51.752, 53.4808, 55.9533, 53.8008, 51.5074, 51.752, 53.4808, 55.9533, 53.8008,
  ][index],
  messages: [
    {
      id: _mock.id(index),
      type: 'info',
      message: 'Smart meter connected',
      createdAt: _mock.time(index),
    },
    {
      id: _mock.id(index),
      type: 'warning',
      message: 'Tariff not connected',
      createdAt: _mock.time(index),
    },
    {
      id: _mock.id(index),
      type: 'warning',
      message: 'Abnormal power consumption, 10% higher than monthly average',
      createdAt: _mock.time(index),
    },
  ],
  createdAt: _mock.time(index),
}));
