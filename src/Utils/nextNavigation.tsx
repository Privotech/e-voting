"use client";

import type { ReactNode } from 'react';
import NextLink from 'next/link';
import { useRouter, usePathname as useNextPathname, useParams as useNextParams } from 'next/navigation';

type LinkProps = Omit<React.ComponentProps<typeof NextLink>, 'href'> & {
  to?: string;
  href?: string;
};

export function Link({ to, href, ...props }: LinkProps) {
  const resolvedHref = href || to;
  return <NextLink href={resolvedHref || '/'} {...props} />;
}

export function useNavigate() {
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  return Object.assign(navigate, {
    push: (path: string) => router.push(path),
    replace: (path: string) => router.replace(path),
    back: () => router.back(),
    forward: () => router.forward(),
    refresh: () => router.refresh(),
  });
}

export function useLocation() {
  const pathname = useNextPathname();
  return {
    pathname,
    query: {},
    search: '',
    hash: '',
  };
}

export function usePathname() {
  return useNextPathname();
}

export function useParams() {
  return useNextParams();
}

export function Navigate({ to, replace }: { to: string; replace?: boolean; state?: unknown }) {
  if (typeof window !== 'undefined') {
    if (replace) {
      window.location.replace(to);
    } else {
      window.location.href = to;
    }
  }
  return null;
}

export function Outlet({ children }: { children?: ReactNode }) {
  return children ?? null;
}
