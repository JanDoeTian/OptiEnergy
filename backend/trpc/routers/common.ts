import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import prisma from 'src/lib/prismaClient';
import * as Sentry from '@sentry/nextjs';

export const commonRouter = router({
  postcodeAutocomplete: protectedProcedure
    .input(z.object({ postcode: z.string() }))
    .query(async (opts) => {
      const { postcode } = opts.input;
      const apiKey = process.env.NEXT_PUBLIC_GETADDRESS_API_KEY;
      const response = await fetch(
        `https://api.getaddress.io/autocomplete/${postcode}?api-key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch address data');
      }

      const data = await response.json();
      return data;
    }),

  // fpCallback: publicProcedure.input(z.object({
  //     fp_cot: z.string(),
  //     fp_status: z.string(),
  // }))
  // .query(async (opts) => {
  //     const { fp_cot, fp_status } = opts.input;
  //     const fpConnectSession = await prisma.fPConnectSession.findFirst({
  //         where: {
  //             fp_cot,
  //         },
  //     });

  //     if (!fpConnectSession) {
  //         throw new Error('Connect Session not found');
  //     }

  //     if (fp_status === 'success') {

  //         await prisma.fPConnectSession.update({
  //             where: {
  //                 id: fpConnectSession.id,
  //             },
  //             data: {
  //                 fp_status,
  //             },
  //         });

  //         // TODO: GET location_id
  //         const locationId = "mock123"

  //         try {
  //             await prisma.site.create({
  //                 data: {
  //                     siteName: fpConnectSession.siteName,
  //                     locationId,
  //                     user: {
  //                         connect: { id: fpConnectSession.userId }
  //                     },
  //                     address: {
  //                         connect: { id: fpConnectSession.addressId }
  //                     },
  //                 },
  //             });
  //         } catch (error) {
  //             throw new Error('Failed to create site', error);
  //         }

  //     }else {
  //         await prisma.fPConnectSession.update({
  //             where: {
  //                 id: fpConnectSession.id,
  //             },
  //             data: {
  //                 fp_status: 'fail',
  //             },
  //         });
  //     }
  // }),

  e3GenerateSessionId: protectedProcedure
    .input(
      z.object({
        mpxn: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { mpxn } = opts.input;
      const supabase = opts.ctx.supabase;
      const successURL = 'http://localhost:3000/success';
      const failureURL = 'http://localhost:3000/failure';
      const user = (await supabase.auth.getUser()).data.user;
      const apiKey = process.env.E3_API_KEY;
      const response = await fetch(`${process.env.E3_CONSENT_BASE_URL}/consents/session`, {
        method: 'POST',
        headers: {
          'x-api-key': `${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mpxn,
          getHistoryData: true,
          electricityExportUpdateFrequency: '3h',
          gasUpdateFrequency: '3h',
        }),
      });

      const sessionId = (await response.json()).sessionId;

      const queryStringParams = `sessionId=${sessionId}&successUrl=${successURL}&errorUrl=${failureURL}&automaticDirect=true`;

      const encodedQueryStringParams = Buffer.from(queryStringParams).toString('base64');

      const existingSession = await prisma.e3ConnectSession.findFirst({
        where: {
          status: 'PENDING',
        },
      });

      if (existingSession) {
        return { sessionId: existingSession.id, encodedQueryStringParams };
      } else {
        const newSession = await prisma.e3ConnectSession.create({
          data: {
            status: 'PENDING',
            user: {
              connect: { id: user?.id },
            },
          },
        });

        return { sessionId: newSession.id, encodedQueryStringParams };
      }
    }),

  e3CheckMPXN: protectedProcedure
    .input(
      z.object({
        mpxn: z.string(),
      })
    )
    .mutation(async (opts) => {
      const supabase = opts.ctx.supabase;
      const user = (await supabase.auth.getUser()).data.user;
      Sentry.setUser({email: user?.email})
      const { mpxn } = opts.input;
      const apiKey = process.env.E3_API_KEY;


      // first check if mpxn already exists in MPXN table
      const existingMPXN = await prisma.mPXN.findUnique({
        where: {
          mpxn: mpxn,
        },
      });


      if (existingMPXN) {
        // return existing meters
        const meters = await prisma.meter.findMany({
          where: {
            mpxnId:existingMPXN.id,
          },
          include: {
            mpxn: true,
          },
        });

        
        return { status: 'success', response: meters[0] };
      }


      const response = await fetch(`${process.env.E3_API_BASE_URL}/find-mpxn/${mpxn}`, {
        headers: {
          'x-api-key': `${apiKey}`,
        },
      });
      if (response.status === 200) {
        const meterData = await response.json();


        const mpxnRecord = await prisma.mPXN.create({
          data: {
            mpxn: mpxn,
          },
        });

        const meter = await prisma.meter.create({
          data: {
            deviceId: meterData.deviceId,
            deviceManufacturer: meterData.deviceManufacturer,
            mpxn: {
              connect: {
                id: mpxnRecord.id,
              },
            },
            deviceModel: meterData.deviceModel,
            deviceStatus: meterData.deviceStatus,
            deviceType: meterData.deviceType,
            addressIdentifier: meterData.propertyFilter.addressIdentifier,
            postCode: meterData.propertyFilter.postCode,
          },
          include: {
            mpxn: true,
          },
        });

        return { status: 'success', response: meter };
      } else if (response.status === 400) {
        Sentry.captureException(`Wrong MPxN number: ${mpxn}`)

        return { status: 'wrong MPxN number' };
      } else if (response.status === 404) {
        Sentry.captureException(`Meter not found: ${mpxn}`)
        return {
          status: "We couldn't find your meter, please double check the MPxN number and try again.",
        };
      } else if (response.status === 403) {
        Sentry.captureException(`N3rgy server error: ${mpxn}`)
        return { status: 'server error, please contact support' };
      } else {
        throw new Error('Unexpected error occurred');
      }
      
    }),

  addAddress: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { id } = opts.input;
      const apiKey = process.env.NEXT_PUBLIC_GETADDRESS_API_KEY;
      const existingAddress = await prisma.address.findUnique({
        where: {
          id,
        },
      });

      if (existingAddress) {
        return;
      }
      const response = await fetch(`https://api.getaddress.io/get/${id}?api-key=${apiKey}`);
      const addressData = await response.json();
      await prisma.address.create({
        data: {
          id,
          latitude: addressData.latitude,
          longitude: addressData.longitude,
          formattedAddress: addressData.formatted_address,
          thoroughfare: addressData.thoroughfare,
          buildingName: addressData.building_name,
          subBuildingName: addressData.sub_building_name,
          subBuildingNumber: addressData.sub_building_number,
          buildingNumber: addressData.building_number,
          lineOne: addressData.line_1,
          lineTwo: addressData.line_2,
          lineThree: addressData.line_3,
          lineFour: addressData.line_4,
          postcode: addressData.postcode,
          locality: addressData.locality,
          townOrCity: addressData.town_or_city,
          county: addressData.county,
          district: addressData.district,
          country: addressData.country,
          residential: addressData.residential,
        },
      });
    }),
});
