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
    if (payload.role === 'admin') return true;
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
  
  const orders = await db.order.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  return NextResponse.json(orders.map((o: any) => ({
    ...o,
    user_name: o.user.name,
    user_email: o.user.email,
    items: JSON.parse(o.items)
  })));
}

export async function PATCH(request: Request) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  
  try {
    const { id, status } = await request.json();
    await db.order.update({
      where: { id: parseInt(id) },
      data: { status }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
