import { initTRPC, TRPCError } from '@trpc/server';
import { createClient } from 'backend/supabase/serverClient';
import { ZodError } from 'zod';
import superjson from 'superjson';
// inner context

interface CreateContextOptions {
  supabase: ReturnType<typeof createClient>;
}

export const createInnerTRPCContext = async (opts: CreateContextOptions) => {
  return {
    supabase: opts.supabase,
  };
};

export const createTRPCContext = async () => {
  const supabase = createClient();
  return await createInnerTRPCContext({
    supabase,
  });
};

const trpc = initTRPC.context<CreateContextOptions>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = trpc.router;
export const publicProcedure = trpc.procedure;

const isAuthed = trpc.middleware(async ({ ctx, next }) => {
  const supabase = ctx.supabase;
  const user = (await supabase.auth.getUser()).data.user;
  if (!user || user.role !== 'authenticated') {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      user: user,
    },
  });
});

export const protectedProcedure = trpc.procedure.use(isAuthed);
