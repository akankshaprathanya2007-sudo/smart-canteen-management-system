/* ============================================================
   data.js - shared localStorage "database" for the whole app
   Keys used in localStorage:
     canteen_menu    -> array of menu item objects
     canteen_cart    -> array of cart item objects
     canteen_orders  -> array of order objects
   ============================================================ */

const MENU_KEY = "canteen_menu";
const CART_KEY = "canteen_cart";
const ORDERS_KEY = "canteen_orders";

// Runs once: if there is no menu saved yet, seed some starter items
function seedMenuIfEmpty() {
  const existing = localStorage.getItem(MENU_KEY);
  if (existing) return;

  const starterMenu = [
    { id: 1, name: "Veg Biryani", price: 60, category: "Lunch", emoji: "🍛", stock: 20 },
    { id: 2, name: "Chicken Roll", price: 45, category: "Snacks", emoji: "🌯", stock: 15 },
    { id: 3, name: "Masala Dosa", price: 40, category: "Breakfast", emoji: "🥞", stock: 25 },
    { id: 4, name: "Tea", price: 10, category: "Drinks", emoji: "🍵", stock: 50 },
    { id: 5, name: "Samosa", price: 15, category: "Snacks", emoji: "🥟", stock: 30 },
    { id: 6, name: "Curd Rice", price: 35, category: "Lunch", emoji: "🍚", stock: 18 },
  ];
  localStorage.setItem(MENU_KEY, JSON.stringify(starterMenu));
}

// ---------- generic get/set helpers ----------
function getMenu() {
  return JSON.parse(localStorage.getItem(MENU_KEY) || "[]");
}
function saveMenu(menu) {
  localStorage.setItem(MENU_KEY, JSON.stringify(menu));
}
function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function getOrders() {
  return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
}
function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

// ---------- cart operations ----------
function addToCart(itemId) {
  const menu = getMenu();
  const item = menu.find((m) => m.id === itemId);
  if (!item || item.stock <= 0) return;

  const cart = getCart();
  const existing = cart.find((c) => c.id === itemId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
  }
  saveCart(cart);
}

function changeCartQty(itemId, delta) {
  let cart = getCart();
  const entry = cart.find((c) => c.id === itemId);
  if (!entry) return;
  entry.qty += delta;
  if (entry.qty <= 0) {
    cart = cart.filter((c) => c.id !== itemId);
  }
  saveCart(cart);
}

function cartTotal() {
  return getCart().reduce((sum, c) => sum + c.price * c.qty, 0);
}

// ---------- order placement ----------
function placeOrder(customerName) {
  const cart = getCart();
  if (cart.length === 0) return null;

  const menu = getMenu();
  // reduce stock for each ordered item
  cart.forEach((c) => {
    const menuItem = menu.find((m) => m.id === c.id);
    if (menuItem) menuItem.stock = Math.max(0, menuItem.stock - c.qty);
  });
  saveMenu(menu);

  const orders = getOrders();
  const newOrder = {
    id: "ORD" + Date.now().toString().slice(-6),
    customer: customerName || "Guest",
    items: cart,
    total: cartTotal(),
    status: "New",
    time: new Date().toLocaleString(),
  };
  orders.unshift(newOrder);
  saveOrders(orders);
  saveCart([]); // clear cart after order

  return newOrder;
}

function updateOrderStatus(orderId, newStatus) {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (order) order.status = newStatus;
  saveOrders(orders);
}