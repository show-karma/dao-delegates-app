import { useEffect, useState } from 'react';

/**
 * Checks if the app is mounted
 * @returns boolean
 */
export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  });

  return mounted;
}
