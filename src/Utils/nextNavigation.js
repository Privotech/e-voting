import NextLink from 'next/link';
import { useRouter, usePathname as useNextPathname, useSearchParams, useParams as useNextParams } from 'next/navigation';

export function Link({ to, href, ...props }) {
  const resolvedHref = href || to;
  return <NextLink href={resolvedHref} {...props} />;
}

export function useNavigate() {
  const router = useRouter();
  return {
    push: (path) => router.push(path),
    replace: (path) => router.replace(path),
    back: () => router.back(),
    forward: () => router.forward(),
    refresh: () => router.refresh(),
  };
}

export function useLocation() {
  const pathname = useNextPathname();
  const searchParams = useSearchParams();
  return {
    pathname,
    query: Object.fromEntries(searchParams),
    search: searchParams.toString(),
    hash: '',
  };
}

export function usePathname() {
  return useNextPathname();
}

export function useParams() {
  return useNextParams();
}

export function Navigate({ to, replace, state }) {
  if (typeof window !== 'undefined') {
    if (replace) {
      window.location.replace(to);
    } else {
      window.location.href = to;
    }
  }
  return null;
}

export function Outlet(props) {
  return props && props.children ? props.children : null;
}
