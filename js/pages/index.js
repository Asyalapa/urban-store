/**
 * @module index-page
 * @description Главная страница с каталогом товаров
 * @author Anastasia M. (tg: @asyalapa)
 */

import { products } from '../data/products.js';
import { catalog } from '../modules/catalog.js';
import { cart } from '../modules/cart.js';
import { wishlist } from '../modules/wishlist.js';
import { ui } from '../modules/ui.js';
import { initCommon } from '../common.js';
import { initModalOnCards } from '../modules/modal.js';
import { initCustomSelects } from '../modules/custom-select.js';

class IndexPage {
  constructor() {
    this.container = null;
    this.isInitialized = false;
  }

  /**
   * Инициализация страницы
   */
  async init() {
    // Общая инициализация
    await initCommon({ skipCounters: false });

    // Инициализация кастомного селектора
    initCustomSelects();

    // Получаем контейнер для товаров
    this.container = document.getElementById('products-container');
    if (!this.container) return;

    // Инициализация каталога
    catalog.init(this.container);

    // Инициализация модального окна на карточках
    initModalOnCards(this.container, products);

    // Инициализация обработчиков
    this.initEventHandlers();

    this.isInitialized = true;
  }

  /**
   * Инициализация обработчиков событий
   */
  initEventHandlers() {
    // Открытие дровера по кнопке корзины
    const cartBtn = document.querySelector('.header__action-button');
    if (cartBtn) {
      cartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        ui.openDrawer(cart.getFullCart(), (items) => {
          catalog.renderDrawerContent(items);
        });
      });
    }

    // Обработка ошибок загрузки изображений
    if (this.container) {
      this.container.addEventListener('error', (e) => {
        const img = e.target.closest('img');
        if (img && img.dataset.src) {
          img.src = './images/placeholder.webp';
        }
      }, true);
    }
  }
}

export { IndexPage };
