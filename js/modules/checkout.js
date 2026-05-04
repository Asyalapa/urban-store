/**
 * @module checkout
 * @description Форма оформления заказа
 * @author Anastasia M. (tg: @asyalapa)
 */

import { cart } from './cart.js';
import { auth } from './auth.js';
import { promo } from './promo.js';
import { ui } from './ui.js';
import { i18n } from './i18n.js';
import { formatPrice } from '../utils/helpers.js';

class CheckoutModule {
  constructor() {
    this.form = null;
    this.orderData = null;
  }

  /**
   * Инициализация формы
   */
  init() {
    this.renderForm();
    this.bindEvents();
    this.updateSummary();
  }

  /**
   * Рендер формы
   */
  renderForm() {
    const container = document.getElementById('checkout-container');
    if (!container) return;

    const user = auth.getUser();

    container.innerHTML = `
      <form id="checkout-form" class="checkout-form">
        <div class="checkout-form__section">
          <h3>Контактная информация</h3>
          
          <div class="checkout-form__row">
            <div class="checkout-form__field">
              <label>Имя *</label>
              <input type="text" id="checkout-name" value="${user?.name || ''}" required>
            </div>
            
            <div class="checkout-form__field">
              <label>Телефон *</label>
              <input type="tel" id="checkout-phone" placeholder="+7 (___) ___-__-__" required>
            </div>
          </div>
          
          <div class="checkout-form__field">
            <label>Email *</label>
            <input type="email" id="checkout-email" value="${user?.email || ''}" required>
          </div>
        </div>
        
        <div class="checkout-form__section">
          <h3>Адрес доставки</h3>
          
          <div class="checkout-form__field">
            <label>Город</label>
            <input type="text" id="checkout-city" placeholder="Москва" value="Москва">
          </div>
          
          <div class="checkout-form__field">
            <label>Улица, дом, квартира</label>
            <input type="text" id="checkout-address" placeholder="ул. Тверская, д. 1, кв. 1" required>
          </div>
          
          <div class="checkout-form__row">
            <div class="checkout-form__field">
              <label>Подъезд</label>
              <input type="text" id="checkout-entrance" placeholder="1">
            </div>
            
            <div class="checkout-form__field">
              <label>Этаж</label>
              <input type="text" id="checkout-floor" placeholder="3">
            </div>
            
            <div class="checkout-form__field">
              <label>Код домофона</label>
              <input type="text" id="checkout-intercom" placeholder="1234">
            </div>
          </div>
          
          <div class="checkout-form__field">
            <label>Комментарий к заказу</label>
            <textarea id="checkout-comment" rows="3" placeholder="Дополнительная информация"></textarea>
          </div>
        </div>
        
        <div class="checkout-form__section">
          <h3>Способ оплаты</h3>
          
          <div class="checkout-form__payment">
            <label class="payment-option">
              <input type="radio" name="payment" value="card" checked>
              <span>💳 Банковская карта (онлайн)</span>
            </label>
            <label class="payment-option">
              <input type="radio" name="payment" value="cash">
              <span>💰 Наличные при получении</span>
            </label>
            <label class="payment-option">
              <input type="radio" name="payment" value="sbp">
              <span>📱 СБП (Система быстрых платежей)</span>
            </label>
          </div>
        </div>
      </form>
    `;
  }

  /**
   * Привязка событий
   */
  bindEvents() {
    // Обновление сводки при изменении способа доставки
    const deliverySelect = document.getElementById('checkout-delivery');
    if (deliverySelect) {
      deliverySelect.addEventListener('change', () => this.updateSummary());
    }

    // Отправка формы
    const form = document.getElementById('checkout-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  /**
   * Обновить сводку заказа
   */
  updateSummary() {
    const summaryContainer = document.getElementById('order-summary');
    if (!summaryContainer) return;

    const cartItems = cart.getFullCart();
    const subtotal = cart.getCartTotal();
    const deliveryCost = promo.getDeliveryCost();
    const discount = promo.getCurrentDiscount(subtotal);
    const total = subtotal + deliveryCost - discount;

    summaryContainer.innerHTML = `
      <div class="order-summary">
        <h3>Ваш заказ</h3>
        
        <div class="order-summary__items">
          ${cartItems.map(item => `
            <div class="order-summary__item">
              <span>${item.name} × ${item.quantity}</span>
              <span>${formatPrice(item.price * item.quantity)}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="order-summary__row">
          <span>Товары (${cartItems.length} шт.)</span>
          <span>${formatPrice(subtotal)}</span>
        </div>
        
        <div class="order-summary__row">
          <span>Доставка</span>
          <span>${deliveryCost === 0 ? 'Бесплатно' : formatPrice(deliveryCost)}</span>
        </div>
        
        ${discount > 0 ? `
          <div class="order-summary__row order-summary__row--discount">
            <span>Скидка</span>
            <span>-${formatPrice(discount)}</span>
          </div>
        ` : ''}
        
        <div class="order-summary__total">
          <span>Итого к оплате</span>
          <span>${formatPrice(total)}</span>
        </div>
        
        <div class="order-summary__promo">
          <input type="text" id="promo-code" placeholder="Промокод" class="order-summary__promo-input">
          <button type="button" id="apply-promo" class="button button--secondary">Применить</button>
        </div>
      </div>
    `;

    // Привязываем промокод
    const applyBtn = document.getElementById('apply-promo');
    const promoInput = document.getElementById('promo-code');

    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const code = promoInput?.value.trim().toUpperCase();
        if (code && promo.applyPromo(code)) {
          promoInput.value = '';
          this.updateSummary();
          ui.showToast('Промокод применён!');
        } else {
          ui.showToast('Неверный промокод', 'error');
        }
      });
    }
  }

  /**
   * Обработка отправки формы
   */
  async handleSubmit(e) {
    e.preventDefault();

    // Собираем данные формы
    const order = {
      id: 'ORD-' + Date.now(),
      date: new Date().toISOString(),
      customer: {
        name: document.getElementById('checkout-name')?.value,
        phone: document.getElementById('checkout-phone')?.value,
        email: document.getElementById('checkout-email')?.value
      },
      delivery: {
        city: document.getElementById('checkout-city')?.value,
        address: document.getElementById('checkout-address')?.value,
        entrance: document.getElementById('checkout-entrance')?.value,
        floor: document.getElementById('checkout-floor')?.value,
        intercom: document.getElementById('checkout-intercom')?.value,
        comment: document.getElementById('checkout-comment')?.value
      },
      payment: document.querySelector('input[name="payment"]:checked')?.value,
      items: cart.getFullCart(),
      subtotal: subtotal,
      deliveryCost: promo.getDeliveryCost(subtotal),
      discount: promo.getCurrentDiscount(subtotal),
      total: subtotal + promo.getDeliveryCost(subtotal) - promo.getCurrentDiscount(subtotal),
      promoCode: promo.getCurrentPromo()?.code || null,
      status: 'pending'
    };

    // Сохраняем в localStorage (имитация отправки)
    const orders = JSON.parse(localStorage.getItem('urban_orders') || '[]');
    orders.push(order);
    localStorage.setItem('urban_orders', JSON.stringify(orders));

    // Очищаем корзину и промокоды
    cart.clearCart();
    promo.clearPromo();

    ui.showToast('Заказ оформлен! Спасибо за покупку!');

    // Перенаправление на страницу успеха
    setTimeout(() => {
      window.location.href = 'order-success.html?id=' + order.id;
    }, 1500);
  }
}

export const checkout = new CheckoutModule();