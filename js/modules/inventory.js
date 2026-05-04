/**
 * @module inventory
 * @description Управление инвентарем товаров (остатками на складе)
 * @author Anastasia M. (tg: @asyalapa)
 */

import { storage } from './storage.js';
import { CONFIG } from '../config.js';

/**
 * @class InventoryModule
 */
class InventoryModule {
  constructor() {
    this.inventory = this.loadInventory();
  }

  /**
   * Загрузить инвентарь из localStorage
   * @returns {Object} Объект { productId: quantity }
   */
  loadInventory() {
    const stored = localStorage.getItem('urban_inventory');
    return stored ? JSON.parse(stored) : {};
  }

  /**
   * Сохранить инвентарь в localStorage
   */
  saveInventory() {
    localStorage.setItem('urban_inventory', JSON.stringify(this.inventory));
  }

  /**
   * Получить количество товара на складе
   * @param {string} productId - ID товара
   * @param {number} defaultQty - Количество по умолчанию
   * @returns {number}
   */
  getQuantity(productId, defaultQty = 100) {
    return this.inventory[productId] !== undefined ? this.inventory[productId] : defaultQty;
  }

  /**
   * Установить количество товара на складе
   * @param {string} productId - ID товара
   * @param {number} quantity - Новое количество
   */
  setQuantity(productId, quantity) {
    if (quantity < 0) quantity = 0;
    this.inventory[productId] = Math.floor(quantity);
    this.saveInventory();
  }

  /**
   * Увеличить количество товара
   * @param {string} productId - ID товара
   * @param {number} delta - На сколько увеличить
   * @returns {number} Новое количество
   */
  increase(productId, delta = 1) {
    const current = this.getQuantity(productId);
    const newQty = current + delta;
    this.setQuantity(productId, newQty);
    return newQty;
  }

  /**
   * Уменьшить количество товара
   * @param {string} productId - ID товара
   * @param {number} delta - На сколько уменьшить
   * @returns {boolean} Была ли операция успешной
   */
  decrease(productId, delta = 1) {
    const current = this.getQuantity(productId);
    if (current < delta) {
      return false; // Недостаточно товара
    }
    const newQty = current - delta;
    this.setQuantity(productId, newQty);
    return true;
  }

  /**
   * Получить весь инвентарь
   * @returns {Object}
   */
  getAll() {
    return { ...this.inventory };
  }

  /**
   * Очистить весь инвентарь
   */
  clear() {
    this.inventory = {};
    this.saveInventory();
  }

  /**
   * Восстановить значения по умолчанию для всех товаров
   * @param {number} defaultQty - Количество для восстановления
   */
  resetToDefault(defaultQty = 100) {
    this.clear();
    this.saveInventory();
  }
}

// Экспортируем синглтон
export const inventory = new InventoryModule();
