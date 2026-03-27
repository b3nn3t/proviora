import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode('proviora-secret-key-2024');

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('auth-token=')[1]?.split(';')[0];    if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

    const { payload } = await jwtVerify(token, SECRET_KEY);
    const { name } = await request.json();

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Имя слишком короткое' }, { status: 400 });
    }

    await db.user.update({
      where: { id: payload.userId as number },
      data: { name }
    });

    return NextResponse.json({ success: true, name });  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
