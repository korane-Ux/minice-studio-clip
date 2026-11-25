const PUBLIC_PREFIXES = ['/connexion', '/auth/', '/brand/'];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => (p.endsWith('/') ? pathname.startsWith(p) : pathname === p || pathname.startsWith(`${p}/`)));
}
