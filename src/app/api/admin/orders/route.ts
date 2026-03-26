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
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(payload.userId) as any;
    return user?.role === 'admin';
  } catch (e) {
    return false;
  }
}

export async function GET(request: Request) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  
  const orders = db.prepare(`
    SELECT orders.*, users.name as user_name, users.email as user_email 
    FROM orders 
    JOIN users ON orders.user_id = users.id 
    ORDER BY orders.created_at DESC
  `).all();
  
  return NextResponse.json(orders.map((o: any) => ({
    ...o,
    items: JSON.parse(o.items)
  })));
}

export async function PATCH(request: Request) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  
  try {
    const { id, status } = await request.json();
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
