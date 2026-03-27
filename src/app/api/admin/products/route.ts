import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { jwtVerify } from 'jose';
import { writeFile } from 'fs/promises';
import path from 'path';

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

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const products = await db.product.findMany({    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const is_bestseller = formData.get('is_bestseller') === '1' ? 1 : 0;
    const description = formData.get('description') as string;
    const stock = parseInt(formData.get('stock') as string) || 0;
    const image = formData.get('image') as File | null;

    let imageUrl = null;
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${image.name.replace(/\s+/g, '-')}`;
      const uploadPath = path.join(process.cwd(), 'public', 'uploads', filename);
      await writeFile(uploadPath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    await db.product.create({
      data: {
        name,
        price,
        category,
        isBestseller: is_bestseller,
        description,
        imageUrl,
        stock
      }
    });
    return NextResponse.json({ success: true });  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const formData = await request.formData();
    const id = parseInt(formData.get('id') as string);
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const is_bestseller = formData.get('is_bestseller') === '1' ? 1 : 0;
    const description = formData.get('description') as string;
    const stock = parseInt(formData.get('stock') as string) || 0;
    const image = formData.get('image') as File | null;

    const currentProduct = await db.product.findUnique({
      where: { id },
      select: { imageUrl: true }
    });
    let imageUrl = currentProduct?.imageUrl;

    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${image.name.replace(/\s+/g, '-')}`;
      const uploadPath = path.join(process.cwd(), 'public', 'uploads', filename);
      await writeFile(uploadPath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    await db.product.update({
      where: { id },
      data: {
        name,
        price,
        category,
        isBestseller: is_bestseller,
        description,
        imageUrl,
        stock
      }
    });
    return NextResponse.json({ success: true });  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await request.json();
  await db.product.delete({
    where: { id: parseInt(id) }
  });
  return NextResponse.json({ success: true });
}
