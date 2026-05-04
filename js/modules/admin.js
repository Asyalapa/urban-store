/**
 * @module admin
 * @description Админ-панель (демо-версия)
 * @author Anastasia M. (tg: @asyalapa)
 */

import { auth } from './auth.js';
import { cart } from './cart.js';
import { formatPrice } from '../utils/helpers.js';

class AdminModule {
  constructor() {
    this.container = null;
    this.orders = [];
  }

  /**
   * Инициализация админ-панели
   */
  init() {
    if (!auth.isAdmin()) {
      this.showAccessDenied();
      return;
    }

    this.loadData();
    this.render();
  }

  /**
   * Загрузка данных
   */
  loadData() {
    // Загружаем заказы
    this.orders = JSON.parse(localStorage.getItem('urban_orders') || '[]');

    // Получаем статистику корзины (для демо)
    const cartItems = cart.getFullCart();
    this.stats = {
      totalOrders: this.orders.length,
      totalRevenue: this.orders.reduce((sum, o) => sum + (o.total || 0), 0),
      averageOrder: this.orders.length ?
        this.orders.reduce((sum, o) => sum + (o.total || 0), 0) / this.orders.length : 0,
      pendingOrders: this.orders.filter(o => o.status === 'pending').length
    };
  }

  /**
   * Рендер админ-панели
   */
  render() {
    const container = document.getElementById('admin-container');
    if (!container) return;

    container.innerHTML = `
      <div class="admin-panel">
        <div class="admin-stats">
          <div class="admin-stats__card">
            <div class="admin-stats__value">${this.stats.totalOrders}</div>
            <div class="admin-stats__label">Всего заказов</div>
          </div>
          <div class="admin-stats__card">
            <div class="admin-stats__value">${formatPrice(this.stats.totalRevenue)}</div>
            <div class="admin-stats__label">Выручка</div>
          </div>
          <div class="admin-stats__card">
            <div class="admin-stats__value">${formatPrice(this.stats.averageOrder)}</div>
            <div class="admin-stats__label">Средний чек</div>
          </div>
          <div class="admin-stats__card">
            <div class="admin-stats__value">${this.stats.pendingOrders}</div>
            <div class="admin-stats__label">В обработке</div>
          </div>
        </div>
        
        <div class="admin-actions">
          <button class="button button--primary" id="reset-demo-data">Сбросить демо-данные</button>
        </div>
        
        <div class="admin-orders">
          <h2>Заказы</h2>
          <div class="admin-orders__table">
            ${this.renderOrdersTable()}
          </div>
        </div>
      </div>
    `;

    // Сброс данных
    document.getElementById('reset-demo-data')?.addEventListener('click', () => {
      if (confirm('Сбросить все демо-данные (заказы)?')) {
        localStorage.removeItem('urban_orders');
        localStorage.removeItem('urban_cart');
        localStorage.removeItem('urban_wishlist');
        window.location.reload();
      }
    });
  }

  /**
   * Рендер таблицы заказов
   */
  renderOrdersTable() {
    if (this.orders.length === 0) {
      return '<div class="admin-orders__empty">Нет заказов</div>';
    }

    return `
      <table>
        <thead>
          <tr><th>ID</th><th>Дата</th><th>Клиент</th><th>Сумма</th><th>Статус</th><th>Действия</th></tr>
        </thead>
        <tbody>
          ${this.orders.map(order => `
            <tr>
              <td>${order.id}</td>
              <td>${new Date(order.date).toLocaleDateString()}</td>
              <td>${order.customer?.name || order.customer?.email || '-'}</td>
              <td>${formatPrice(order.total)}</td>
              <td>
                <select class="order-status" data-id="${order.id}">
                  <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Ожидает</option>
                  <option value="paid" ${order.status === 'paid' ? 'selected' : ''}>Оплачен</option>
                  <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Отправлен</option>
                  <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Доставлен</option>
                  <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Отменён</option>
                </select>
              </td>
              <td><button class="button button--small view-order" data-id="${order.id}">Просмотр</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  /**
   * Показать доступ запрещён
   */
  showAccessDenied() {
    const container = document.getElementById('admin-container');
    if (container) {
      container.innerHTML = `
        <div class="admin-access-denied">
          <h2>⛔ Доступ запрещён</h2>
          <p>Только для администраторов</p>
          <a href="index.html" class="button button--primary">Вернуться на главную</a>
        </div>
      `;
    }
  }
}

export const admin = new AdminModule();