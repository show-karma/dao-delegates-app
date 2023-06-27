import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /fonts (inside /public)
     * 4. /examples (inside /public)
     * 5. all root files inside /public (e.g. /favicon.ico)
     * 6. meta
     */
    '/((?!api|_next|daos|icons|images|meta|wallets|robots.txt|[\\w-]+\\.\\w+).*)',
  ],
};

const getDAOName = (host: string) => host.split('.')[0];

const devUrl = 'dapp.karmahq.xyz';
const DAO_CUSTOM_DOMAIN: Record<string, string | string[]> = {
  [devUrl]: 'moonriver',
  'daostewards.xyz': 'gitcoin',
  'delegate.gitcoin.co': 'gitcoin',
  'delegate.starknet.io': 'starknet',
  'delegate.ssv.network': 'ssvnetwork',
  mint: ['moonriver', 'moonbeam'],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || 'www.karmahq.xyz';
  const currentPathname = url.pathname;
  const rootUrl = hostname.replaceAll(/(www\.)|(:.+)/gi, '');

  let dao = DAO_CUSTOM_DOMAIN[rootUrl] || getDAOName(hostname);

  const usePathname = Array.isArray(dao);

  if (
    !(
      usePathname &&
      Object.values(DAO_CUSTOM_DOMAIN)
        .flat()
        .includes(url.pathname.split('/')[1])
    )
  ) {
    if (rootUrl === devUrl && !Array.isArray(dao)) {
      const daoName = url.searchParams.get('dao');
      dao = daoName ? getDAOName(daoName) : DAO_CUSTOM_DOMAIN[devUrl];
    }

    url.pathname = `/_sites/${dao}${currentPathname}`;
  }
  return NextResponse.rewrite(url);
}
