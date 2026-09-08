/**
 * Reads the `redirectTo` parameter set when a signed-out reader is bounced to
 * login, so they land back where they were.
 *
 * Only same-site paths are honoured. A value pointing at another origin — or a
 * protocol-relative `//evil.example` — is discarded rather than followed.
 */
export function safeRedirectTo(
  params: URLSearchParams,
  fallback = '/',
): string {
  const target = params.get('redirectTo');

  if (!target || !target.startsWith('/') || target.startsWith('//')) {
    return fallback;
  }

  return target;
}
