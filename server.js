const express = require("express");
const cors = require("cors");
const { v4: uuid } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

// =========================
// Базы данных в памяти
// =========================
let products = [
  { id: uuid(), name: "T-Shirt", price: 25, size: "M", image: "" },
  { id: uuid(), name: "Hoodie", price: 60, size: "L", image: "" }
];

let cart = []; // { id, product_id, quantity }

// =========================
// PRODUCTS API
// =========================

// Получить все товары
app.get("/products", (req, res) => {
  res.json(products);
});

// Добавить товар
app.post("/products", (req, res) => {
  const { name, price, size, image } = req.body;
  if (!name || !price) return res.status(400).json({ error: "Name и price обязательны" });

  const newProduct = { id: uuid(), name, price, size, image };
  products.push(newProduct);
  res.json(newProduct);
});

// Удалить товар
app.delete("/products/:id", (req, res) => {
  const before = products.length;
  products = products.filter(p => p.id !== req.params.id);
  if (before === products.length) return res.status(404).json({ error: "Product not found" });

  res.json({ deleted: req.params.id });
});

// =========================
// CART API
// =========================

// Получить корзину
app.get("/cart", (req, res) => {
  const detailedCart = cart.map(item => {
    const product = products.find(p => p.id === item.product_id);
    return { ...item, product };
  });
  res.json(detailedCart);
});

// Добавить товар в корзину
app.post("/cart", (req, res) => {
  // Поддерживаем оба варианта: объект или массив
  const items = req.body.items || [req.body];

  const added = items.map(it => {
    if (!it.product_id) return null;
    const item = { id: uuid(), product_id: it.product_id, quantity: it.quantity || 1 };
    cart.push(item);
    return item;
  }).filter(Boolean);

  if (!added.length) return res.status(400).json({ error: "Ни один товар не добавлен" });
  res.json(added.length === 1 ? added[0] : added);
});

// Изменить количество
app.patch("/cart/:id", (req, res) => {
  const item = cart.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Cart item not found" });
  if (req.body.quantity !== undefined) item.quantity = req.body.quantity;
  res.json(item);
});

// Удалить товар из корзины
app.delete("/cart/:id", (req, res) => {
  const before = cart.length;
  cart = cart.filter(i => i.id !== req.params.id);
  if (before === cart.length) return res.status(404).json({ error: "Cart item not found" });

  res.json({ deleted: req.params.id });
});

// Очистить корзину
app.delete("/cart", (req, res) => {
  cart = [];
  res.json({ message: "Cart cleared" });
});

// =========================
// Запуск сервера
// =========================
const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});
