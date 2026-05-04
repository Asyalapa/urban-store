/**
 * @module promo
 * @description Промокоды и доставка
 * @author Anastasia M. (tg: @asyalapa)
 */

class PromoModule {
  constructor() {
    this.promoCodes = {
      'WELCOME10': { discount: 10, type: 'percent', description: 'Скидка 10%' },
      'WELCOME15': { discount: 15, type: 'percent', description: 'Скидка 15%' },
      'FREESHIP': { discount: 500, type: 'fixed', description: 'Скидка 500₽' },
      'URBAN2024': { discount: 20, type: 'percent', description: 'Скидка 20%' }
    };

    this.currentPromo = null;
    this.deliveryCost = 350; // Стоимость доставки по умолчанию
    this.freeShippingThreshold = 3000; // Бесплатная доставка от 3000₽
  }

  /**
   * Инициализация
   */
  init() {
    this.loadFromStorage();
  }

  /**
   * Загрузить промокод из localStorage
   */
  loadFromStorage() {
    const saved = localStorage.getItem('urban_promo');
    if (saved) {
      this.currentPromo = JSON.parse(saved);
    }
  }

  /**
   * Сохранить промокод
   */
  saveToStorage() {
    if (this.currentPromo) {
      localStorage.setItem('urban_promo', JSON.stringify(this.currentPromo));
    } else {
      localStorage.removeItem('urban_promo');
    }
  }

  /**
   * Применить промокод
   * @param {string} code - Код промокода
   * @returns {boolean}
   */
  applyPromo(code) {
    const promo = this.promoCodes[code.toUpperCase()];

    if (promo) {
      this.currentPromo = { code: code.toUpperCase(), ...promo };
      this.saveToStorage();
      return true;
    }

    return false;
  }

  /**
   * Получить текущий промокод
   */
  getCurrentPromo() {
    return this.currentPromo;
  }

  /**
   * Получить размер скидки
   * @param {number} subtotal - Сумма заказа (по умолчанию 0)
   * @returns {number}
   */
  getDiscountAmount(subtotal = 0) {
    if (!this.currentPromo) return 0;

    if (this.currentPromo.type === 'percent') {
      return Math.floor(subtotal * this.currentPromo.discount / 100);
    } else {
      return Math.min(this.currentPromo.discount, subtotal);
    }
  }

  /**
   * Получить стоимость доставки
   * @param {number} subtotal - Сумма заказа
   * @returns {number}
   */
  getDeliveryCost(subtotal = null) {
    if (subtotal !== null && subtotal >= this.freeShippingThreshold) {
      return 0;
    }
    return this.deliveryCost;
  }

  /**
   * Очистить промокод
   */
  clearPromo() {
    this.currentPromo = null;
    this.saveToStorage();
  }

  /**
   * Получить список доступных промокодов (для демо)
   */
  getAvailablePromos() {
    return Object.entries(this.promoCodes).map(([code, data]) => ({
      code,
      ...data
    }));
  }
}

export const promo = new PromoModule();