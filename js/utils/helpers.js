/**
 * @module helpers
 * @description Утилитарные функции
 */

/**
 * Форматирует число в цену с валютой
 * @param {number} price - Цена в рублях
 * @returns {string} Отформатированная цена
 */
export const formatPrice = (price) => {
  return price.toLocaleString('ru-RU') + ' ₽';
};

/**
 * Дебаунс функции
 * @param {Function} fn - Функция для дебаунса
 * @param {number} delay - Задержка в мс
 * @returns {Function} Дебаунснутая функция
 */
export const debounce = (fn, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Генерирует уникальный ID
 * @returns {string} Уникальный ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Экранирует HTML-спецсимволы
 * @param {string} str - Строка для экранирования
 * @returns {string}
 */
export const escapeHtml = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};