import { TRPCProvider } from 'backend/trpc/TRPCProvider';
import { AuthSplitLayout } from 'src/layouts/auth-split';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <TRPCProvider>
      <AuthSplitLayout>{children}</AuthSplitLayout>
    </TRPCProvider>
  );
}
