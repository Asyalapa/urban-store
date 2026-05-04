/**
 * @module checkout-page
 * @description Страница оформления заказа
 * @author Anastasia M. (tg: @asyalapa)
 */

import { cart } from '../modules/cart.js';
import { auth } from '../modules/auth.js';
import { promo } from '../modules/promo.js';
import { ui } from '../modules/ui.js';
import { initCommon } from '../common.js';
import { formatPrice, escapeHtml } from '../utils/helpers.js';
import { i18n } from '../modules/i18n.js';

class CheckoutPage {
  constructor() {
    this.form = null;
    this.summaryContainer = null;
    this.isSubmitting = false;
  }

  /**
   * Инициализация страницы
   */
  async init() {
    // Проверка авторизации
    if (!auth.isAuthenticated()) {
      localStorage.setItem('redirect_after_login', 'checkout.html');
      window.location.href = 'login.html';
      return;
    }

    // Общая инициализация (без счётчиков, они не нужны на этой странице)
    await initCommon({ skipCounters: true });

    // Получаем контейнеры
    this.formContainer = document.getElementById('checkout-form-container');
    this.summaryContainer = document.getElementById('order-summary');

    // Проверяем, есть ли товары в корзине
    const cartItems = cart.getFullCart();
    if (cartItems.length === 0) {
      this.renderEmpty();
      return;
    }

    // Инициализация промокодов
    promo.init();

    // Рендер страницы
    this.renderForm();
    this.renderSummary();
    this.bindEvents();
  }

  /**
   * Рендер пустой корзины
   */
  renderEmpty() {
    const container = document.querySelector('.checkout-layout');
    if (container) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-state__icon">🛒</div>
          <h3 class="empty-state__title">${i18n.t('cart.empty')}</h3>
          <p class="empty-state__text">Нет товаров для оформления заказа</p>
          <a href="index.html" class="button button--primary">${i18n.t('cart.go_to_cart')}</a>
        </div>
      `;
    }
  }

  /**
   * Рендер формы оформления
   */
  renderForm() {
    if (!this.formContainer) return;

    const user = auth.getUser();

    this.formContainer.innerHTML = `
      <form id="checkout-form" class="checkout-form">
        <div class="checkout-form__section">
          <h3>${i18n.t('checkout.contact_info') || 'Контактная информация'}</h3>
          
          <div class="checkout-form__row">
            <div class="checkout-form__field">
              <label>${i18n.t('checkout.name') || 'Имя'} *</label>
              <input type="text" id="checkout-name" value="${escapeHtml(user?.name || '')}" required>
            </div>
            
            <div class="checkout-form__field">
              <label>${i18n.t('checkout.phone') || 'Телефон'} *</label>
              <input type="tel" id="checkout-phone" placeholder="+7 (___) ___-__-__" required>
            </div>
          </div>
          
          <div class="checkout-form__field">
            <label>${i18n.t('checkout.email') || 'Email'} *</label>
            <input type="email" id="checkout-email" value="${escapeHtml(user?.email || '')}" required>
          </div>
        </div>
        
        <div class="checkout-form__section">
          <h3>${i18n.t('checkout.delivery_address') || 'Адрес доставки'}</h3>
          
          <div class="checkout-form__field">
            <label>${i18n.t('checkout.city') || 'Город'}</label>
            <input type="text" id="checkout-city" placeholder="${i18n.t('checkout.city_placeholder') || 'Москва'}" value="Москва">
          </div>
          
          <div class="checkout-form__field">
            <label>${i18n.t('checkout.address') || 'Улица, дом, квартира'} *</label>
            <input type="text" id="checkout-address" placeholder="${i18n.t('checkout.address_placeholder') || 'ул. Тверская, д. 1, кв. 1'}" required>
          </div>
          
          <div class="checkout-form__row">
            <div class="checkout-form__field">
              <label>${i18n.t('checkout.entrance') || 'Подъезд'}</label>
              <input type="text" id="checkout-entrance" placeholder="1">
            </div>
            
            <div class="checkout-form__field">
              <label>${i18n.t('checkout.floor') || 'Этаж'}</label>
              <input type="text" id="checkout-floor" placeholder="3">
            </div>
            
            <div class="checkout-form__field">
              <label>${i18n.t('checkout.intercom') || 'Код домофона'}</label>
              <input type="text" id="checkout-intercom" placeholder="1234">
            </div>
          </div>
          
          <div class="checkout-form__field">
            <label>${i18n.t('checkout.comment') || 'Комментарий к заказу'}</label>
            <textarea id="checkout-comment" rows="3" placeholder="${i18n.t('checkout.comment_placeholder') || 'Дополнительная информация'}"></textarea>
          </div>
        </div>
        
        <div class="checkout-form__section">
          <h3>${i18n.t('checkout.payment_method') || 'Способ оплаты'}</h3>
          
          <div class="checkout-form__payment">
            <label class="payment-option">
              <input type="radio" name="payment" value="card" checked>
              <span>💳 ${i18n.t('checkout.payment_card') || 'Банковская карта (онлайн)'}</span>
            </label>
            <label class="payment-option">
              <input type="radio" name="payment" value="cash">
              <span>💰 ${i18n.t('checkout.payment_cash') || 'Наличные при получении'}</span>
            </label>
            <label class="payment-option">
              <input type="radio" name="payment" value="sbp">
              <span>📱 ${i18n.t('checkout.payment_sbp') || 'СБП (Система быстрых платежей)'}</span>
            </label>
          </div>
        </div>
      </form>
    `;
  }

  /**
   * Рендер сводки заказа
   */
  renderSummary() {
    if (!this.summaryContainer) return;

    const cartItems = cart.getFullCart();
    const subtotal = cart.getCartTotal();
    const deliveryCost = promo.getDeliveryCost(subtotal);
    const discount = promo.getCurrentDiscount(subtotal);
    const total = subtotal + deliveryCost - discount;
    const currentPromo = promo.getCurrentPromo();

    this.summaryContainer.innerHTML = `
      <div class="order-summary">
        <h3>${i18n.t('checkout.your_order') || 'Ваш заказ'}</h3>
        
        <div class="order-summary__items">
          ${cartItems.map(item => `
            <div class="order-summary__item">
              <span>${escapeHtml(item.name)} × ${item.quantity}</span>
              <span>${formatPrice(item.price * item.quantity)}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="order-summary__row">
          <span>${i18n.t('cart.subtotal') || 'Товары'}:</span>
          <span>${formatPrice(subtotal)}</span>
        </div>
        
        ${discount > 0 ? `
          <div class="order-summary__row order-summary__row--discount">
            <span>${i18n.t('cart.discount') || 'Скидка'}:</span>
            <span>-${formatPrice(discount)}</span>
          </div>
        ` : ''}
        
        <div class="order-summary__row">
          <span>${i18n.t('cart.delivery') || 'Доставка'}:</span>
          <span>${deliveryCost === 0 ? i18n.t('cart.free') || 'Бесплатно' : formatPrice(deliveryCost)}</span>
        </div>
        
        <div class="order-summary__total">
          <span>${i18n.t('cart.total') || 'Итого к оплате'}:</span>
          <span>${formatPrice(total)}</span>
        </div>
        
        <div class="order-summary__promo">
          <input type="text" id="checkout-promo-code" class="order-summary__promo-input" 
                 placeholder="${i18n.t('cart.promo_placeholder') || 'Промокод'}" 
                 ${currentPromo ? 'disabled' : ''}>
          <button type="button" id="checkout-apply-promo" class="button button--secondary" 
                  ${currentPromo ? 'disabled' : ''}>
            ${i18n.t('cart.apply') || 'Применить'}
          </button>
        </div>
        
        ${currentPromo ? `
          <div class="order-summary__active-promo">
            ✅ ${i18n.t('cart.promo_applied') || 'Применён'}: <strong>${currentPromo.code}</strong>
            <button id="checkout-remove-promo" class="order-summary__remove-promo">✕</button>
          </div>
        ` : ''}
      </div>
    `;

    this.bindSummaryEvents();
  }

  /**
   * Привязка событий на сводке
   */
  bindSummaryEvents() {
    const applyBtn = document.getElementById('checkout-apply-promo');
    const promoInput = document.getElementById('checkout-promo-code');
    const removeBtn = document.getElementById('checkout-remove-promo');

    if (applyBtn && promoInput) {
      const newApplyBtn = applyBtn.cloneNode(true);
      applyBtn.parentNode.replaceChild(newApplyBtn, applyBtn);

      newApplyBtn.addEventListener('click', () => {
        const code = promoInput.value.trim().toUpperCase();
        if (code && promo.applyPromo(code)) {
          ui.showToast(i18n.t('cart.promo_applied') || 'Промокод применён!');
          this.renderSummary();
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
        this.renderSummary();
      });
    }
  }

  /**
   * Привязка событий формы
   */
  bindEvents() {
    const submitBtn = document.getElementById('submit-order-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => this.handleSubmit(e));
    }
  }

  /**
   * Обработка отправки заказа
   */
  async handleSubmit(e) {
    e.preventDefault();

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    // Валидация
    const name = document.getElementById('checkout-name')?.value.trim();
    const phone = document.getElementById('checkout-phone')?.value.trim();
    const email = document.getElementById('checkout-email')?.value.trim();
    const address = document.getElementById('checkout-address')?.value.trim();

    if (!name || !phone || !email || !address) {
      ui.showToast(i18n.t('checkout.fill_all_fields') || 'Заполните все обязательные поля', 'error');
      this.isSubmitting = false;
      return;
    }

    const cartItems = cart.getFullCart();
    const subtotal = cart.getCartTotal();
    const deliveryCost = promo.getDeliveryCost(subtotal);
    const discount = promo.getCurrentDiscount(subtotal);

    const order = {
      id: 'ORD-' + Date.now(),
      date: new Date().toISOString(),
      customer: {
        name: name,
        phone: phone,
        email: email
      },
      delivery: {
        city: document.getElementById('checkout-city')?.value || '',
        address: address,
        entrance: document.getElementById('checkout-entrance')?.value || '',
        floor: document.getElementById('checkout-floor')?.value || '',
        intercom: document.getElementById('checkout-intercom')?.value || '',
        comment: document.getElementById('checkout-comment')?.value || ''
      },
      payment: document.querySelector('input[name="payment"]:checked')?.value || 'card',
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      subtotal: subtotal,
      deliveryCost: deliveryCost,
      discount: discount,
      total: subtotal + deliveryCost - discount,
      promoCode: promo.getCurrentPromo()?.code || null,
      status: 'pending'
    };

    // Сохраняем заказ
    const orders = JSON.parse(localStorage.getItem('urban_orders') || '[]');
    orders.push(order);
    localStorage.setItem('urban_orders', JSON.stringify(orders));

    // Очищаем корзину и промокоды
    cart.clearCart();
    promo.clearPromo();

    ui.showToast(i18n.t('checkout.order_success') || 'Заказ оформлен! Спасибо за покупку!');

    // Перенаправление
    setTimeout(() => {
      window.location.href = `order-success.html?id=${order.id}`;
    }, 1500);

    this.isSubmitting = false;
  }
}

export { CheckoutPage };
