import { NextRequest, NextResponse } from 'next/server';
import prisma from 'src/lib/prismaClient';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function handler(req: NextRequest) {
  try {
    console.log('exchange-token updated at: ', new Date().toISOString());
    const body = await req.json();

    const fpConnectSession1Prisma = await prisma.fPConnectSession.findUnique({
      where: { id: body.fp_id },
    });

    console.log('fpConnectSession1Prisma', fpConnectSession1Prisma);

    // Validate the request body
    if (!body.id || !body.key) {
      return new NextResponse(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const currentTime = new Date();
    const internalKey = await prisma.internalKey.findFirst({
      where: { id: body.id, key: body.key },
    });

    if (!internalKey) {
      return new NextResponse(JSON.stringify({ error: 'Invalid key' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('internalKey.expireAt', internalKey.expireAt);
    if (new Date(internalKey.expireAt) < currentTime) {
      return new NextResponse(JSON.stringify({ error: 'Key has expired' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fp_id = body.fp_id;
    const fpConnectSession = await prisma.fPConnectSession.findUnique({
      where: { id: fp_id },
    });
    console.log('fpConnectSession', fpConnectSession);
    if (!fpConnectSession) {
      return new NextResponse(JSON.stringify({ error: 'FP Connect Session not found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    //TODO: exchange location_id for a token.
    const location_id = 'mock1234567890';

    return new NextResponse(JSON.stringify({ message: 'Key processed successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export { handler as POST };
