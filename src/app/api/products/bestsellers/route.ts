import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const products = db.prepare('SELECT * FROM products WHERE is_bestseller = 1 ORDER BY created_at DESC').all();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Fetch bestsellers error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
