import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode('proviora-secret-key-2024');

async function checkAdmin(request: Request) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const token = cookie.split('auth-token=')[1]?.split(';')[0];

    if (!token) return false;

    const { payload } = await jwtVerify(token, SECRET_KEY);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as number },
      select: { role: true }
    });

    return user?.role === 'admin';
  } catch (e) {
    return false;
  }
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!(await checkAdmin(request)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return NextResponse.json(users);
}

export async function PATCH(request: Request) {
  if (!(await checkAdmin(request)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { id, role } = await request.json();

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}