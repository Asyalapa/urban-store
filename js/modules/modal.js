/**
 * @module modal
 * @description Модальное окно для детального просмотра товара
 * @author Anastasia M. (tg: @asyalapa)
 */

import { formatPrice, escapeHtml } from '../utils/helpers.js';
import { cart } from './cart.js';
import { wishlist } from './wishlist.js';
import { inventory } from './inventory.js';
import { ui } from './ui.js';
import { i18n } from './i18n.js';

class ProductModal {
  constructor() {
    this.modal = null;
    this.isOpen = false;
    this.currentProduct = null;
    this.init();
  }

  /**
   * Инициализация модального окна
   */
  init() {
    this.createModal();
    this.bindEvents();
  }

  /**
   * Создание DOM-элемента модального окна
   */
  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal';
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-hidden', 'true');
    this.modal.setAttribute('aria-labelledby', 'modal-title');

    // Используем data-i18n атрибуты для динамических переводов
    this.modal.innerHTML = `
    <div class="modal__overlay"></div>
    <div class="modal__container">
      <button class="modal__close" aria-label="Закрыть">✕</button>
      
      <div class="modal__content">
        <div class="modal__image-wrapper">
          <img class="modal__image" alt="">
        </div>
        
        <div class="modal__info">
          <h2 id="modal-title" class="modal__title"></h2>
          
          <div class="modal__price">
            <span class="modal__price-current"></span>
            <span class="modal__price-old"></span>
          </div>
          
          <div class="modal__stock">
            <span class="modal__stock-status"></span>
          </div>
          
          <div class="modal__description">
            <p data-i18n="modal.description"></p>
          </div>
          
          <div class="modal__actions">
            <button class="modal__add-to-cart button button--primary" data-i18n="catalog.add_to_cart">
              ${i18n.t('catalog.add_to_cart')}
            </button>
            <button class="modal__wishlist button button--secondary">
              🤍 ${i18n.t('catalog.add_to_wishlist')}
            </button>
          </div>
          
          <div class="modal__details">
            <h3 data-i18n="modal.specifications"></h3>
            <dl>
              <dt data-i18n="modal.category"></dt>
              <dd class="modal__category"></dd>
              <dt data-i18n="modal.sku"></dt>
              <dd class="modal__sku"></dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  `;

    document.body.appendChild(this.modal);
  }

  /**
   * Привязка событий
   */
  bindEvents() {
    // Закрытие по клику на overlay или кнопку закрытия
    const overlay = this.modal.querySelector('.modal__overlay');
    const closeBtn = this.modal.querySelector('.modal__close');

    overlay?.addEventListener('click', () => this.close());
    closeBtn?.addEventListener('click', () => this.close());

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Кнопки в модалке
    const addToCartBtn = this.modal.querySelector('.modal__add-to-cart');
    const wishlistBtn = this.modal.querySelector('.modal__wishlist');

    addToCartBtn?.addEventListener('click', () => this.handleAddToCart());
    wishlistBtn?.addEventListener('click', () => this.handleWishlist());
  }

  /**
   * Открыть модальное окно с товаром
   * @param {Object} product - Товар для отображения
   */
  open(product) {
    if (!product) return;

    this.currentProduct = product;
    this.updateContent(product);

    this.modal.classList.add('modal--open');
    this.modal.setAttribute('aria-hidden', 'false');
    this.isOpen = true;

    // Блокируем скролл body
    document.body.style.overflow = 'hidden';

    // Фокус на модалку
    this.modal.focus();
  }

  /**
   * Закрыть модальное окно
   */
  close() {
    this.modal.classList.remove('modal--open');
    this.modal.setAttribute('aria-hidden', 'true');
    this.isOpen = false;

    // Восстанавливаем скролл
    document.body.style.overflow = '';
  }

  /**
   * Обновить содержимое модального окна
   * @param {Object} product - Товар
   */
  updateContent(product) {
    const inWishlist = wishlist.isInWishlist(product.id);
    // Проверяем наличие из инвентаря или используем inStock
    const qty = inventory.getQuantity(product.id, 100);
    const isInStock = product.inStock && qty > 0;

    // Изображение
    const modalImage = this.modal.querySelector('.modal__image');
    if (modalImage) {
      modalImage.src = product.image;
      modalImage.alt = escapeHtml(product.name);
    }

    // Название
    const title = this.modal.querySelector('#modal-title');
    if (title) title.textContent = product.name;

    // Цена
    const priceCurrent = this.modal.querySelector('.modal__price-current');
    const priceOld = this.modal.querySelector('.modal__price-old');

    if (priceCurrent) priceCurrent.textContent = formatPrice(product.price);
    if (priceOld) {
      if (product.oldPrice) {
        priceOld.textContent = formatPrice(product.oldPrice);
        priceOld.style.display = 'inline';
      } else {
        priceOld.style.display = 'none';
      }
    }

    // Наличие
    const stockStatus = this.modal.querySelector('.modal__stock-status');
    if (stockStatus) {
      stockStatus.textContent = isInStock ? `✅ В наличии (${qty} шт.)` : '❌ Нет в наличии';
      stockStatus.className = `modal__stock-status modal__stock-status--${isInStock ? 'in' : 'out'}`;
    }

    // Кнопки
    const addToCartBtn = this.modal.querySelector('.modal__add-to-cart');
    if (addToCartBtn) {
      addToCartBtn.disabled = !isInStock;
      addToCartBtn.textContent = i18n.t('catalog.add_to_cart');
    }

    // Кнопка избранного
    const wishlistBtn = this.modal.querySelector('.modal__wishlist');
    if (wishlistBtn) {
      wishlistBtn.textContent = inWishlist ? '❤️ ' + i18n.t('catalog.remove_from_wishlist') : '🤍 ' + i18n.t('catalog.add_to_wishlist');
    }

    // Категория и артикул
    const categoryEl = this.modal.querySelector('.modal__category');
    const skuEl = this.modal.querySelector('.modal__sku');

    if (categoryEl) categoryEl.textContent = product.category;
    if (skuEl) skuEl.textContent = product.id;
  }

  /**
   * Обработка добавления в корзину
   */
  handleAddToCart() {
    if (!this.currentProduct) return;
    
    const qty = inventory.getQuantity(this.currentProduct.id, 100);
    if (qty <= 0) return;

    cart.addToCart(this.currentProduct.id);
    ui.showToast(i18n.t('notifications.added_to_cart'));
    ui.updateCounters(cart.getCartCount(), wishlist.getWishlistCount());

    // Анимация полёта
    const modalImage = this.modal.querySelector('.modal__image');
    if (modalImage && modalImage.complete) {
      ui.flyToCart(modalImage);
    }
  }

  /**
   * Обработка избранного
   */
  handleWishlist() {
    if (!this.currentProduct) return;

    const isAdded = wishlist.toggleWishlist(this.currentProduct.id);
    const btn = this.modal.querySelector('.modal__wishlist');

    if (btn) {
      btn.textContent = isAdded ? '❤️ ' + i18n.t('catalog.remove_from_wishlist') : '🤍 ' + i18n.t('catalog.add_to_wishlist');
    }

    ui.showToast(isAdded ? i18n.t('notifications.added_to_wishlist') : i18n.t('notifications.removed_from_wishlist'));
    ui.updateCounters(cart.getCartCount(), wishlist.getWishlistCount());
  }
}

// Создаём экземпляр
export const productModal = new ProductModal();

/**
 * Инициализация открытия модалки по клику на карточку
 * @param {HTMLElement} container - Контейнер с карточками
 * @param {Array} products - Массив товаров
 */
export const initModalOnCards = (container, products) => {
  if (!container) return;

  container.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;

    const productId = card.dataset.id;
    const product = products.find(p => p.id === productId);

    if (product) {
      productModal.open(product);
    }
  });
};