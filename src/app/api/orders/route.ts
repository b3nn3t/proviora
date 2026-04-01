import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode('proviora-secret-key-2024');

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('auth-token=')[1]?.split(';')[0];    if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const { items, total_price } = await request.json();

    // Проверка наличия на складе перед оформлением
    for (const item of items) {
      const product = await prisma.product.findUnique({
  where: { id: item.id },
  select: { stock: true, name: true }
});
      if (!product || product.stock < item.quantity) {
        return NextResponse.json({ error: `Недостаточно товара "${product?.name || 'Неизвестно'}" на складе` }, { status: 400 });
      }
    }

    // Уменьшение количества на складе
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.id },
        data: { stock: { decrement: item.quantity } }
      });
    }

    await prisma.order.create({
      data: {
        userId: payload.userId as number,
        totalPrice: total_price,
        items: JSON.stringify(items)
      }
    });
    return NextResponse.json({ success: true });  } catch (error: any) {
    return NextResponse.json({ error: 'Ошибка сервера: ' + error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('auth-token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId as number;
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(orders.map((o: any) => ({
      ...o,
      items: JSON.parse(o.items)
    })));  } catch (error: any) {
    return NextResponse.json({ error: 'Ошибка сервера: ' + error.message }, { status: 500 });
  }
}
