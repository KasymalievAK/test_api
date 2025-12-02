// main.js — каталог
const API = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("add-product-form");
  if (form) form.addEventListener("submit", onAddProduct);
  loadProducts();
});

async function loadProducts() {
  try {
    const res = await fetch(`${API}/products`);
    if (!res.ok) throw new Error("fetch products failed " + res.status);
    const products = await res.json();
    const container = document.getElementById("products");
    container.innerHTML = "";

    products.forEach(p => {
      const html = `
      <div class="product">
        <img src="${escape(p.image) || 'https://via.placeholder.com/600x400?text=No+Image'}" alt="${escape(p.name)}">
        <h3>${escape(p.name)}</h3>
        <div class="muted">${p.price} ₽ — Размер: ${escape(p.size || '-')}</div>
        <button onclick="addToCart('${p.id}')">В корзину</button>
        <div style="height:8px"></div>
        <button onclick="deleteProduct('${p.id}')">Удалить товар</button>
      </div>`;
      container.insertAdjacentHTML("beforeend", html);
    });
  } catch (e) {
    console.error(e);
    document.getElementById("products").innerHTML = "<p>Ошибка загрузки товаров</p>";
  }
}

async function onAddProduct(e) {
  e.preventDefault();
  const name = document.getElementById("p-name").value.trim();
  const price = Number(document.getElementById("p-price").value);
  const size = document.getElementById("p-size").value.trim();
  const image = document.getElementById("p-image").value.trim();

  if (!name || !price) return alert("Заполните название и цену");

  try {
    const res = await fetch(`${API}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price, size, image })
    });
    if (!res.ok) throw new Error("add product failed");
    document.getElementById("add-product-form").reset();
    await loadProducts();
  } catch (err) {
    console.error(err);
    alert("Не удалось добавить товар");
  }
}

async function addToCart(productId) {
  try {
    const res = await fetch(`${API}/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, quantity: 1 })
    });
    if (!res.ok) throw new Error("add to cart failed");
    alert("Добавлено в корзину");
  } catch (e) {
    console.error(e);
    alert("Ошибка при добавлении в корзину");
  }
}

async function deleteProduct(id) {
  if (!confirm("Удалить товар?")) return;
  try {
    const res = await fetch(`${API}/products/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("delete failed");
    await loadProducts();
  } catch (e) {
    console.error(e);
    alert("Ошибка при удалении товара");
  }
}

function escape(s){ return s ? String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) : ""; }
