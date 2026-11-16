import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { UserRole } from '@/types';

export interface CustomJWTPayload extends JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
  department_id: string | null;
  is_academic: boolean;
  penalty_points: number;
}

const ALG = 'RS256';

function normalizePem(pem: string | undefined, keyName: string): string {
  if (!pem) {
    throw new Error(`${keyName} is missing from environment variables`);
  }
  return pem.replace(/\\n/g, '\n').trim();
}

async function getPrivateKey(): Promise<CryptoKey> {
  const pem = normalizePem(process.env.JWT_PRIVATE_KEY, 'JWT_PRIVATE_KEY');
  const pemContents = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

export async function getPublicKey(rawPublicKey?: string): Promise<CryptoKey> {
  const pem = normalizePem(
    rawPublicKey || process.env.JWT_PUBLIC_KEY,
    'JWT_PUBLIC_KEY'
  );
  const pemContents = pem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s+/g, '');
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    'spki',
    binaryDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
}

export async function signAccessToken(
  payload: Omit<CustomJWTPayload, 'iat' | 'exp'>
): Promise<string> {
  const privateKey = await getPrivateKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(privateKey);
}

export async function verifyAccessToken(
  token: string,
  rawPublicKey?: string
): Promise<CustomJWTPayload> {
  const publicKey = await getPublicKey(rawPublicKey);
  const { payload } = await jwtVerify(token, publicKey, {
    algorithms: [ALG],
  });
  return payload as CustomJWTPayload;
}
