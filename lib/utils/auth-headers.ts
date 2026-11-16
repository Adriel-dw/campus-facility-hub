import { NextRequest } from 'next/server';
import { verifyAccessToken, CustomJWTPayload } from './jwt';
import { UserRole } from '@/types';

export interface RequestUserContext {
  userId: string;
  email: string;
  role: UserRole;
  departmentId: string | null;
  isAcademic: boolean;
  penaltyPoints: number;
}

export async function getAuthenticatedUser(
  req: NextRequest
): Promise<RequestUserContext | null> {
  const edgeUserId = req.headers.get('x-user-id');
  const edgeRole = req.headers.get('x-user-role') as UserRole | null;

  if (edgeUserId && edgeRole) {
    return {
      userId: edgeUserId,
      email: req.headers.get('x-user-email') || '',
      role: edgeRole,
      departmentId: req.headers.get('x-user-dept') || null,
      isAcademic: req.headers.get('x-user-academic') === 'true',
      penaltyPoints: parseInt(req.headers.get('x-user-penalties') || '0', 10),
    };
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload: CustomJWTPayload = await verifyAccessToken(token);
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      departmentId: payload.department_id,
      isAcademic: payload.is_academic,
      penaltyPoints: payload.penalty_points,
    };
  } catch {
    return null;
  }
}
