import { CONFIG } from 'src/config-global';

import SiteCreateView from 'src/sections/site-management/view/site-create-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Create a new post | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <SiteCreateView />;
}
