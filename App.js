/* app.js - powers index.html (customer ordering page) */

let activeCategory = "All";

document.addEventListener("DOMContentLoaded", () => {
  seedMenuIfEmpty();
  renderCategories();
  renderMenu();
  renderCart();
});

function renderCategories() {
  const menu = getMenu();
  const categories = ["All", ...new Set(menu.map((m) => m.category))];
  const wrap = document.getElementById("categoryTabs");
  wrap.innerHTML = categories
    .map(
      (cat) => `
      <button class="cat-tab ${cat === activeCategory ? "active" : ""}"
        onclick="setCategory('${cat}')">${cat}</button>
    `
    )
    .join("");
}

function setCategory(cat) {
  activeCategory = cat;
  renderCategories();
  renderMenu();
}

function renderMenu() {
  const menu = getMenu();
  const filtered =
    activeCategory === "All" ? menu : menu.filter((m) => m.category === activeCategory);

  const grid = document.getElementById("menuGrid");
  if (filtered.length === 0) {
    grid.innerHTML = `<p class="empty-msg">No items in this category yet.</p>`;
    return;
  }

  grid.innerHTML = filtered
    .map(
      (item) => `
    <div class="food-card">
      <div class="emoji">${item.emoji}</div>
      <div class="info">
        <div class="name">${item.name}</div>
        <div class="price">RM ${item.price.toFixed(2)}</div>
        <div class="stock-tag">${item.stock > 0 ? item.stock + " left" : "Out of stock"}</div>
        <button class="add-btn" ${item.stock <= 0 ? "disabled" : ""}
          onclick="handleAdd(${item.id})">
          ${item.stock <= 0 ? "Unavailable" : "Add to cart"}
        </button>
      </div>
    </div>
  `
    )
    .join("");
}

function handleAdd(itemId) {
  addToCart(itemId);
  renderCart();
  renderMenu(); // stock display could change once ordered later, keep menu fresh
  showToast("Added to cart");
}

function renderCart() {
  const cart = getCart();
  document.getElementById("cartCount").textContent = cart.reduce((s, c) => s + c.qty, 0);

  const list = document.getElementById("cartItemsList");
  if (cart.length === 0) {
    list.innerHTML = `<p class="empty-msg">Your cart is empty</p>`;
  } else {
    list.innerHTML = cart
      .map(
        (c) => `
      <div class="cart-item">
        <div>
          <div style="font-weight:600">${c.name}</div>
          <div style="color:#6B7280;font-size:0.85rem">RM ${c.price.toFixed(2)} x ${c.qty}</div>
        </div>
        <div class="qty-controls" style="display:flex;gap:6px;align-items:center;">
          <button onclick="handleQty(${c.id}, -1)">-</button>
          <span>${c.qty}</span>
          <button onclick="handleQty(${c.id}, 1)">+</button>
        </div>
      </div>
    `
      )
      .join("");
  }

  document.getElementById("cartTotalAmount").textContent = "RM " + cartTotal().toFixed(2);
  document.getElementById("placeOrderBtn").disabled = cart.length === 0;
}

function handleQty(itemId, delta) {
  changeCartQty(itemId, delta);
  renderCart();
}

function openCart() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("overlay").classList.add("open");
}
function closeCart() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("overlay").classList.remove("open");
}

function handlePlaceOrder() {
  const name = document.getElementById("customerName").value.trim();
  const order = placeOrder(name);
  if (!order) return;

  renderCart();
  renderMenu();
  closeCart();
  showToast(`Order ${order.id} placed! Track it in the admin panel.`);
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}