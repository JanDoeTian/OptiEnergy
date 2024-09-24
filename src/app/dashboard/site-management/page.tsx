import { CONFIG } from 'src/config-global';

import { SiteListView } from 'src/sections/site-management/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Site Management | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <SiteListView />;
}
