import { NextRequest, NextResponse } from "next/server";
import prisma from "src/lib/prismaClient";
import * as Sentry from '@sentry/nextjs';


const verifyIntegrity = async (mpxn: string, start: string, end: string) => {

}

const iterUpdate = async (mpxn: string, start: string, end: string) => {
  const apiKey = process.env.E3_API_KEY;
  const headers = new Headers();
    
  headers.append('Accept', 'application/json');
  
  if (apiKey) {
    headers.append('x-api-key', apiKey);
  }
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}`;
  };

  let currentStartDate = new Date(
    parseInt(start.substring(0, 4)),
    parseInt(start.substring(4, 6)) - 1,
    parseInt(start.substring(6, 8)),
    parseInt(start.substring(6, 8)),
    parseInt(start.substring(6, 8))
  );

  const endDate = new Date(
    parseInt(end.substring(0, 4)),
    parseInt(end.substring(4, 6)) - 1,
    parseInt(end.substring(6, 8)),
    parseInt(start.substring(8, 10)),
    parseInt(start.substring(10, 12))
  );

  while (currentStartDate < endDate) {
    let currentEndDate = new Date(currentStartDate);
    currentEndDate.setHours(0,0,0,0);
    currentEndDate.setDate(currentEndDate.getDate() + 7);

    if (currentEndDate > endDate) {
      currentEndDate = endDate;
    }

    const formattedStartDate = formatDate(currentStartDate);
    const formattedEndDate = formatDate(currentEndDate);

    console.log(`Fetching meter reading for MPxN ${mpxn} from ${formattedStartDate} to ${formattedEndDate}`);
    // Add your fetch logic here
    const url = `${process.env.E3_API_BASE_URL}/mpxn/${mpxn}/utility/electricity/readingtype/consumption?start=${formattedStartDate}&end=${formattedEndDate}`;

    let attempts = 0;
    const maxRetries = 3;
    let success = false;

    while (attempts < maxRetries && !success) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: headers,
        });

        if (response.status === 200) {
          const data = await response.json();
          // Process the data as needed
          const devices = data.devices;
          for (const device of devices) {
            const deviceId = device.deviceId;
            const meter = await prisma.meter.findFirst({
              where: {
                deviceId: deviceId,
              },
            });

            if(!meter) {
              Sentry.captureException(new Error(`Fatal error: Meter not found for device ${deviceId}, mpxn: ${mpxn}, during iterUpdate`), {level: 'error', tags: {api: 'iterUpdate'}});
              throw new Error(`Fatal error: Meter not found for device ${deviceId}, mpxn: ${mpxn}, during iterUpdate`);
            }

            // insert values into meterReading table
            const meterReadings = device.values;

            for (const meterReading of meterReadings) {
              // sometimes there is a secondaryValue for each reading, if so, add secondaryValue as well, otherwise, add primaryValue
              const timestamp = new Date(meterReading.timestamp);
              await prisma.meterReading.create({
                data: {
                  meterId: meter.id,
                  primaryValue: meterReading.primaryValue,
                  secondaryValue: meterReading.secondaryValue ?? 0,
                  unit: data.unit,
                  timestamp: timestamp,
                },
              });


            }
          }


          success = true;
        } else {
          console.error(`Failed to fetch meter reading for MPxN ${mpxn}, attempt ${attempts + 1}`);
        }

      } catch (error) {
        console.error(`Error fetching data for MPxN ${mpxn} from ${formattedStartDate} to ${formattedEndDate}, attempt ${attempts + 1}:`, error);
      }

      attempts++;
    }

    if (!success) {
      Sentry.captureException(new Error(`Failed to fetch meter reading for MPxN ${mpxn} after ${maxRetries} attempts for period ${formattedStartDate} to ${formattedEndDate}`), {level: 'error', tags: {api: 'updateMeterReadingForMPxNFirstTime'}});
      console.error(`Failed to fetch meter reading for MPxN ${mpxn} after ${maxRetries} attempts`);
    }


    currentStartDate = new Date(currentEndDate);
    currentStartDate.setHours(0,30,0,0);
  }
}

const updateMeterReadingForMPxNFirstTime = async (mpxn: string) => {
  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);
  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - 2);
  startDate.setDate(startDate.getDate() - 28);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}`;
  };

  const formattedEndDate = formatDate(endDate);
  const formattedStartDate = formatDate(startDate);
  const apiKey = process.env.E3_API_KEY;
  console.log(`Fetching meter reading for MPxN ${mpxn} from ${formattedStartDate} to ${formattedEndDate}`);
  const url = `${process.env.E3_API_BASE_URL}/mpxn/${mpxn}/utility/electricity/readingtype/consumption?start=${formattedStartDate}&end=${formattedEndDate}&granularity=halfhour`;
  const headers = new Headers();
  
  headers.append('Accept', 'application/json');
  
  if (apiKey) {
    headers.append('x-api-key', apiKey);
  }

  console.log('url', url);
  const response = await fetch(url, {
    method: 'GET',
    headers: headers,
  });

  if (response.status !== 200) {
    Sentry.captureException(new Error(`Failed to fetch meter reading for MPxN ${mpxn}`), {level: 'error', tags: {api: 'updateMeterReadingForMPxNFirstTime'}});
    throw new Error(`Failed to fetch meter reading for MPxN ${mpxn}`);
  }

  const data = await response.json();
  const devices = data.devices;

  // At this point, the mpxn already link to one meter, we need to find the meter and the site, then we need to check devices for other meters and create the other meters.
  const meter = await prisma.meter.findFirst({
    where: {
      mpxn: {
        mpxn: mpxn,
      },
    },
  });

  if(!meter) {
    Sentry.captureException(new Error(`Meter not found for MPxN ${mpxn}`), {level: 'error', tags: {api: 'updateMeterReadingForMPxNFirstTime'}});
    throw new Error(`Meter not found for MPxN ${mpxn}`);
  }

  const site = await prisma.site.findFirst({
    where: {
      meterId: meter.id,
    },
  });

  if(!site) {
    Sentry.captureException(new Error(`Site not found for MPxN ${mpxn}`), {level: 'error', tags: {api: 'updateMeterReadingForMPxNFirstTime'}});
    throw new Error(`Site not found for MPxN ${mpxn}`);
  }

  if(devices.length > 1) {
    // Create other meters
  const existingDeviceId = meter.deviceId;

  for (const device of devices) {
    if (device.deviceId !== existingDeviceId) {
      await prisma.meter.create({
        data: {
          deviceId: device.deviceId,
          deviceManufacturer: meter.deviceManufacturer,
          deviceModel: meter.deviceModel,
          deviceStatus: meter.deviceStatus,
          deviceType: meter.deviceType,
          addressIdentifier: meter.addressIdentifier,
          postCode: meter.postCode,
          mpxn: {
            connect: {
              id: meter.id,
            },
          },
          sites: {
            connect: {
              id: site.id,
            },
          },
        },
      });
      }
    }
  }

  const availableCacheRange = data.availableCacheRange;
  const availStart = availableCacheRange.start;
  const availEnd = availableCacheRange.end;

  // If end date is more than 3 days ago, raise exception to Sentry
  if (new Date(availEnd) < new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000)) {
    Sentry.captureException(new Error(`End date is more than 3 days ago for MPxN ${mpxn}`), {level: 'error', tags: {api: 'updateMeterReadingForMPxNFirstTime'}});
  }

  const granularity = data.granularity;
  if(granularity !== 'halfhour') {
    Sentry.captureException(new Error(`Granularity is not halfhour for MPxN ${mpxn}, it is ${granularity}`), {level: 'error', tags: {api: 'updateMeterReadingForMPxNFirstTime'}});
  }

  const unit = data.unit;
  if(unit !== 'kWh') {
    Sentry.captureException(new Error(`Unit is not kWh for MPxN ${mpxn}, it is ${unit}`), {level: 'error', tags: {api: 'updateMeterReadingForMPxNFirstTime'}});
  }

  // Before calling iterUpdate, all meters are created.
  await iterUpdate(mpxn, availStart, availEnd);


  
}

const updateMeterReadingForMPxN = async (mpxn: string) => {

  const apiKey = process.env.E3_API_KEY;

  // First of all, find all meters with the given mpxn
  const meters = await prisma.meter.findMany({
    where: {
      mpxn: {
        mpxn: mpxn,
      },
    },
  });

  // find meter readings from table, if no meter readings match meters, send a message to sentry, indicating that it's the first time this meter has been read
  const meterReadings = await prisma.meterReading.findMany({
    where: {
      meterId: {
        in: meters.map(meter => meter.id),
      },
    },
  });

  if (meterReadings.length === 0) {
    Sentry.captureMessage(`Updating mpxn ${mpxn} for the first time`, {
      level: 'info',
    });

    await updateMeterReadingForMPxNFirstTime(mpxn);
  }
  
  

}


const updateMeterReading = async (req: NextRequest) => {
  
  const authToken = (req.headers.get('authorization') || '').split('Bear ').at(1)
  
  const cron_secret = process.env.CRON_SECRET;
  
  if(!authToken || authToken !== cron_secret) {
    return new Response(JSON.stringify({ error: 'Invalid API key' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  

  const sites = await prisma.site.findMany({
    include: {
      meter: {
        select: {
          mpxn: true,
        },
      },
    },
  });

  const mpxns = sites.map(site => site.meter.mpxn);

  for (const mpxn of mpxns) {
    await updateMeterReadingForMPxN(mpxn.mpxn);
  }


  return new Response(JSON.stringify({ message: 'Meter readings updated' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });



}
  

export { updateMeterReading as GET };