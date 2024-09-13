import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from 'backend/trpc';
import { createClient } from 'backend/supabase/serverClient';
const handler = async (req: Request) => {
  const response = await fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({
      supabase: createClient(),
    }),
  });

  return response;
};
export { handler as GET, handler as POST };
