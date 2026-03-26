import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'proviora.db');
const db = new Database(dbPath);

// Создание таблиц
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price TEXT NOT NULL,
    category TEXT NOT NULL,
    rating REAL DEFAULT 5.0,
    reviews INTEGER DEFAULT 0,
    is_bestseller INTEGER DEFAULT 0,
    image_url TEXT,
    stock INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total_price TEXT,
    status TEXT DEFAULT 'Принят',
    items TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Принудительное добавление колонок, если их нет
try {
  db.prepare("ALTER TABLE products ADD COLUMN description TEXT").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0").run();
} catch (e) {}
// Обновление таблицы заказов (проверка структуры)
try {
  db.prepare("SELECT items FROM orders LIMIT 1").get();
} catch (e) {
  db.exec("DROP TABLE IF EXISTS orders");
  db.exec(`
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      total_price TEXT,
      status TEXT DEFAULT 'Принят',
      items TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}

// Создание тестового аккаунта
const createInitialData = () => {
  const email = 'bennetsamp@gmail.com';
  const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!existingUser) {
    const hashedPassword = bcrypt.hashSync('123123', 10);
    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
      'Admin User',
      email,
      hashedPassword,
      'admin'
    );
  }
};

createInitialData();

export default db;
