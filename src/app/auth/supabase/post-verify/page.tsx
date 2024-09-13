'use client';
import { CONFIG } from 'src/config-global';

import { SupabaseVerifyView } from 'src/sections/auth/supabase';

// ----------------------------------------------------------------------

import { api } from 'backend/trpc/client';
import { useEffect } from 'react';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

export default function Page() {
  const postVerify = api.auth.postVerify.useMutation();
  const router = useRouter();
  useEffect(() => {
    const mutatePostVerify = async () => {
      await postVerify.mutate();
      router.replace(paths.dashboard.root);
    };
    mutatePostVerify();
  }, []);

  return <SupabaseVerifyView />;
}
