import { router } from './trpc';
import { userRouter } from './routers/user';
import { commonRouter } from './routers/common';
import { authRouter } from './routers/auth';

export const appRouter = router({
  user: userRouter,
  common: commonRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
