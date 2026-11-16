import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { query } from '@/db';
import { signAccessToken } from '@/lib/utils/jwt';
import { UserRole } from '@/types';

const SALT_ROUNDS = 12;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      full_name,
      email,
      password,
      role = 'BOOKER',
      department_id = null,
    } = body;

    if (!full_name || !email || !password || password.length < 6) {
      return NextResponse.json(
        {
          error:
            'full_name, email, and a password of at least 6 characters are required.',
          code: 'UNAUTHORIZED',
        },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const allowedRoles: UserRole[] = ['VIEWER', 'BOOKER', 'CUSTODIAN', 'ADMIN'];
    const safeRole: UserRole = allowedRoles.includes(role) ? role : 'BOOKER';

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const insertResult = await query(
      `INSERT INTO users (full_name, email, password_hash, role, department_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, role, department_id, penalty_points, created_at`,
      [full_name.trim(), normalizedEmail, passwordHash, safeRole, department_id]
    );

    const user = insertResult.rows[0];

    let isAcademic = false;
    if (user.department_id) {
      const deptRes = await query(
        `SELECT is_academic FROM departments WHERE id = $1`,
        [user.department_id]
      );
      isAcademic = Boolean(deptRes.rows[0]?.is_academic);
    }

    const token = await signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      department_id: user.department_id,
      is_academic: isAcademic,
      penalty_points: user.penalty_points,
    });

    return NextResponse.json(
      {
        user,
        token,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.code === '23505') {
      return NextResponse.json(
        { error: 'An account with this email already exists.', code: 'UNAUTHORIZED' },
        { status: 409 }
      );
    }
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Failed to register user.' },
      { status: 500 }
    );
  }
}
