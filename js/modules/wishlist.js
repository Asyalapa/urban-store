/**
 * @module wishlist
 * @description Логика управления избранным
 */

import { storage } from './storage.js';
import { products } from '../data/products.js';

/**
 * @class WishlistModule
 */
class WishlistModule {
  constructor() {
    this.subscribers = [];
    this.initEventListeners();
  }

  /**
   * Инициализация обработчиков событий
   */
  initEventListeners() {
    window.addEventListener('storage', (e) => {
      if (e.key === storage.keys.WISHLIST) {
        this.notifySubscribers();
      }
    });
  }

  /**
   * Подписаться на обновления
   * @param {Function} callback
   */
  subscribe(callback) {
    this.subscribers.push(callback);
  }

  /**
   * Уведомить подписчиков
   */
  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.getWishlistProducts()));
  }

  /**
   * Получить список избранного
   * @returns {Array} Массив ID товаров
   */
  getWishlist() {
    return storage.getWishlist();
  }

  /**
   * Получить полные данные избранных товаров
   * @returns {Array} Товары из избранного
   */
  getWishlistProducts() {
    const ids = storage.getWishlist();
    return products.filter(p => ids.includes(p.id));
  }

  /**
   * Получить количество товаров в избранном
   * @returns {number}
   */
  getWishlistCount() {
    return storage.getWishlist().length;
  }

  /**
   * Переключить статус избранного
   * @param {string} id - ID товара
   * @returns {boolean} Новый статус (true - добавлен, false - удалён)
   */
  toggleWishlist(id) {
    let list = storage.getWishlist();

    const isExist = list.includes(id);

    if (isExist) {
      list = list.filter(i => i !== id);
    } else {
      list.push(id);
    }

    storage.setWishlist(list);
    this.notifySubscribers();

    return !isExist;
  }

  /**
   * Добавить в избранное
   * @param {string} id - ID товара
   * @returns {boolean}
   */
  addToWishlist(id) {
    const list = storage.getWishlist();

    if (!list.includes(id)) {
      list.push(id);
      storage.setWishlist(list);
      this.notifySubscribers();
      return true;
    }

    return false;
  }

  /**
   * Удалить из избранного
   * @param {string} id - ID товара
   * @returns {boolean}
   */
  removeFromWishlist(id) {
    const list = storage.getWishlist().filter(i => i !== id);
    storage.setWishlist(list);
    this.notifySubscribers();

    return true;
  }

  /**
   * Очистить избранное
   */
  clearWishlist() {
    storage.setWishlist([]);
    this.notifySubscribers();
  }

  /**
   * Проверить, есть ли товар в избранном
   * @param {string} id - ID товара
   * @returns {boolean}
   */
  isInWishlist(id) {
    return storage.getWishlist().includes(id);
  }

  /**
   * Добавить все товары из избранного в корзину и очистить избранное
   * @param {Function} addToCartFn - Функция добавления в корзину
   * @returns {number} Количество добавленных товаров
   */
  addAllToCart(addToCartFn) {
    const wishlist = this.getWishlist();

    wishlist.forEach(id => {
      addToCartFn(id, 1);
    });

    this.clearWishlist();
    return wishlist.length;
  }
}

// Экспортируем единственный экземпляр
export const wishlist = new WishlistModule();