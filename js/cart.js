import { products } from "./data.js";

/* =======================
   STORAGE
======================= */

const CART_KEY = "cart_items";

const getCart = () => JSON.parse(localStorage.getItem(CART_KEY)) || [];
const saveCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart));
const clearCartStorage = () => localStorage.removeItem(CART_KEY);

/* =======================
   DOM
======================= */

const container = document.getElementById("cart-container");
const totalEl = document.getElementById("total-price");

/* =======================
   HELPERS
======================= */

function getFullCart() {
  const cart = getCart();

  return cart.map(item => {
    const product = products.find(p => p.id === item.id);
    return {
      ...product,
      quantity: item.quantity
    };
  });
}

/* =======================
   TOTAL
======================= */

function calculateTotal(cart) {
  return cart.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
}

/* =======================
   EMPTY STATE
======================= */

function renderEmpty() {
  container.innerHTML = `
    <div class="empty">
      <p>Корзина пуста</p>
      <a href="index.html" class="btn">Перейти к покупкам</a>
    </div>
  `;
  totalEl.textContent = "0 ₽";
}

/* =======================
   RENDER
======================= */

function renderCart() {
  const cart = getFullCart();

  if (!cart.length) {
    renderEmpty();
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      
      <img src="${item.image}" width="80" height="80" />

      <div class="cart-item__info">
        <div class="cart-item__title">${item.name}</div>
        <div>${item.price} ₽</div>

        <div class="cart-item__controls">
          <button class="qty-btn minus">−</button>
          <span class="qty">${item.quantity}</span>
          <button class="qty-btn plus">+</button>
        </div>
      </div>

      <div class="cart-item__right">
        <div class="cart-item__total">
          ${item.price * item.quantity} ₽
        </div>

        <button class="remove-btn">✕</button>
      </div>

    </div>
  `).join("");

  const total = calculateTotal(cart);
  totalEl.textContent = `${total} ₽`;
}

/* =======================
   ACTIONS (DELEGATION)
======================= */

container.addEventListener("click", (e) => {
  const itemEl = e.target.closest(".cart-item");
  if (!itemEl) return;

  const id = itemEl.dataset.id;
  let cart = getCart();

  const item = cart.find(i => i.id === id);

  /* PLUS */
  if (e.target.classList.contains("plus")) {
    item.quantity += 1;
  }

  /* MINUS */
  if (e.target.classList.contains("minus")) {
    item.quantity -= 1;

    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
  }

  /* REMOVE */
  if (e.target.classList.contains("remove-btn")) {
    cart = cart.filter(i => i.id !== id);
  }

  saveCart(cart);
  renderCart();
});

/* =======================
   CLEAR BUTTON (optional)
======================= */

const clearBtn = document.createElement("button");
clearBtn.textContent = "Очистить корзину";
clearBtn.className = "btn btn--secondary";

clearBtn.addEventListener("click", () => {
  clearCartStorage();
  renderCart();
});

document.querySelector(".cart-summary").prepend(clearBtn);

/* =======================
   INIT
======================= */

function init() {
  renderCart();
}

init();