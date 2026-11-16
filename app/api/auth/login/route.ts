import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { query } from '@/db';
import { signAccessToken } from '@/lib/utils/jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.', code: 'UNAUTHORIZED' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const userRes = await query(
      `SELECT u.id, u.full_name, u.email, u.password_hash, u.role, u.department_id,
              u.penalty_points, u.created_at, COALESCE(d.is_academic, FALSE) AS is_academic
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.email = $1`,
      [normalizedEmail]
    );

    if (userRes.rowCount === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userRow = userRes.rows[0];
    const isPasswordValid = await bcrypt.compare(password, userRow.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const token = await signAccessToken({
      sub: userRow.id,
      email: userRow.email,
      role: userRow.role,
      department_id: userRow.department_id,
      is_academic: Boolean(userRow.is_academic),
      penalty_points: userRow.penalty_points,
    });

    const { password_hash, ...safeUser } = userRow;

    return NextResponse.json({
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed.' },
      { status: 500 }
    );
  }
}
