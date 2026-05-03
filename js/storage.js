/* =======================
   KEYS
======================= */

const KEYS = {
  CART: "cart_items",
  WISHLIST: "wishlist_items"
};

/* =======================
   BASE (универсальные)
======================= */

function get(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Storage parse error:", e);
    return [];
  }
}

function set(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function remove(key) {
  localStorage.removeItem(key);
}

/* =======================
   CART
======================= */

export function getCart() {
  return get(KEYS.CART);
}

export function saveCart(cart) {
  set(KEYS.CART, cart);
}

export function addToCart(id, qty = 1) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);

  if (item) {
    item.quantity += qty;
  } else {
    cart.push({ id, quantity: qty });
  }

  saveCart(cart);
  return cart;
}

export function updateQuantity(id, delta) {
  let cart = getCart();
  const item = cart.find(i => i.id === id);

  if (!item) return cart;

  item.quantity += delta;

  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== id);
  }

  saveCart(cart);
  return cart;
}

export function removeFromCart(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  return cart;
}

export function clearCart() {
  remove(KEYS.CART);
}

/* =======================
   WISHLIST
======================= */

export function getWishlist() {
  return get(KEYS.WISHLIST);
}

export function saveWishlist(list) {
  set(KEYS.WISHLIST, list);
}

export function toggleWishlist(id) {
  let list = getWishlist();

  if (list.includes(id)) {
    list = list.filter(i => i !== id);
  } else {
    list.push(id);
  }

  saveWishlist(list);
  return list;
}

export function removeFromWishlist(id) {
  const list = getWishlist().filter(i => i !== id);
  saveWishlist(list);
  return list;
}

export function clearWishlist() {
  remove(KEYS.WISHLIST);
}

/* =======================
   HELPERS
======================= */

export function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function isInCart(id) {
  return getCart().some(item => item.id === id);
}

export function isInWishlist(id) {
  return getWishlist().includes(id);
}