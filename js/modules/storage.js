/**
 * @module storage
 * @description Единый модуль для работы с localStorage
 * @author Anastasia M. (tg: @asyalapa)
 */

import { CONFIG } from '../config.js';

/**
 * @class StorageModule
 */
class StorageModule {
  constructor() {
    this.keys = CONFIG.STORAGE_KEYS;
  }

  /**
   * Получить данные из localStorage
   * @param {string} key - Ключ хранилища
   * @param {*} defaultValue - Значение по умолчанию
   * @returns {*} Данные или defaultValue
   */
  get(key, defaultValue = []) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Storage read error for key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Сохранить данные в localStorage
   * @param {string} key - Ключ хранилища
   * @param {*} value - Данные для сохранения
   * @returns {boolean} Успех операции
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Storage save error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Удалить данные из localStorage
   * @param {string} key - Ключ хранилища
   * @returns {boolean} Успех операции
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Storage remove error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Очистить всё хранилище приложения
   */
  clearAll() {
    Object.values(this.keys).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Cart specific
  getCart() {
    return this.get(this.keys.CART, []);
  }

  setCart(cart) {
    return this.set(this.keys.CART, cart);
  }

  // Wishlist specific
  getWishlist() {
    return this.get(this.keys.WISHLIST, []);
  }

  setWishlist(list) {
    return this.set(this.keys.WISHLIST, list);
  }

  // Cookie consent
  getCookieConsent() {
    return this.get(this.keys.COOKIE_CONSENT, null);
  }

  setCookieConsent(value) {
    return this.set(this.keys.COOKIE_CONSENT, value);
  }
}

// Создаём и экспортируем единственный экземпляр
export const storage = new StorageModule();