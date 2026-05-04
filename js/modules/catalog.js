/**
 * @module catalog
 * @description Фильтрация, сортировка и рендер каталога
 */

import { loadProducts } from '../data/products-loader.js';
import { formatPrice, debounce, escapeHtml } from '../utils/helpers.js';
import { cart } from './cart.js';
import { wishlist } from './wishlist.js';
import { inventory } from './inventory.js';
import { ui } from './ui.js';
import { i18n } from './i18n.js';

/**
 * @class CatalogModule
 */
class CatalogModule {
  constructor() {
    this.container = null;
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.currentSort = 'default';
    this.isLoading = false;
    this.products = [];
  }

  /**
   * Инициализация каталога
   * @param {HTMLElement} container - Контейнер для товаров
   */
  async init(container) {
    this.container = container;
    this.products = await loadProducts();
    this.initEventListeners();
    this.updateView();
  }

  /**
   * Инициализация обработчиков событий
   */
  initEventListeners() {
    // Категории
    const nav = document.querySelector('.nav');
    if (nav) {
      nav.addEventListener('click', (e) => {
        const btn = e.target.closest('.nav__link');
        if (!btn) return;

        document.querySelectorAll('.nav__link').forEach(b => {
          b.classList.remove('nav__link--active');
          b.setAttribute('aria-pressed', 'false');
        });

        btn.classList.add('nav__link--active');
        btn.setAttribute('aria-pressed', 'true');

        this.currentCategory = btn.dataset.category;
        this.updateView();
      });
    }

    // Поиск
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      const debouncedSearch = debounce((value) => {
        this.searchQuery = value;
        this.updateView();
      }, 300);

      searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
      });
    }

    // Сортировка
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.updateView();
      });
    }

    // Обработка кликов на карточках (делегирование)
    if (this.container) {
      this.container.addEventListener('click', (e) => this.handleCardClick(e));
    }
  }

  /**
   * Получить обработанный список товаров (фильтр + поиск + сортировка)
   * @returns {Array} Отфильтрованный и отсортированный массив
   */
  getProcessedProducts() {
    let list = [...this.products];

    // Фильтр по категории
    if (this.currentCategory !== 'all') {
      list = list.filter(p => p.category === this.currentCategory);
    }

    // Поиск
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(query));
    }

    // Сортировка
    switch (this.currentSort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // По умолчанию - по ID
        list.sort((a, b) => a.id.localeCompare(b.id));
    }

    return list;
  }

  /**
   * Рендер товаров
   * @param {Array} productsList - Список товаров
   */
  renderProducts(productsList) {
    if (!this.container) return;

    if (productsList.length === 0) {
      this.renderEmpty();
      return;
    }

    this.container.innerHTML = productsList.map(product => {
      const inWishlist = wishlist.isInWishlist(product.id);
      const qty = inventory.getQuantity(product.id, 100);
      const isAvailable = product.inStock && qty > 0;

      return `
        <article class="card" data-id="${product.id}" data-category="${product.category}">
          <div class="card__image-wrapper">
            <img 
              data-src="${product.image}" 
              class="card__image lazy"
              alt="${escapeHtml(product.name)}"
              loading="lazy"
            />
          </div>
          
          <div class="card__body">
            <h3 class="card__title">${escapeHtml(product.name)}</h3>
            
            <div class="card__price">
              <span class="card__price-current">${formatPrice(product.price)}</span>
              ${product.oldPrice ? `<span class="card__price-old">${formatPrice(product.oldPrice)}</span>` : ''}
            </div>
            
            <div class="card__actions">
              <button class="button button--primary add-to-cart-btn" 
                      ${!isAvailable ? 'disabled' : ''}
                      data-id="${product.id}">
                ${i18n.t('catalog.add_to_cart')}
              </button>
              
              <button class="button button--secondary wishlist-btn" 
                      data-id="${product.id}"
                      aria-label="${inWishlist ? i18n.t('catalog.remove_from_wishlist') : i18n.t('catalog.add_to_wishlist')}">
                ${inWishlist ? '❤️' : '🤍'}
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    this.initLazyLoading();
  }

  /**
   * Рендер пустого состояния
   */
  renderEmpty() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state__icon">🔍</div>
        <h3 class="empty-state__title" data-i18n="catalog.empty_title">${i18n.t('catalog.empty_title')}</h3>
        <p class="empty-state__text" data-i18n="catalog.empty_text">${i18n.t('catalog.empty_text')}</p>
      </div>
    `;
  }

  /**
   * Обновить отображение каталога
   */
  updateView() {
    if (this.isLoading) return;

    this.isLoading = true;
    ui.renderSkeleton(this.container);

    // Имитация загрузки (для плавности)
    setTimeout(() => {
      const processed = this.getProcessedProducts();
      this.renderProducts(processed);
      this.isLoading = false;
    }, 300);
  }

  /**
   * Инициализация ленивой загрузки изображений
   */
  initLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    const lazyImages = document.querySelectorAll('img.lazy');
    lazyImages.forEach(img => imageObserver.observe(img));
  }

  /**
   * Обработка кликов на карточках
   * @param {Event} e
   */
  handleCardClick(e) {
    const card = e.target.closest('.card');
    if (!card) return;

    const productId = card.dataset.id;
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    // Добавление в корзину
    if (e.target.closest('.add-to-cart-btn')) {
      if (!product.inStock) {
        ui.showToast(i18n.t('notifications.out_of_stock'), 'error');
        return;
      }

      cart.addToCart(productId);

      const img = card.querySelector('.card__image');
      if (img && img.complete) {
        ui.flyToCart(img);
      }

      ui.showToast(i18n.t('notifications.added_to_cart'));
      ui.updateCounters(cart.getCartCount(), wishlist.getWishlistCount());
    }

    // Избранное
    if (e.target.closest('.wishlist-btn')) {
      const btn = e.target.closest('.wishlist-btn');
      const isAdded = wishlist.toggleWishlist(productId);

      btn.textContent = isAdded ? '❤️' : '🤍';
      btn.setAttribute('aria-label', isAdded ? i18n.t('catalog.remove_from_wishlist') : i18n.t('catalog.add_to_wishlist'));

      ui.showToast(isAdded ? i18n.t('notifications.added_to_wishlist') : i18n.t('notifications.removed_from_wishlist'));
      ui.updateCounters(cart.getCartCount(), wishlist.getWishlistCount());
    }
  }

  /**
 * Рендер содержимого дровера
 * @param {Array} cartItems
 */
  renderDrawerContent(cartItems) {
    const drawerItems = document.getElementById('drawer-items');
    const drawerTotal = document.getElementById('drawer-total');

    if (!drawerItems || !drawerTotal) return;

    if (cartItems.length === 0) {
      drawerItems.innerHTML = `
      <div class="empty-state">
        <p data-i18n="cart.empty">${i18n.t('cart.empty')}</p>
      </div>
    `;
      drawerTotal.textContent = '0 ₽';
      return;
    }

    drawerItems.innerHTML = cartItems.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img src="${item.image}" alt="${escapeHtml(item.name)}" class="cart-item__image">
      <div class="cart-item__info">
        <div class="cart-item__title">${escapeHtml(item.name)}</div>
        <div class="cart-item__price">${formatPrice(item.price)}</div>
        <div class="cart-item__quantity">
          <button class="cart-item__quantity-btn" data-action="decr">−</button>
          <span class="cart-item__quantity-value">${item.quantity}</span>
          <button class="cart-item__quantity-btn" data-action="incr">+</button>
        </div>
      </div>
      <button class="cart-item__remove" data-action="remove" aria-label="${i18n.t('cart.remove')}">✕</button>
    </div>
  `).join('');

    const total = cart.getCartTotal();
    drawerTotal.textContent = formatPrice(total);

    // Делегирование событий (один обработчик на весь контейнер)
    if (!drawerItems.hasAttribute('data-handler-attached')) {
      drawerItems.setAttribute('data-handler-attached', 'true');
      drawerItems.addEventListener('click', (e) => {
        const item = e.target.closest('.cart-item');
        if (!item) return;

        const productId = item.dataset.id;
        const action = e.target.closest('[data-action]')?.dataset.action;

        switch (action) {
          case 'decr':
            cart.updateQuantity(productId, -1);
            this.updateDrawer();
            break;
          case 'incr':
            cart.updateQuantity(productId, 1);
            this.updateDrawer();
            break;
          case 'remove':
            cart.removeFromCart(productId);
            this.updateDrawer();
            break;
        }
      });
    }
  }

  /**
   * Обновление дровера
   */
  updateDrawer() {
    ui.openDrawer(cart.getFullCart(), this.renderDrawerContent.bind(this));
    ui.updateCounters(cart.getCartCount(), wishlist.getWishlistCount());
  }
}
// Экспортируем единственный экземпляр
export const catalog = new CatalogModule();