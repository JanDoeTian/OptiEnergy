import { NextRequest, NextResponse } from "next/server";
import prisma from "src/lib/prismaClient";


const updateMeterReadingForMPxN = async (mpxn: string) => {

  const apiKey = process.env.E3_API_KEY;

  // First of all, get the meter reading from database
  const meterReading = await prisma.meterReading.findFirst({
    where: {
      meter: {
        mpxn: mpxn,
      },
    },
  });

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
      meter: true,
    },
  });

  const mpxns = sites.map(site => site.meter.mpxn);



}
  

export { updateMeterReading as GET };