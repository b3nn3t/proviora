import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const SECRET_KEY = new TextEncoder().encode('proviora-secret-key-2024');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Введите email и пароль' }, { status: 400 });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 });
    }

    // Принудительно обновляем роль в базе для тестового аккаунта
    if (email === 'bennetsamp@gmail.com') {
      db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(user.id);
      user.role = 'admin';
    }

    // Срок действия токена: 30 дней если "Запомнить меня", иначе 24 часа
    const expirationTime = rememberMe ? '30d' : '24h';
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;

    // Создание JWT токена
    const token = await new SignJWT({ userId: user.id, email: user.email, name: user.name, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expirationTime)
      .sign(SECRET_KEY);

    const response = NextResponse.json({ 
      success: true, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    });

    // Установка куки
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: false, // Для локальной разработки
      sameSite: 'lax',
      maxAge: maxAge,
      path: '/',
    });
    return response;
  } catch (error: any) {
    console.error("Login error details:", error);
    return NextResponse.json({ error: error.message || 'Ошибка сервера' }, { status: 500 });
  }
}
