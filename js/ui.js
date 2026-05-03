import { products } from "./data.js";
import {
  addToCart,
  toggleWishlist,
  getCart,
  getCartCount,
  getWishlist,
  isInWishlist
} from "./storage.js";

/* =======================
   DOM
======================= */

const container = document.getElementById("products-container");
const cartCountEl = document.getElementById("cart-count");
const wishlistCountEl = document.getElementById("wishlist-count");
const toast = document.getElementById("toast");

const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const nav = document.querySelector(".nav");

const drawer = document.getElementById("drawer");
const drawerItems = document.getElementById("drawer-items");
const drawerTotal = document.getElementById("drawer-total");

/* =======================
   STATE
======================= */

let currentCategory = "all";
let searchQuery = "";
let currentSort = "default";

/* =======================
   UTILS
======================= */

function formatPrice(n) {
  return n.toLocaleString("ru-RU") + " ₽";
}

/* =======================
   DEBOUNCE
======================= */

function debounce(fn, delay = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

/* =======================
   SKELETON
======================= */

function renderSkeleton(count = 8) {
  container.innerHTML = Array(count).fill("").map(() => `
    <div class="card">
      <div class="skeleton" style="height:200px;"></div>
      <div class="card__body">
        <div class="skeleton" style="height:20px;width:70%;"></div>
        <div class="skeleton" style="height:20px;width:40%;"></div>
      </div>
    </div>
  `).join("");
}

/* =======================
   PIPELINE (FILTER → SEARCH → SORT)
======================= */

function getProcessedProducts() {
  let list = [...products];

  if (currentCategory !== "all") {
    list = list.filter(p => p.category === currentCategory);
  }

  if (searchQuery) {
    list = list.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  switch (currentSort) {
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "name":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  return list;
}

/* =======================
   RENDER PRODUCTS
======================= */

function renderProducts(list) {
  container.innerHTML = list.map(p => {
    const inWishlist = isInWishlist(p.id);

    return `
      <div class="card" data-id="${p.id}">
        <img 
          data-src="${p.image}" 
          class="card__image lazy"
        />

        <div class="card__body">
          <div class="card__title">${p.name}</div>

          <div class="price">
            <span class="price__current">${formatPrice(p.price)}</span>
            <span class="price__old">${formatPrice(p.oldPrice)}</span>
          </div>

          <div class="card__actions">
            <button class="btn add-to-cart" ${!p.inStock ? "disabled" : ""}>
              ${p.inStock ? "В корзину" : "Нет в наличии"}
            </button>

            <button class="btn btn--secondary wishlist-btn">
              ${inWishlist ? "❤️" : "🤍"}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  initLazyLoading();
}

/* =======================
   UPDATE VIEW
======================= */

function updateView() {
  renderSkeleton();

  setTimeout(() => {
    renderProducts(getProcessedProducts());
  }, 300);
}

/* =======================
   COUNTERS
======================= */

function updateCounters() {
  cartCountEl.textContent = getCartCount();
  wishlistCountEl.textContent = getWishlist().length;
}

/* =======================
   TOAST
======================= */

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

/* =======================
   LAZY LOADING
======================= */

function initLazyLoading() {
  const images = document.querySelectorAll("img.lazy");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;

      const img = e.target;
      img.src = img.dataset.src;
      img.classList.remove("lazy");
    });
  });

  images.forEach(img => observer.observe(img));
}

/* =======================
   FLY ANIMATION
======================= */

function flyToCart(img) {
  const cartIcon = document.querySelector('a[href="cart.html"]');

  const a = img.getBoundingClientRect();
  const b = cartIcon.getBoundingClientRect();

  const clone = img.cloneNode();
  clone.classList.add("fly-image");

  Object.assign(clone.style, {
    position: "fixed",
    top: a.top + "px",
    left: a.left + "px",
    width: "60px",
    height: "60px",
    zIndex: 9999,
    transition: "transform 0.7s ease, opacity 0.7s"
  });

  document.body.appendChild(clone);

  requestAnimationFrame(() => {
    clone.style.transform = `
      translate(${b.left - a.left}px, ${b.top - a.top}px)
      scale(0.2)
    `;
    clone.style.opacity = "0";
  });

  setTimeout(() => clone.remove(), 700);
}

/* =======================
   DRAWER
======================= */

function renderDrawer() {
  const cart = getCart();

  if (!cart.length) {
    drawerItems.innerHTML = "<p>Пусто</p>";
    drawerTotal.textContent = "0 ₽";
    return;
  }

  const full = cart.map(i => {
    const p = products.find(x => x.id === i.id);
    return { ...p, quantity: i.quantity };
  });

  drawerItems.innerHTML = full.map(i => `
    <div>${i.name} × ${i.quantity}</div>
  `).join("");

  const total = full.reduce((s, i) => s + i.price * i.quantity, 0);
  drawerTotal.textContent = formatPrice(total);
}

function openDrawer() {
  renderDrawer();
  drawer.classList.add("open");

  setTimeout(() => {
    drawer.classList.remove("open");
  }, 2500);
}

/* =======================
   EVENTS
======================= */

/* CATEGORY */
if (nav) {
  nav.addEventListener("click", (e) => {
    if (!e.target.classList.contains("nav__link")) return;

    document.querySelectorAll(".nav__link")
      .forEach(b => b.classList.remove("active"));

    e.target.classList.add("active");

    currentCategory = e.target.dataset.category;
    updateView();
  });
}

/* SEARCH (debounced) */
if (searchInput) {
  const runSearch = debounce(val => {
    searchQuery = val;
    updateView();
  }, 300);

  searchInput.addEventListener("input", e => {
    runSearch(e.target.value);
  });
}

/* SORT */
if (sortSelect) {
  sortSelect.addEventListener("change", e => {
    currentSort = e.target.value;
    updateView();
  });
}

/* CARD ACTIONS */
container.addEventListener("click", e => {
  const card = e.target.closest(".card");
  if (!card) return;

  const id = card.dataset.id;

  /* ADD TO CART */
  if (e.target.classList.contains("add-to-cart")) {
    const img = card.querySelector("img");

    addToCart(id);
    updateCounters();

    flyToCart(img);

    showToast("Добавлено в корзину");

    e.target.textContent = "Добавлено";
    e.target.disabled = true;

    setTimeout(() => {
      e.target.textContent = "В корзину";
      e.target.disabled = false;
    }, 1200);

    openDrawer();
  }

  /* WISHLIST */
  if (e.target.classList.contains("wishlist-btn")) {
    const list = toggleWishlist(id);

    e.target.textContent = list.includes(id) ? "❤️" : "🤍";

    updateCounters();

    showToast(
      list.includes(id)
        ? "Добавлено в избранное"
        : "Удалено из избранного"
    );
  }
});

/* DRAWER OPEN */
document.querySelector('a[href="cart.html"]')
  ?.addEventListener("click", e => {
    e.preventDefault();
    openDrawer();
  });

/* =======================
   INIT
======================= */

function init() {
  updateView();
  updateCounters();
}

init();