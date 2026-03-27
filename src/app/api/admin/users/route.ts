import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode('proviora-secret-key-2024');

async function checkAdmin(request: Request) {
  try {
    const cookieStore = request.headers.get('cookie');
    const token = cookieStore?.split('auth-token=')[1]?.split(';')[0];
    if (!token) return false;
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const user = await db.user.findUnique({
      where: { id: payload.userId as number },
      select: { role: true }
    });
    return user?.role === 'admin';
  } catch (e) {
    return false;
  }
}

export async function GET(request: Request) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(users);
}

export async function PATCH(request: Request) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id, role } = await request.json();
  await db.user.update({
    where: { id: parseInt(id) },
    data: { role }
  });
  return NextResponse.json({ success: true });
}
