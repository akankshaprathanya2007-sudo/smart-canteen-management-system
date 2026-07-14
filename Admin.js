/* admin.js - powers admin.html */

document.addEventListener("DOMContentLoaded", () => {
  seedMenuIfEmpty();
  renderDashboard();
  renderOrdersTable();
  renderProductsTable();
});

function switchTab(tab) {
  ["dashboard", "orders", "products"].forEach((t) => {
    document.getElementById("tab-" + t).style.display = t === tab ? "block" : "none";
  });
  document.querySelectorAll(".sidebar nav button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });
  // refresh data every time a tab is opened, since customer page may have changed it
  renderDashboard();
  renderOrdersTable();
  renderProductsTable();
}

/* ---------------- Dashboard ---------------- */
function renderDashboard() {
  const orders = getOrders();
  const newOrders = orders.filter((o) => o.status === "New").length;
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);

  document.getElementById("statsRow").innerHTML = `
    <div class="stat-card"><div class="num">${newOrders}</div><div class="label">New Orders</div></div>
    <div class="stat-card"><div class="num">${orders.length}</div><div class="label">Total Orders</div></div>
    <div class="stat-card"><div class="num">RM ${totalRevenue.toFixed(2)}</div><div class="label">Total Revenue</div></div>
  `;

  const recent = orders.slice(0, 5);
  const table = document.getElementById("recentOrdersTable");
  if (recent.length === 0) {
    table.innerHTML = `<tr><td>No orders yet.</td></tr>`;
    return;
  }
  table.innerHTML = `
    <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Time</th></tr></thead>
    <tbody>
      ${recent
        .map(
          (o) => `
        <tr>
          <td>${o.id}</td>
          <td>${o.customer}</td>
          <td>RM ${o.total.toFixed(2)}</td>
          <td><span class="status-badge status-${o.status}">${o.status}</span></td>
          <td>${o.time}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  `;
}

/* ---------------- Orders tab ---------------- */
function renderOrdersTable() {
  const orders = getOrders();
  const body = document.getElementById("ordersTableBody");
  if (orders.length === 0) {
    body.innerHTML = `<tr><td colspan="6">No orders yet.</td></tr>`;
    return;
  }
  const statuses = ["New", "Preparing", "Ready", "Completed"];
  body.innerHTML = orders
    .map(
      (o) => `
    <tr>
      <td>${o.id}</td>
      <td>${o.customer}</td>
      <td>${o.items.map((i) => i.name + " x" + i.qty).join(", ")}</td>
      <td>RM ${o.total.toFixed(2)}</td>
      <td><span class="status-badge status-${o.status}">${o.status}</span></td>
      <td>
        <select class="status-select" onchange="handleStatusChange('${o.id}', this.value)">
          ${statuses
            .map((s) => `<option value="${s}" ${s === o.status ? "selected" : ""}>${s}</option>`)
            .join("")}
        </select>
      </td>
    </tr>
  `
    )
    .join("");
}

function handleStatusChange(orderId, newStatus) {
  updateOrderStatus(orderId, newStatus);
  renderOrdersTable();
  renderDashboard();
  showToast(`Order ${orderId} marked as ${newStatus}`);
}

/* ---------------- Products tab ---------------- */
function renderProductsTable() {
  const menu = getMenu();
  const body = document.getElementById("productsTableBody");
  if (menu.length === 0) {
    body.innerHTML = `<tr><td colspan="6">No products yet.</td></tr>`;
    return;
  }
  body.innerHTML = menu
    .map(
      (m) => `
    <tr>
      <td>${m.emoji} ${m.name}</td>
      <td>${m.category}</td>
      <td>RM ${m.price.toFixed(2)}</td>
      <td>${m.stock}</td>
      <td>
        <span class="status-badge ${m.stock > 0 ? "status-Ready" : "status-Completed"}">
          ${m.stock > 0 ? "Available" : "Out of Stock"}
        </span>
      </td>
      <td><button class="small-btn" onclick="handleDeleteProduct(${m.id})">Remove</button></td>
    </tr>
  `
    )
    .join("");
}

function handleAddProduct() {
  const name = document.getElementById("newName").value.trim();
  const price = parseFloat(document.getElementById("newPrice").value);
  const category = document.getElementById("newCategory").value.trim() || "Other";
  const emoji = document.getElementById("newEmoji").value.trim() || "🍴";
  const stock = parseInt(document.getElementById("newStock").value) || 0;

  if (!name || isNaN(price)) {
    showToast("Please enter at least a name and price");
    return;
  }

  const menu = getMenu();
  const newId = menu.length > 0 ? Math.max(...menu.map((m) => m.id)) + 1 : 1;
  menu.push({ id: newId, name, price, category, emoji, stock });
  saveMenu(menu);

  // clear the form
  ["newName", "newPrice", "newCategory", "newEmoji", "newStock"].forEach(
    (id) => (document.getElementById(id).value = "")
  );

  renderProductsTable();
  showToast(`${name} added to menu`);
}

function handleDeleteProduct(id) {
  let menu = getMenu();
  menu = menu.filter((m) => m.id !== id);
  saveMenu(menu);
  renderProductsTable();
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}