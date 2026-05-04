/**
 * @module cart
 * @description Логика управления корзиной
 */

import { storage } from './storage.js';
import { products } from '../data/products.js';

/**
 * @class CartModule
 */
class CartModule {
  constructor() {
    this.subscribers = [];
    this.initEventListeners();
  }

  /**
   * Инициализация обработчиков событий
   */
  initEventListeners() {
    window.addEventListener('storage', (e) => {
      if (e.key === storage.keys.CART) {
        this.notifySubscribers();
      }
    });
  }

  /**
   * Подписаться на обновления корзины
   * @param {Function} callback - Функция обратного вызова
   */
  subscribe(callback) {
    this.subscribers.push(callback);
  }

  /**
   * Уведомить подписчиков об изменениях
   */
  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.getFullCart()));
  }

  /**
   * Получить корзину с полными данными товаров
   * @returns {Array} Корзина с данными товаров
   */
  getFullCart() {
    const cart = storage.getCart();

    return cart.map(item => {
      const product = products.find(p => p.id === item.id);
      return product ? { ...product, quantity: item.quantity } : null;
    }).filter(Boolean);
  }

  /**
   * Получить количество товаров в корзине
   * @returns {number} Общее количество
   */
  getCartCount() {
    const cart = storage.getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Получить общую стоимость корзины
   * @returns {number} Общая сумма
   */
  getCartTotal() {
    const fullCart = this.getFullCart();
    return fullCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  /**
   * Добавить товар в корзину
   * @param {string} id - ID товара
   * @param {number} quantity - Количество (по умолчанию 1)
   * @returns {Array} Обновлённая корзина
   */
  addToCart(id, quantity = 1) {
    let cart = storage.getCart();
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ id, quantity });
    }

    storage.setCart(cart);
    this.notifySubscribers();

    return cart;
  }

  /**
   * Обновить количество товара
   * @param {string} id - ID товара
   * @param {number} delta - Изменение количества
   * @returns {Array} Обновлённая корзина
   */
  updateQuantity(id, delta) {
    let cart = storage.getCart();
    const itemIndex = cart.findIndex(i => i.id === id);

    if (itemIndex === -1) return cart;

    const newQuantity = cart[itemIndex].quantity + delta;

    if (newQuantity <= 0) {
      cart = cart.filter(i => i.id !== id);
    } else {
      cart[itemIndex].quantity = newQuantity;
    }

    storage.setCart(cart);
    this.notifySubscribers();

    return cart;
  }

  /**
   * Установить точное количество товара
   * @param {string} id - ID товара
   * @param {number} quantity - Новое количество
   * @returns {Array}
   */
  setQuantity(id, quantity) {
    if (quantity <= 0) {
      return this.removeFromCart(id);
    }

    let cart = storage.getCart();
    const itemIndex = cart.findIndex(i => i.id === id);

    if (itemIndex === -1) {
      cart.push({ id, quantity });
    } else {
      cart[itemIndex].quantity = quantity;
    }

    storage.setCart(cart);
    this.notifySubscribers();

    return cart;
  }

  /**
   * Удалить товар из корзины
   * @param {string} id - ID товара
   * @returns {Array} Обновлённая корзина
   */
  removeFromCart(id) {
    const cart = storage.getCart().filter(i => i.id !== id);
    storage.setCart(cart);
    this.notifySubscribers();

    return cart;
  }

  /**
   * Очистить корзину
   */
  clearCart() {
    storage.setCart([]);
    this.notifySubscribers();
  }

  /**
   * Проверить, есть ли товар в корзине
   * @param {string} id - ID товара
   * @returns {boolean}
   */
  isInCart(id) {
    const cart = storage.getCart();
    return cart.some(item => item.id === id);
  }

  /**
   * Получить количество конкретного товара
   * @param {string} id - ID товара
   * @returns {number}
   */
  getItemQuantity(id) {
    const cart = storage.getCart();
    const item = cart.find(i => i.id === id);
    return item ? item.quantity : 0;
  }
}

// Экспортируем единственный экземпляр
export const cart = new CartModule();