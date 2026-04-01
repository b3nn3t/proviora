import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { writeFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";

export const dynamic = 'force-dynamic';

// Получить товары
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// Добавить товар
export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("image") as File;

    let fileName = "";

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const safeName = file.name.replace(/\s+/g, "-");
      fileName = `${uuidv4()}-${safeName}`;

      await writeFile(`./public/products/${fileName}`, buffer);
    }

    const rawPrice = String(formData.get("price") || "");
    const price = Number(rawPrice.replace(/[^0-9]/g, ""));

    const product = await prisma.product.create({
      data: {
        name: String(formData.get("name") || ""),
        description: String(formData.get("description") || ""),
        price,
        category: String(formData.get("category") || ""),
        stock: Number(formData.get("stock") || 0),
        isBestseller: formData.get("isBestseller") ? 1 : 0,
        image: fileName ? `/products/${fileName}` : ""
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}