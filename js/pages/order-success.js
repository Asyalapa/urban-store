/**
 * @module order-success-page
 * @description Страница успешного оформления заказа
 * @author Anastasia M. (tg: @asyalapa)
 */

import { initCommon } from '../common.js';
import { i18n } from '../modules/i18n.js';

class OrderSuccessPage {
  constructor() {
    this.orderId = null;
  }

  async init() {
    await initCommon({ skipCounters: true });

    // Получаем ID заказа из URL
    const urlParams = new URLSearchParams(window.location.search);
    this.orderId = urlParams.get('id');

    this.render();
  }

  render() {
    const container = document.getElementById('order-success-container');
    if (!container) return;

    container.innerHTML = `
      <div class="order-success">
        <div class="order-success__icon">🎉</div>
        <h1 class="order-success__title">${i18n.t('checkout.thanks') || 'Спасибо за заказ!'}</h1>
        <p class="order-success__message">
          ${i18n.t('checkout.order_placed') || 'Ваш заказ успешно оформлен.'}
          ${this.orderId ? `<br>${i18n.t('checkout.order_number') || 'Номер заказа'}: <strong>${this.orderId}</strong>` : ''}
        </p>
        <div class="order-success__actions">
          <a href="index.html" class="button button--primary">
            ${i18n.t('cart.go_to_cart') || 'Продолжить покупки'}
          </a>
        </div>
      </div>
    `;
  }
}

export { OrderSuccessPage };
