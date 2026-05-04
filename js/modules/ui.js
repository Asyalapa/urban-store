/**
 * @module ui
 * @description UI компоненты (тост, дравер, анимации)
 */

import { CONFIG } from '../config.js';
import { formatPrice } from '../utils/helpers.js';

/**
 * @class UIModule
 */
class UIModule {
  constructor() {
    this.toast = null;
    this.drawer = null;
    this.isInitialized = false;
  }

  /**
   * Инициализация UI компонентов (вызывать после DOMContentLoaded)
   */
  init() {
    if (this.isInitialized) return;

    this.toast = document.getElementById('toast');
    this.drawer = document.getElementById('drawer');
    this.initDrawerClose();
    this.isInitialized = true;
  }

  /**
   * Инициализация закрытия дровера
   */
  initDrawerClose() {
    const closeBtn = document.getElementById('drawer-close');
    const overlay = document.querySelector('.cart-drawer__overlay');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeDrawer());
    }

    if (overlay) {
      overlay.addEventListener('click', () => this.closeDrawer());
    }
  }

  /**
   * Показать уведомление
   * @param {string} message - Текст уведомления
   * @param {string} type - Тип уведомления (success, error, info)
   */
  showToast(message, type = 'success') {
    if (!this.toast) return;

    this.toast.textContent = message;
    this.toast.classList.add('notification--show');

    // Добавляем тип для стилизации (опционально)
    this.toast.setAttribute('data-type', type);

    setTimeout(() => {
      this.toast.classList.remove('notification--show');
    }, CONFIG.TOAST_DURATION);
  }

  /**
   * Открыть корзину (дровер)
   * @param {Array} cartItems - Товары в корзине
   * @param {Function} renderFn - Функция рендера
   */
  openDrawer(cartItems, renderFn) {
    if (!this.drawer) return;

    if (renderFn) {
      renderFn(cartItems);
    }

    this.drawer.classList.add('cart-drawer--open');
    document.body.style.overflow = 'hidden';

    // Добавляем aria-атрибуты
    this.drawer.setAttribute('aria-hidden', 'false');
  }

  /**
   * Закрыть корзину (дровер)
   */
  closeDrawer() {
    if (!this.drawer) return;

    this.drawer.classList.remove('cart-drawer--open');
    document.body.style.overflow = '';

    this.drawer.setAttribute('aria-hidden', 'true');
  }

  /**
   * Анимация "летящего" изображения
   * @param {HTMLImageElement} img - Элемент изображения
   * @param {string} targetSelector - Селектор цели
   */
  flyToCart(img, targetSelector = '.header__action-button, .header__action-link[href="cart.html"]') {
    const target = document.querySelector(targetSelector);
    if (!target) return;

    const startRect = img.getBoundingClientRect();
    const endRect = target.getBoundingClientRect();

    const clone = img.cloneNode(true);
    clone.style.cssText = `
      position: fixed;
      top: ${startRect.top}px;
      left: ${startRect.left}px;
      width: ${startRect.width}px;
      height: ${startRect.height}px;
      object-fit: cover;
      border-radius: 8px;
      z-index: 9999;
      pointer-events: none;
      transition: transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.4s ease;
    `;

    document.body.appendChild(clone);

    // Принудительный reflow, чтобы браузер применил начальные стили перед анимацией
    void clone.offsetHeight;

    const deltaX = endRect.left + endRect.width / 2 - (startRect.left + startRect.width / 2);
    const deltaY = endRect.top + endRect.height / 2 - (startRect.top + startRect.height / 2);
    const scale = 0.2;

    clone.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;
    clone.style.opacity = '0';

    setTimeout(() => {
      clone.remove();
    }, 500);
  }

  /**
   * Рендер скелетона
   * @param {HTMLElement} container - Контейнер
   * @param {number} count - Количество элементов
   */
  renderSkeleton(container, count = CONFIG.SKELETON_COUNT) {
    if (!container) return;

    container.innerHTML = Array(count).fill('').map(() => `
      <div class="card">
        <div class="card__image-wrapper">
          <div class="skeleton skeleton--image"></div>
        </div>
        <div class="card__body">
          <div class="skeleton skeleton--title"></div>
          <div class="skeleton skeleton--price"></div>
          <div class="skeleton skeleton--button"></div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Обновить бейджики счётчиков
   * @param {number} cartCount - Количество в корзине
   * @param {number} wishlistCount - Количество в избранном
   */
  updateCounters(cartCount, wishlistCount) {
    const cartBadge = document.getElementById('cart-count');
    const wishlistBadge = document.getElementById('wishlist-count');

    if (cartBadge) cartBadge.textContent = cartCount;
    if (wishlistBadge) wishlistBadge.textContent = wishlistCount;
  }
}

// Экспортируем единственный экземпляр
export const ui = new UIModule();