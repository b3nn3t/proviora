import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode('proviora-secret-key-2024');

export async function POST(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('auth-token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const { items, total_price } = await request.json();

    // Проверка наличия на складе перед оформлением
    for (const item of items) {
      const product = db.prepare('SELECT stock, name FROM products WHERE id = ?').get(item.id) as any;
      if (!product || product.stock < item.quantity) {
        return NextResponse.json({ error: `Недостаточно товара "${product?.name || 'Неизвестно'}" на складе` }, { status: 400 });
      }
    }

    // Уменьшение количества на складе
    for (const item of items) {
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.id);
    }

    db.prepare('INSERT INTO orders (user_id, total_price, items) VALUES (?, ?, ?)').run(
      payload.userId,
      total_price,
      JSON.stringify(items)
    );    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Ошибка сервера: ' + error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('auth-token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId;
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    return NextResponse.json(orders.map((o: any) => ({
      ...o,
      items: JSON.parse(o.items)
    })));  } catch (error: any) {
    return NextResponse.json({ error: 'Ошибка сервера: ' + error.message }, { status: 500 });
  }
}
