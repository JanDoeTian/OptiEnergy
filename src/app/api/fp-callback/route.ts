import { GET as trpcHandler } from 'src/app/api/trpc/[trpc]/route';

const callTrpcHandler = async (req: Request) => {
  try {
    console.log('callback received at: ', new Date().toISOString());
    const url = new URL(req.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    // Validate query parameters
    // Example: if (!queryParams.someRequiredParam) throw new Error('Missing required parameter');
    const trpcUrl = new URL('/api/trpc/common.fpCallback', req.url);
    trpcUrl.searchParams.set('batch', '1');
    trpcUrl.searchParams.set('input', JSON.stringify({ 0: { json: queryParams } }));

    const response = await fetch(trpcUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add specific headers if needed, avoid forwarding all headers
      },
    });

    if (!response.ok) {
      throw new Error(`TRPC request failed with status ${response.status}`);
    }
    return new Response(JSON.stringify(await response.json()), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in callTrpcHandler:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export { callTrpcHandler as GET };
