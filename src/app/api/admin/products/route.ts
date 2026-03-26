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
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(payload.userId) as any;
    return user?.role === 'admin';
  } catch (e) {
    return false;
  }
}

export async function GET(request: Request) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
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

    db.prepare('INSERT INTO products (name, price, category, is_bestseller, description, image_url, stock) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      name, price, category, is_bestseller, description, imageUrl, stock
    );
    return NextResponse.json({ success: true });  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const is_bestseller = formData.get('is_bestseller') === '1' ? 1 : 0;
    const description = formData.get('description') as string;
    const stock = parseInt(formData.get('stock') as string) || 0;
    const image = formData.get('image') as File | null;

    const currentProduct = db.prepare('SELECT image_url FROM products WHERE id = ?').get(id) as any;
    let imageUrl = currentProduct?.image_url;

    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${image.name.replace(/\s+/g, '-')}`;
      const uploadPath = path.join(process.cwd(), 'public', 'uploads', filename);
      await writeFile(uploadPath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    db.prepare('UPDATE products SET name = ?, price = ?, category = ?, is_bestseller = ?, description = ?, image_url = ?, stock = ? WHERE id = ?').run(
      name, price, category, is_bestseller, description, imageUrl, stock, id
    );
    return NextResponse.json({ success: true });  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await request.json();
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
