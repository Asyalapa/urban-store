/**
 * @module products-loader
 * @description Загружает товары из JSON (как с бэкенда)
 * @author Anastasia M. (tg: @asyalapa)
 */

let cached = null;

/**
 * Асинхронная загрузка товаров из JSON-файла
 * @returns {Promise<Array>} Массив товаров
 */
export async function loadProducts() {
  if (cached) return cached;

  try {
    const res = await fetch('./js/data/products.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    cached = await res.json();
    return cached;
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error);
    // Fallback: пробуем импортировать из products.js (старый формат)
    try {
      const { products } = await import('./products.js');
      cached = products;
      return cached;
    } catch {
      return [];
    }
  }
}