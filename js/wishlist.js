import { products } from "./data.js";

/* =======================
   STORAGE
======================= */

const WISHLIST_KEY = "wishlist_items";
const CART_KEY = "cart_items";

const getWishlist = () => JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
const saveWishlist = (list) => localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));

const getCart = () => JSON.parse(localStorage.getItem(CART_KEY)) || [];
const saveCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart));

/* =======================
   DOM
======================= */

const container = document.getElementById("wishlist-container");
const addAllBtn = document.getElementById("add-all-to-cart");

/* =======================
   HELPERS
======================= */

function getWishlistProducts() {
  const ids = getWishlist();
  return products.filter(p => ids.includes(p.id));
}

/* =======================
   EMPTY STATE
======================= */

function renderEmpty() {
  container.innerHTML = `
    <div class="empty">
      <p>Избранное пусто</p>
      <a href="index.html" class="btn">Перейти в каталог</a>
    </div>
  `;

  if (addAllBtn) addAllBtn.style.display = "none";
}

/* =======================
   RENDER
======================= */

function renderWishlist() {
  const list = getWishlistProducts();

  if (!list.length) {
    renderEmpty();
    return;
  }

  if (addAllBtn) addAllBtn.style.display = "block";

  container.innerHTML = list.map(product => `
    <div class="card" data-id="${product.id}">
      <img src="${product.image}" class="card__image" />

      <div class="card__body">
        <div class="card__title">${product.name}</div>

        <div class="price">
          <span class="price__current">${product.price} ₽</span>
          <span class="price__old">${product.oldPrice} ₽</span>
        </div>

        <div class="card__actions">
          <button class="btn add-to-cart">
            В корзину
          </button>

          <button class="btn btn--secondary remove-from-wishlist">
            Удалить
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

/* =======================
   ACTIONS (DELEGATION)
======================= */

container.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;

  const id = card.dataset.id;

  /* REMOVE FROM WISHLIST */
  if (e.target.classList.contains("remove-from-wishlist")) {
    let list = getWishlist();
    list = list.filter(item => item !== id);

    saveWishlist(list);
    renderWishlist();
  }

  /* ADD TO CART */
  if (e.target.classList.contains("add-to-cart")) {
    let cart = getCart();

    const existing = cart.find(item => item.id === id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id, quantity: 1 });
    }

    saveCart(cart);

    // (опционально) можно сразу убрать из избранного
    let list = getWishlist().filter(item => item !== id);
    saveWishlist(list);

    renderWishlist();
  }
});

/* =======================
   ADD ALL TO CART
======================= */

if (addAllBtn) {
  addAllBtn.addEventListener("click", () => {
    let cart = getCart();
    const wishlist = getWishlist();

    wishlist.forEach(id => {
      const existing = cart.find(item => item.id === id);

      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ id, quantity: 1 });
      }
    });

    saveCart(cart);
    saveWishlist([]);

    renderWishlist();
  });
}

/* =======================
   INIT
======================= */

function init() {
  renderWishlist();
}

init();