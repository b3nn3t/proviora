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

  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return NextResponse.json(
    orders.map((o: any) => ({
      ...o,
      user_name: o.user.name,
      user_email: o.user.email,
      items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
    }))
  );
}

export async function PATCH(request: Request) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  
  try {
    const { id, status } = await request.json();
    await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
