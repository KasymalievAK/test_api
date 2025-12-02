const API = "http://localhost:3000";

window.updateQuantity = updateQuantity;
window.deleteCartItem = deleteCartItem;
window.clearCart = clearCart;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("clear-cart")?.addEventListener("click", clearCart);
  loadCart();
});

async function loadCart() {
  const res = await fetch(`${API}/cart`);
  const items = await res.json();
  const container = document.getElementById("cart");
  container.innerHTML = "";

  if (!items.length) {
    container.innerHTML = "<p>Корзина пуста</p>";
    return;
  }

  items.forEach(i => {
    const p = i.product;
    container.insertAdjacentHTML("beforeend", `
      <div class="cart-item">
        <img src="${p?.image || 'https://via.placeholder.com/100'}" alt="${p?.name || ''}">
        <div class="info">
          <h3>${p?.name || ''}</h3>
          <p>${p?.price || 0} ₽</p>
        </div>
        <div class="controls">
          <input type="number" min="1" value="${i.quantity}" onchange="updateQuantity('${i.id}', this.value)">
          <button onclick="deleteCartItem('${i.id}')">Удалить</button>
        </div>
      </div>
    `);
  });
}

async function updateQuantity(id, qty) {
  const q = Number(qty);
  if (q < 1) return deleteCartItem(id);
  await fetch(`${API}/cart/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity: q })
  });
  loadCart();
}

async function deleteCartItem(id) {
  if (!confirm("Удалить из корзины?")) return;
  await fetch(`${API}/cart/${id}`, { method: "DELETE" });
  loadCart();
}

async function clearCart() {
  if (!confirm("Очистить всю корзину?")) return;
  await fetch(`${API}/cart`, { method: "DELETE" });
  loadCart();
}
