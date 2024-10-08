import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import prisma from 'src/lib/prismaClient';

export const authRouter = router({
  // postVerify happens after the user has verified their email, this will populate user's information into the database
  postVerify: protectedProcedure.mutation(async (opts) => {
    const supabase = opts.ctx.supabase;
    const user = (await supabase.auth.getUser()).data.user;

    if (!user || !user.email || !user.id) {
      throw new Error('User not found');
    }

    const { id, email } = user;

    await prisma.user.create({
      data: {
        id,
        email,
      },
    });

    return { id, email };
  }),
});
