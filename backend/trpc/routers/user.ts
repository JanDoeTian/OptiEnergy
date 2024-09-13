import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { CONFIG } from 'backend/backend-config';
import prisma from 'src/lib/prismaClient';

export const userRouter = router({
  getUsers: publicProcedure.query(async () => {
    return await prisma.user.findMany();
  }),

  // addUser: protectedProcedure
  //   .input(z.object({ name: z.string(), race: z.string() }))
  //   .mutation(async (opts) => {
  //     const { input } = opts;
  //     await prisma.user.create({
  //       data: {
  //         name: input.name,
  //         race: input.race,
  //       },
  //     });
  //   }),


  deleteFile: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {
      const { id } = opts.input;
      const supabase = opts.ctx.supabase;
      const user = (await supabase.auth.getUser()).data.user;

      // Find the file to delete
      const fileToDelete = await prisma.userUpload.findUnique({
        where: {
          id,
        },
      });

      if (!fileToDelete) {
        throw new Error('File not found');
      }

      // Delete the file from Supabase storage
      const { error } = await supabase.storage
        .from('app')
        .remove([`${user?.id}/${fileToDelete.fileName}`]);

      if (error) {
        throw new Error(error.message);
      }
      await prisma.userUpload.delete({
        where: {
          id,
        },
      });
    }),

  // Add a file to the user's storage
  addFile: protectedProcedure
    .input(z.object({ name: z.string(), file: z.string() }))
    .mutation(async (opts) => {
      const supabase = opts.ctx.supabase;
      const user = (await supabase.auth.getUser()).data.user;
      const { name, file } = opts.input;
      const buffer = Buffer.from(file, 'base64');

      const userFilesCount = await prisma.userUpload.count({
        where: {
          userId: user?.id,
        },
      });

      if (userFilesCount >= CONFIG.upload.maxNumFiles) {
        throw new Error(`You can only upload up to ${CONFIG.upload.maxNumFiles} files.`);
      }
      
      const { data, error } = await supabase.storage
        .from('app')
        .upload(`${user?.id}/${name}`, buffer);


        if (data) {
          // Create a new user upload record in the database
          await prisma.userUpload.create({
            data: {
              fileId: data.id,
              fileUrl: data.path,
              fileName: name,
              user: {
                connect: {
                  id: user?.id,
                },
              },
            },
          });
        }

      if (error) {
        throw new Error(error.message);
      }

      return;
    }),

  getFiles: protectedProcedure.query(async (opts) => {
    const supabase = opts.ctx.supabase;
    const user = (await supabase.auth.getUser()).data.user;

    const userFiles = await prisma.userUpload.findMany({
      where: {
        userId: user?.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const parsedData = userFiles.map(file => ({
      ...file,
      updatedAt: file.updatedAt.toISOString().split('T')[0], // Extract only the date part
    }));

    return parsedData;
  }),


  newFPConnectSession: protectedProcedure
    .input(z.object({
      addressId: z.string(),
      siteName: z.string(),
    }))
    .mutation(async (opts) => {
      const supabase = opts.ctx.supabase;
      const user = (await supabase.auth.getUser()).data.user;

      // TODO: get this from flatpeak
      // const response = await fetch('https://api.flatpeak.com/connect/tariff/token', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${process.env.FLATPEAK_API_TOKEN}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     direction: 'IMPORT',
      //     type: 'COMMODITY',
      //     customer_id: user.id,
      //     connect_web_uri: 'http://localhost:7070',
      //     callback_uri: env.process.NEXT_PUBLIC_SERVER_URL/api/fp...,
      //     postal_address: {

      //       country_code: 'GB',
      //     },
      //   }),
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to create FP Connect Session');
      // }

      // const data = await response.json();
      // const fp_cot = data.fp_cot;
      // const fp_status = data.fp_status;
      const fp_cot="mock";

      const fpConnectSession = await prisma.fPConnectSession.create({
        data: {
          user: {
            connect: {
              id: user?.id,
            },
          },
          fp_cot,
          addressId: opts.input.addressId,
          siteName: opts.input.siteName,
        },
      });

    return { fp_id: fpConnectSession.id, fp_cot };
    }),

  checkFPConnectSession: protectedProcedure
    .input(z.object({ fp_id: z.string() }))
    .query(async (opts) => {
      const { fp_id } = opts.input;
      const fpConnectSession = await prisma.fPConnectSession.findFirst({
        where: {
          id: fp_id,
        },
      });

      if (!fpConnectSession) {
        throw new Error('Connect Session does not exist');
      }

      return fpConnectSession.fp_status;
    }),

});
