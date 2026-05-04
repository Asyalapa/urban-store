/**
 * @module admin-page
 * @description Админ-панель
 * @author Anastasia M. (tg: @asyalapa)
 */

import { auth } from '../modules/auth.js';
import { cart } from '../modules/cart.js';
import { initCommon } from '../common.js';
import { ui } from '../modules/ui.js';
import { formatPrice } from '../utils/helpers.js';
import { i18n } from '../modules/i18n.js';

class AdminPage {
  constructor() {
    this.orders = [];
    this.stats = {};
  }

  /**
   * Инициализация страницы
   */
  async init() {
    // Проверка прав администратора
    if (!auth.isAuthenticated()) {
      localStorage.setItem('redirect_after_login', 'admin.html');
      window.location.href = 'login.html';
      return;
    }

    if (!auth.isAdmin()) {
      ui.showToast(i18n.t('admin.access_denied') || 'Доступ запрещён', 'error');
      setTimeout(() => window.location.href = 'index.html', 1500);
      return;
    }

    // Общая инициализация
    await initCommon({ skipCounters: true });

    // Загрузка данных
    this.loadData();

    // Рендер
    this.render();

    // Привязка событий
    this.bindEvents();
  }

  /**
   * Загрузка данных
   */
  loadData() {
    this.orders = JSON.parse(localStorage.getItem('urban_orders') || '[]');

    const totalRevenue = this.orders.reduce((sum, o) => sum + (o.total || 0), 0);

    this.stats = {
      totalOrders: this.orders.length,
      totalRevenue: totalRevenue,
      averageOrder: this.orders.length ? totalRevenue / this.orders.length : 0,
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
            <div class="admin-stats__label">${i18n.t('admin.total_orders') || 'Всего заказов'}</div>
          </div>
          <div class="admin-stats__card">
            <div class="admin-stats__value">${formatPrice(this.stats.totalRevenue)}</div>
            <div class="admin-stats__label">${i18n.t('admin.revenue') || 'Выручка'}</div>
          </div>
          <div class="admin-stats__card">
            <div class="admin-stats__value">${formatPrice(this.stats.averageOrder)}</div>
            <div class="admin-stats__label">${i18n.t('admin.average_order') || 'Средний чек'}</div>
          </div>
          <div class="admin-stats__card">
            <div class="admin-stats__value">${this.stats.pendingOrders}</div>
            <div class="admin-stats__label">${i18n.t('admin.pending') || 'В обработке'}</div>
          </div>
        </div>
        
        <div class="admin-actions">
          <button id="reset-demo-data" class="button button--secondary">
            🔄 ${i18n.t('admin.reset_demo') || 'Сбросить демо-данные'}
          </button>
        </div>
        
        <div class="admin-orders">
          <h2>${i18n.t('admin.orders') || 'Заказы'}</h2>
          <div class="admin-orders__table">
            ${this.renderOrdersTable()}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Рендер таблицы заказов
   */
  renderOrdersTable() {
    if (this.orders.length === 0) {
      return `<div class="admin-orders__empty">${i18n.t('admin.no_orders') || 'Нет заказов'}</div>`;
    }

    return `
      <table>
        <thead>
          <tr>
            <th>${i18n.t('admin.order_id') || 'ID'}</th>
            <th>${i18n.t('admin.date') || 'Дата'}</th>
            <th>${i18n.t('admin.customer') || 'Клиент'}</th>
            <th>${i18n.t('admin.total') || 'Сумма'}</th>
            <th>${i18n.t('admin.status') || 'Статус'}</th>
            <th>${i18n.t('admin.actions') || 'Действия'}</th>
          </tr>
        </thead>
        <tbody>
          ${this.orders.map(order => `
            <tr data-order-id="${order.id}">
              <td>${order.id}</td>
              <td>${new Date(order.date).toLocaleDateString()}</td>
              <td>${this.escapeHtml(order.customer?.name || order.customer?.email || '-')}</td>
              <td>${formatPrice(order.total)}</td>
              <td>
                <select class="order-status-select" data-id="${order.id}">
                  <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>${i18n.t('admin.status_pending') || 'Ожидает'}</option>
                  <option value="paid" ${order.status === 'paid' ? 'selected' : ''}>${i18n.t('admin.status_paid') || 'Оплачен'}</option>
                  <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>${i18n.t('admin.status_shipped') || 'Отправлен'}</option>
                  <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>${i18n.t('admin.status_delivered') || 'Доставлен'}</option>
                  <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>${i18n.t('admin.status_cancelled') || 'Отменён'}</option>
                </select>
              </td>
              <td>
                <button class="button button--small view-order-btn" data-id="${order.id}">
                  ${i18n.t('admin.view') || 'Просмотр'}
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  /**
   * Привязка событий
   */
  bindEvents() {
    // Сброс демо-данных
    const resetBtn = document.getElementById('reset-demo-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm(i18n.t('admin.reset_confirm') || 'Сбросить все демо-данные (заказы, корзину, избранное)?')) {
          localStorage.removeItem('urban_orders');
          localStorage.removeItem('urban_cart');
          localStorage.removeItem('urban_wishlist');
          window.location.reload();
        }
      });
    }

    // Изменение статуса заказа
    const statusSelects = document.querySelectorAll('.order-status-select');
    statusSelects.forEach(select => {
      select.addEventListener('change', (e) => {
        const orderId = select.dataset.id;
        const newStatus = select.value;

        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          this.orders[orderIndex].status = newStatus;
          localStorage.setItem('urban_orders', JSON.stringify(this.orders));
          ui.showToast(i18n.t('admin.status_updated') || 'Статус обновлён');
        }
      });
    });

    // Просмотр заказа
    const viewBtns = document.querySelectorAll('.view-order-btn');
    viewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.dataset.id;
        this.showOrderDetails(orderId);
      });
    });
  }

  /**
   * Показать детали заказа
   */
  showOrderDetails(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    const itemsHtml = order.items.map(item => `
      <div class="order-detail__item">
        <span>${this.escapeHtml(item.name)} × ${item.quantity}</span>
        <span>${formatPrice(item.price * item.quantity)}</span>
      </div>
    `).join('');

    // Простой alert для демо (можно заменить на модалку)
    alert(`
Заказ: ${order.id}
Дата: ${new Date(order.date).toLocaleString()}
Клиент: ${order.customer?.name}
Email: ${order.customer?.email}
Телефон: ${order.customer?.phone}
Адрес: ${order.delivery?.address}
Сумма: ${formatPrice(order.total)}
Статус: ${order.status}
    `);
  }

  /**
   * Экранирование HTML
   */
  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

export { AdminPage };
