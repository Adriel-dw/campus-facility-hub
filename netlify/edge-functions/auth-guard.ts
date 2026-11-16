import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { jwtVerify } from 'jose';

async function importSpkiKey(pem: string): Promise<CryptoKey> {
  const cleanPem = pem
    .replace(/\\n/g, '\n')
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s+/g, '');
  const binaryDer = Uint8Array.from(atob(cleanPem), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'spki',
    binaryDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
}

export default async function authGuard(request: Request, context: any) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method.toUpperCase();

  if (
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/register') ||
    (method === 'GET' && pathname.startsWith('/api/facilities')) ||
    (method === 'GET' && pathname.startsWith('/api/bookings'))
  ) {
    return context.next();
  }

  if (method === 'POST' && pathname.startsWith('/api/bookings')) {
    const upstashUrl = Deno.env.get('UPSTASH_REDIS_REST_URL');
    const upstashToken = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');

    if (upstashUrl && upstashToken) {
      const redis = new Redis({ url: upstashUrl, token: upstashToken });
      const ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '10 s'),
        analytics: true,
        prefix: 'ratelimit:bookings',
      });

      const clientIp =
        context.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
      const { success, limit, remaining, reset } = await ratelimit.limit(clientIp);

      if (!success) {
        return new Response(
          JSON.stringify({
            error: 'Too many booking requests. Please wait a moment and try again.',
            code: 'RATE_LIMITED',
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString(),
            },
          }
        );
      }
    }
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({
        error: 'Missing or invalid Authorization Bearer token.',
        code: 'UNAUTHORIZED',
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const token = authHeader.split(' ')[1];
  const rawPublicKey = Deno.env.get('JWT_PUBLIC_KEY');

  if (!rawPublicKey) {
    return new Response(
      JSON.stringify({ error: 'Server JWT configuration missing.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const publicKey = await importSpkiKey(rawPublicKey);
    const { payload } = await jwtVerify(token, publicKey, {
      algorithms: ['RS256'],
    });

    const penaltyPoints = Number(payload.penalty_points || 0);

    if (
      method === 'POST' &&
      pathname.startsWith('/api/bookings') &&
      penaltyPoints >= 3
    ) {
      return new Response(
        JSON.stringify({
          error:
            'Account temporarily locked from creating new bookings due to 3 or more No-Show penalty points.',
          code: 'PENALTY_LOCKOUT',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const headers = new Headers(request.headers);
    headers.set('x-user-id', String(payload.sub || ''));
    headers.set('x-user-email', String(payload.email || ''));
    headers.set('x-user-role', String(payload.role || 'BOOKER'));
    headers.set('x-user-dept', String(payload.department_id || ''));
    headers.set('x-user-academic', String(Boolean(payload.is_academic)));
    headers.set('x-user-penalties', String(penaltyPoints));

    return context.next({
      request: new Request(request.url, {
        method: request.method,
        headers,
        body: request.body,
      }),
    });
  } catch {
    return new Response(
      JSON.stringify({
        error: 'Expired or invalid JWT signature.',
        code: 'UNAUTHORIZED',
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
