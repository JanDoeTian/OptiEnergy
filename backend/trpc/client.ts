import { createTRPCReact } from '@trpc/react-query';
import { AppRouter } from '.';
export const api = createTRPCReact<AppRouter>({});
