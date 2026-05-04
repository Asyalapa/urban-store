/**
 * @module cart-page
 * @description Страница корзины
 * @author Anastasia M. (tg: @asyalapa)
 */

import { cart } from '../modules/cart.js';
import { wishlist } from '../modules/wishlist.js';
import { ui } from '../modules/ui.js';
import { promo } from '../modules/promo.js';
import { initCommon } from '../common.js';
import { formatPrice, escapeHtml } from '../utils/helpers.js';
import { i18n } from '../modules/i18n.js';

class CartPage {
  constructor() {
    this.container = null;
    this.totalEl = null;
    this.promoInput = null;
    this.applyPromoBtn = null;
    this.promoInfo = null;
  }

  /**
   * Инициализация страницы
   */
  async init() {
    // Общая инициализация
    await initCommon({ skipCounters: false });

    // Получаем элементы DOM
    this.container = document.getElementById('cart-container');
    this.totalEl = document.getElementById('total-price');

    if (!this.container) return;

    // Инициализация промокодов
    promo.init();

    // Рендер страницы
    this.render();

    // Инициализация обработчиков
    this.initEventHandlers();
    this.initClearButton();

    // Подписка на изменения корзины
    cart.subscribe(() => this.render());

    // Сохраняем ссылку для обновления при смене языка
    window.cartPageRefresh = () => this.render();
  }

  /**
   * Рендер страницы
   */
  render() {
    const cartItems = cart.getFullCart();

    if (!cartItems.length) {
      this.renderEmpty();
      return;
    }

    this.renderCart(cartItems);
    this.renderPromoSection();
  }

  /**
   * Рендер пустой корзины
   */
  renderEmpty() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🛒</div>
        <h3 class="empty-state__title" data-i18n="cart.empty">${i18n.t('cart.empty')}</h3>
        <p class="empty-state__text">Добавьте товары из каталога</p>
        <a href="index.html" class="button button--primary" data-i18n="cart.go_to_cart">${i18n.t('cart.go_to_cart')}</a>
      </div>
    `;

    if (this.totalEl) this.totalEl.textContent = formatPrice(0);
  }

  /**
   * Рендер списка товаров в корзине
   * @param {Array} cartItems - Товары в корзине
   */
  renderCart(cartItems) {
    if (!this.container) return;

    this.container.innerHTML = cartItems.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img 
          src="${item.image}" 
          alt="${escapeHtml(item.name)}" 
          class="cart-item__image"
          loading="lazy"
        >
        
        <div class="cart-item__info">
          <div class="cart-item__title">${escapeHtml(item.name)}</div>
          <div class="cart-item__category">${escapeHtml(item.category)}</div>
          <div class="cart-item__price">${formatPrice(item.price)}</div>
        </div>
        
        <div class="cart-item__quantity">
          <button class="cart-item__quantity-btn" data-action="decr" aria-label="Уменьшить количество">−</button>
          <input 
            type="number" 
            class="cart-item__quantity-input" 
            value="${item.quantity}" 
            min="1"
            data-action="quantity"
            aria-label="Количество"
          >
          <button class="cart-item__quantity-btn" data-action="incr" aria-label="Увеличить количество">+</button>
        </div>
        
        <div class="cart-item__total">${formatPrice(item.price * item.quantity)}</div>
        
        <button class="cart-item__remove" data-action="remove" aria-label="Удалить товар">✕</button>
      </div>
    `).join('');

    this.updateTotal();
  }

  /**
   * Рендер секции с промокодом
   */
  renderPromoSection() {
    const summary = document.querySelector('.cart-summary');
    if (!summary) return;

    const currentPromo = promo.getCurrentPromo();
    const subtotal = cart.getCartTotal();
    const discount = promo.getCurrentDiscount(subtotal);
    const deliveryCost = promo.getDeliveryCost(subtotal);
    const total = subtotal + deliveryCost - discount;

    // Находим или создаём секцию промокода
    let promoSection = summary.querySelector('.cart-summary__promo');
    if (!promoSection) {
      promoSection = document.createElement('div');
      promoSection.className = 'cart-summary__promo';
      summary.insertBefore(promoSection, summary.querySelector('.cart-summary__row'));
    }

    promoSection.innerHTML = `
      <div class="promo-code">
        <input type="text" id="promo-input" class="promo-code__input" placeholder="${i18n.t('cart.promo_placeholder') || 'Промокод'}" ${currentPromo ? 'disabled' : ''}>
        <button id="apply-promo-btn" class="button button--secondary" ${currentPromo ? 'disabled' : ''}>
          ${i18n.t('cart.apply') || 'Применить'}
        </button>
      </div>
      ${currentPromo ? `
        <div class="promo-code__active">
          ✅ Применён промокод: <strong>${currentPromo.code}</strong> (${currentPromo.description})
          <button id="remove-promo-btn" class="promo-code__remove">✕</button>
        </div>
      ` : ''}
    `;

    // Обновляем итоговую строку
    let totalRow = summary.querySelector('.cart-summary__total-row');
    if (!totalRow) {
      totalRow = document.createElement('div');
      totalRow.className = 'cart-summary__total-row';
      summary.appendChild(totalRow);
    }

    totalRow.innerHTML = `
      <div class="cart-summary__row">
        <span>${i18n.t('cart.subtotal') || 'Товары'}:</span>
        <span>${formatPrice(subtotal)}</span>
      </div>
      ${discount > 0 ? `
        <div class="cart-summary__row cart-summary__row--discount">
          <span>${i18n.t('cart.discount') || 'Скидка'}:</span>
          <span>-${formatPrice(discount)}</span>
        </div>
      ` : ''}
      <div class="cart-summary__row">
        <span>${i18n.t('cart.delivery') || 'Доставка'}:</span>
        <span>${deliveryCost === 0 ? i18n.t('cart.free') || 'Бесплатно' : formatPrice(deliveryCost)}</span>
      </div>
      <div class="cart-summary__total">
        <span>${i18n.t('cart.total') || 'Итого'}:</span>
        <span id="total-price">${formatPrice(total)}</span>
      </div>
    `;

    // Привязываем обработчики промокода
    this.bindPromoHandlers();
  }

  /**
   * Обновление общей суммы
   */
  updateTotal() {
    const total = cart.getCartTotal();
    if (this.totalEl) this.totalEl.textContent = formatPrice(total);
  }

  /**
   * Инициализация обработчиков событий
   */
  initEventHandlers() {
    if (!this.container) return;

    // Делегирование событий на контейнере корзины
    this.container.addEventListener('click', (e) => {
      const item = e.target.closest('.cart-item');
      if (!item) return;

      const id = item.dataset.id;
      const action = e.target.closest('[data-action]')?.dataset.action;

      switch (action) {
        case 'decr':
          cart.updateQuantity(id, -1);
          break;
        case 'incr':
          cart.updateQuantity(id, 1);
          break;
        case 'remove':
          cart.removeFromCart(id);
          ui.showToast(i18n.t('notifications.removed_from_cart'));
          break;
      }
    });

    // Обработка прямого ввода количества
    this.container.addEventListener('change', (e) => {
      const input = e.target.closest('[data-action="quantity"]');
      if (!input) return;

      const item = input.closest('.cart-item');
      if (!item) return;

      const id = item.dataset.id;
      let value = parseInt(input.value, 10);
      if (isNaN(value) || value < 1) value = 1;

      cart.setQuantity(id, value);
    });
  }

  /**
   * Инициализация кнопки очистки корзины
   */
  initClearButton() {
    const summary = document.querySelector('.cart-summary');
    if (!summary || document.getElementById('clear-cart-btn')) return;

    const clearBtn = document.createElement('button');
    clearBtn.id = 'clear-cart-btn';
    clearBtn.className = 'button button--secondary';
    clearBtn.setAttribute('data-i18n', 'cart.clear');
    clearBtn.textContent = i18n.t('cart.clear');

    clearBtn.addEventListener('click', () => {
      if (confirm(i18n.t('cart.clear_confirm') || 'Очистить всю корзину?')) {
        cart.clearCart();
        ui.showToast(i18n.t('notifications.cart_cleared'));
        this.render();
      }
    });

    summary.prepend(clearBtn);
  }

  /**
   * Привязка обработчиков промокода
   */
  bindPromoHandlers() {
    const applyBtn = document.getElementById('apply-promo-btn');
    const promoInput = document.getElementById('promo-input');
    const removeBtn = document.getElementById('remove-promo-btn');

    if (applyBtn && promoInput) {
      const newApplyBtn = applyBtn.cloneNode(true);
      applyBtn.parentNode.replaceChild(newApplyBtn, applyBtn);

      newApplyBtn.addEventListener('click', () => {
        const code = promoInput.value.trim().toUpperCase();
        if (code && promo.applyPromo(code)) {
          ui.showToast(i18n.t('cart.promo_applied') || 'Промокод применён!');
          this.render();
        } else {
          ui.showToast(i18n.t('cart.promo_invalid') || 'Неверный промокод', 'error');
        }
      });
    }

    if (removeBtn) {
      const newRemoveBtn = removeBtn.cloneNode(true);
      removeBtn.parentNode.replaceChild(newRemoveBtn, removeBtn);

      newRemoveBtn.addEventListener('click', () => {
        promo.clearPromo();
        ui.showToast(i18n.t('cart.promo_removed') || 'Промокод удалён');
        this.render();
      });
    }
  }
}

export { CartPage };
