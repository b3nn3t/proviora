import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const product = await prisma.product.create({
      data: {
        name: body.name || '',
        description: body.description || '',
        price: parseFloat(body.price || 0),
        image: body.image || '',
        category: body.category || '',
        stock: parseInt(body.stock || 0),
        isBestseller: body.isBestseller ? 1 : 0
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('POST /api/products error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}